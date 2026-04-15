interface RateLimitBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number;
  lastRefill: number;
  windowMs: number;
}

export class RateLimiter {
  private buckets: Map<string, RateLimitBucket> = new Map();

  addBucket(
    name: string,
    maxTokens: number,
    windowMs: number
  ): void {
    this.buckets.set(name, {
      tokens: maxTokens,
      maxTokens,
      refillRate: maxTokens / windowMs,
      lastRefill: Date.now(),
      windowMs,
    });
  }

  tryAcquire(name: string, cost: number = 1): boolean {
    const bucket = this.buckets.get(name);
    if (!bucket) return true;

    this.refill(bucket);

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return true;
    }

    return false;
  }

  getRemaining(name: string): number {
    const bucket = this.buckets.get(name);
    if (!bucket) return Infinity;
    this.refill(bucket);
    return Math.floor(bucket.tokens);
  }

  getTimeUntilAvailable(name: string, cost: number = 1): number {
    const bucket = this.buckets.get(name);
    if (!bucket) return 0;
    this.refill(bucket);
    if (bucket.tokens >= cost) return 0;
    const deficit = cost - bucket.tokens;
    return Math.ceil(deficit / bucket.refillRate);
  }

  reset(name: string): void {
    const bucket = this.buckets.get(name);
    if (bucket) {
      bucket.tokens = bucket.maxTokens;
      bucket.lastRefill = Date.now();
    }
  }

  getStatus(): Record<
    string,
    { remaining: number; max: number; windowMs: number }
  > {
    const status: Record<
      string,
      { remaining: number; max: number; windowMs: number }
    > = {};
    for (const [name, bucket] of this.buckets) {
      this.refill(bucket);
      status[name] = {
        remaining: Math.floor(bucket.tokens),
        max: bucket.maxTokens,
        windowMs: bucket.windowMs,
      };
    }
    return status;
  }

  private refill(bucket: RateLimitBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(
      bucket.maxTokens,
      bucket.tokens + elapsed * bucket.refillRate
    );
    bucket.lastRefill = now;
  }
}
