"""
LLM reasoning fallback for allocation decisions via OpenRouter.
Used when model confidence is low, regime change detected, or model fails.
"""

import json
import logging
import re
from typing import Dict, List, Optional

from openai import OpenAI

from ml.config import AllocationConfig, OpenRouterConfig

logger = logging.getLogger(__name__)


def _build_prompt(
    pool_data: List[Dict],
    market_context: Optional[str] = None,
    config: AllocationConfig = AllocationConfig(),
) -> str:
    """Construct the allocation prompt with pool data and constraints."""
    pool_summary = []
    for p in pool_data:
        pool_summary.append(
            f"- {p.get('project', 'unknown')} / {p.get('symbol', '?')}: "
            f"APY={p.get('apy', 0):.2f}%, "
            f"TVL=${p.get('tvlUsd', 0):,.0f}, "
            f"7d_trend={p.get('apy_momentum_7', 0):+.2f}%, "
            f"volatility={p.get('apy_roll_std_7', 0):.2f}"
        )

    pools_text = "\n".join(pool_summary)
    pool_ids = [p.get("pool_id", str(i)) for i, p in enumerate(pool_data)]

    prompt = f"""You are a DeFi yield optimization specialist for Solana lending protocols.

## Current Pool Data
{pools_text}

## Market Context
{market_context or "No additional market context available."}

## Constraints
- Allocate across these pool IDs: {pool_ids}
- Each allocation weight must be between {config.min_single} and {config.max_single}
- All weights must sum to exactly 1.0
- Prioritize risk-adjusted returns (higher APY with lower volatility preferred)
- Consider TVL as a liquidity/safety indicator
- Account for recent trends (momentum)

## Instructions
Analyze the pools and provide an optimal allocation. Respond with ONLY a JSON object in this exact format:
{{
    "reasoning": "Brief explanation of your allocation strategy",
    "weights": {{
        "<pool_id>": <weight>,
        ...
    }}
}}

The weights must satisfy all constraints above. Be precise with the numbers."""

    return prompt


def get_llm_allocation(
    pool_data: List[Dict],
    market_context: Optional[str] = None,
    or_config: OpenRouterConfig = OpenRouterConfig(),
    alloc_config: AllocationConfig = AllocationConfig(),
) -> Dict[str, float]:
    """
    Get allocation recommendation from LLM via OpenRouter.

    Args:
        pool_data: List of dicts with pool info (project, symbol, apy, tvlUsd, etc.)
        market_context: Optional string with additional market context
        or_config: OpenRouter configuration
        alloc_config: Allocation constraints

    Returns:
        Dict mapping pool_id to weight
    """
    client = OpenAI(
        base_url=or_config.base_url,
        api_key=or_config.api_key,
    )

    prompt = _build_prompt(pool_data, market_context, alloc_config)

    logger.info("Requesting LLM allocation via %s", or_config.model)

    response = client.chat.completions.create(
        model=or_config.model,
        messages=[
            {
                "role": "system",
                "content": "You are a quantitative DeFi portfolio optimizer. Respond only with valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=or_config.max_tokens,
        temperature=or_config.temperature,
    )

    content = response.choices[0].message.content.strip()

    # Parse JSON from response (handle markdown code blocks)
    json_match = re.search(r"\{[\s\S]*\}", content)
    if not json_match:
        raise ValueError(f"No JSON found in LLM response: {content[:200]}")

    parsed = json.loads(json_match.group())
    weights = parsed.get("weights", {})
    reasoning = parsed.get("reasoning", "")

    if not weights:
        raise ValueError("LLM returned empty weights")

    logger.info("LLM reasoning: %s", reasoning)

    # Validate constraints
    weights = _validate_weights(weights, pool_data, alloc_config)

    return weights


def _validate_weights(
    weights: Dict[str, float],
    pool_data: List[Dict],
    config: AllocationConfig,
) -> Dict[str, float]:
    """Validate and fix weights to satisfy constraints."""
    pool_ids = [p.get("pool_id", str(i)) for i, p in enumerate(pool_data)]

    # Ensure all pool IDs are present
    for pid in pool_ids:
        if pid not in weights:
            weights[pid] = config.min_single

    # Remove any extra keys
    weights = {k: v for k, v in weights.items() if k in pool_ids}

    # Enforce bounds
    for pid in weights:
        weights[pid] = max(config.min_single, min(config.max_single, float(weights[pid])))

    # Normalize to sum to 1
    total = sum(weights.values())
    if total > 0:
        weights = {k: v / total for k, v in weights.items()}
    else:
        n = len(pool_ids)
        weights = {pid: 1.0 / n for pid in pool_ids}

    return weights
