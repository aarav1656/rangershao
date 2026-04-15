"""
Portfolio allocation optimizers for DeFi yield allocation.
Includes convex optimization, simplified RL, and ensemble approaches.
"""

import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from scipy.optimize import minimize

from ml.config import AllocationConfig

logger = logging.getLogger(__name__)


class ConvexAllocator:
    """
    Convex portfolio optimizer using scipy.
    Maximizes risk-adjusted return subject to allocation constraints.
    """

    def __init__(self, config: AllocationConfig = AllocationConfig()):
        self.config = config

    def allocate(
        self,
        predicted_apys: np.ndarray,
        cov_matrix: np.ndarray,
        pool_ids: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Compute optimal allocation weights.

        Args:
            predicted_apys: (n_pools,) predicted APY for each pool
            cov_matrix: (n_pools, n_pools) covariance matrix of historical returns
            pool_ids: optional pool identifiers for output dict

        Returns:
            Dict mapping pool_id (or index) to weight
        """
        n = len(predicted_apys)
        if n == 0:
            raise ValueError("No pools to allocate across")

        # Ensure covariance matrix is positive semi-definite
        cov_matrix = (cov_matrix + cov_matrix.T) / 2
        eigvals = np.linalg.eigvalsh(cov_matrix)
        if eigvals.min() < 0:
            cov_matrix += (-eigvals.min() + 1e-8) * np.eye(n)

        def objective(weights):
            portfolio_return = np.dot(weights, predicted_apys)
            portfolio_variance = weights @ cov_matrix @ weights
            # Negative because scipy minimizes
            return -(portfolio_return - self.config.risk_lambda * portfolio_variance)

        # Constraints
        constraints = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
        ]

        # Bounds
        bounds = [(self.config.min_single, self.config.max_single)] * n

        # Check feasibility: n * min_single must be <= 1.0
        if n * self.config.min_single > 1.0:
            # Relax min constraint
            effective_min = max(0.01, 1.0 / n - 0.05)
            bounds = [(effective_min, self.config.max_single)] * n

        # Initial weights: equal
        x0 = np.ones(n) / n

        result = minimize(
            objective,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 500, "ftol": 1e-10},
        )

        if not result.success:
            logger.warning("Optimization did not converge: %s. Using equal weights.", result.message)
            weights = np.ones(n) / n
        else:
            weights = result.x

        # Ensure constraints are satisfied
        weights = np.clip(weights, 0, 1)
        weights = weights / weights.sum()

        if pool_ids is None:
            pool_ids = [str(i) for i in range(n)]

        return {pid: float(w) for pid, w in zip(pool_ids, weights)}


class ActorCritic(nn.Module):
    """Simple actor-critic network for RL-based allocation."""

    def __init__(self, state_dim: int, n_pools: int, hidden_dim: int = 64):
        super().__init__()
        self.n_pools = n_pools

        # Shared backbone
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )

        # Actor: outputs Dirichlet concentration parameters
        self.actor = nn.Sequential(
            nn.Linear(hidden_dim, n_pools),
            nn.Softplus(),  # Ensure positive concentrations
        )

        # Critic: outputs state value
        self.critic = nn.Linear(hidden_dim, 1)

    def forward(self, state: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        shared_out = self.shared(state)
        concentrations = self.actor(shared_out) + 1.0  # Shift to ensure > 1
        value = self.critic(shared_out)
        return concentrations, value

    def sample_action(self, state: torch.Tensor) -> Tuple[np.ndarray, torch.Tensor, torch.Tensor]:
        concentrations, value = self.forward(state)
        dist = torch.distributions.Dirichlet(concentrations)
        action = dist.sample()
        log_prob = dist.log_prob(action)
        return action.detach().numpy(), log_prob, value


class RLAllocator:
    """
    Simplified PPO-style RL allocator.
    Uses Dirichlet-parameterized actions for constraint satisfaction.
    """

    def __init__(
        self,
        n_pools: int,
        config: AllocationConfig = AllocationConfig(),
        lr: float = 3e-4,
    ):
        self.n_pools = n_pools
        self.config = config
        # State: current_weights (n_pools) + predicted_apys (n_pools) + risk_metrics (n_pools)
        state_dim = n_pools * 3
        self.model = ActorCritic(state_dim, n_pools)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        self.gamma = 0.99
        self.eps_clip = 0.2

    def _build_state(
        self,
        current_weights: np.ndarray,
        predicted_apys: np.ndarray,
        risk_metrics: np.ndarray,
    ) -> torch.Tensor:
        state = np.concatenate([current_weights, predicted_apys, risk_metrics])
        return torch.tensor(state, dtype=torch.float32).unsqueeze(0)

    def allocate(
        self,
        current_weights: np.ndarray,
        predicted_apys: np.ndarray,
        risk_metrics: np.ndarray,
        pool_ids: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Get allocation from the RL policy.
        """
        state = self._build_state(current_weights, predicted_apys, risk_metrics)

        self.model.eval()
        with torch.no_grad():
            concentrations, _ = self.model(state)
            dist = torch.distributions.Dirichlet(concentrations)
            # Use mean for deterministic inference
            weights = dist.mean.squeeze().numpy()

        # Enforce constraints
        weights = self._enforce_constraints(weights)

        if pool_ids is None:
            pool_ids = [str(i) for i in range(self.n_pools)]

        return {pid: float(w) for pid, w in zip(pool_ids, weights)}

    def _enforce_constraints(self, weights: np.ndarray) -> np.ndarray:
        """Project weights to satisfy min/max constraints."""
        weights = np.clip(weights, self.config.min_single, self.config.max_single)
        # Re-normalize
        if weights.sum() > 0:
            weights = weights / weights.sum()
        else:
            weights = np.ones_like(weights) / len(weights)
        return weights

    def train_step(
        self,
        states: List[np.ndarray],
        actions: List[np.ndarray],
        rewards: List[float],
        old_log_probs: List[float],
    ) -> float:
        """Single PPO training step on a batch of transitions."""
        self.model.train()
        total_loss = 0.0

        for state, action, reward, old_lp in zip(states, actions, rewards, old_log_probs):
            state_t = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
            action_t = torch.tensor(action, dtype=torch.float32).unsqueeze(0)

            concentrations, value = self.model(state_t)
            dist = torch.distributions.Dirichlet(concentrations)
            new_lp = dist.log_prob(action_t)

            # PPO clipped objective
            ratio = torch.exp(new_lp - old_lp)
            advantage = reward - value.detach().item()
            surr1 = ratio * advantage
            surr2 = torch.clamp(ratio, 1 - self.eps_clip, 1 + self.eps_clip) * advantage

            actor_loss = -torch.min(surr1, surr2)
            critic_loss = F.mse_loss(value.squeeze(), torch.tensor([reward], dtype=torch.float32))

            loss = actor_loss + 0.5 * critic_loss
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()

            total_loss += loss.item()

        return total_loss / max(len(states), 1)


class EnsembleAllocator:
    """
    Combines ConvexAllocator and RLAllocator with configurable blending.
    """

    def __init__(
        self,
        n_pools: int,
        config: AllocationConfig = AllocationConfig(),
    ):
        self.config = config
        self.n_pools = n_pools
        self.convex = ConvexAllocator(config)
        self.rl = RLAllocator(n_pools, config)
        self.blend = config.ensemble_blend  # Weight for convex

    def allocate(
        self,
        predicted_apys: np.ndarray,
        cov_matrix: np.ndarray,
        current_weights: Optional[np.ndarray] = None,
        risk_metrics: Optional[np.ndarray] = None,
        pool_ids: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Blended allocation from both optimizers.
        """
        if pool_ids is None:
            pool_ids = [str(i) for i in range(len(predicted_apys))]

        # Convex allocation
        convex_alloc = self.convex.allocate(predicted_apys, cov_matrix, pool_ids)

        # RL allocation
        if current_weights is None:
            current_weights = np.ones(self.n_pools) / self.n_pools
        if risk_metrics is None:
            # Use diagonal of cov matrix as risk proxy
            risk_metrics = np.sqrt(np.diag(cov_matrix))

        rl_alloc = self.rl.allocate(current_weights, predicted_apys, risk_metrics, pool_ids)

        # Blend
        blended = {}
        for pid in pool_ids:
            w = self.blend * convex_alloc[pid] + (1 - self.blend) * rl_alloc[pid]
            blended[pid] = w

        # Re-normalize
        total = sum(blended.values())
        if total > 0:
            blended = {k: v / total for k, v in blended.items()}

        return blended
