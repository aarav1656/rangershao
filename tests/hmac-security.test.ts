import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

function computeHmac(payload: string, secret: string, algorithm: string = 'sha256'): string {
  return crypto.createHmac(algorithm, secret).update(payload).digest('hex');
}

function verifyHmac(payload: string, receivedHmac: string, secret: string, algorithm: string = 'sha256'): boolean {
  const expected = computeHmac(payload, secret, algorithm);
  if (expected.length !== receivedHmac.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedHmac));
}

describe('HMAC Security', () => {
  const secret = 'test-webhook-secret-key-12345';

  it('generates valid HMAC for webhook payload', () => {
    const payload = JSON.stringify({ type: 'transfer', amount: 1000 });
    const hmac = computeHmac(payload, secret);
    expect(hmac).toHaveLength(64);
    expect(verifyHmac(payload, hmac, secret)).toBe(true);
  });

  it('rejects tampered payload', () => {
    const payload = JSON.stringify({ type: 'transfer', amount: 1000 });
    const hmac = computeHmac(payload, secret);
    const tampered = JSON.stringify({ type: 'transfer', amount: 999999 });
    expect(verifyHmac(tampered, hmac, secret)).toBe(false);
  });

  it('rejects wrong secret', () => {
    const payload = JSON.stringify({ type: 'transfer', amount: 1000 });
    const hmac = computeHmac(payload, secret);
    expect(verifyHmac(payload, hmac, 'wrong-secret')).toBe(false);
  });

  it('rejects empty HMAC via length mismatch', () => {
    const payload = JSON.stringify({ type: 'test' });
    expect(verifyHmac(payload, '', secret)).toBe(false);
  });

  it('rejects malformed HMAC (wrong length)', () => {
    const payload = JSON.stringify({ type: 'test' });
    expect(verifyHmac(payload, 'abc', secret)).toBe(false);
  });

  it('handles empty payload', () => {
    const hmac = computeHmac('', secret);
    expect(verifyHmac('', hmac, secret)).toBe(true);
  });

  it('handles large payload', () => {
    const payload = JSON.stringify({ data: 'x'.repeat(100000) });
    const hmac = computeHmac(payload, secret);
    expect(verifyHmac(payload, hmac, secret)).toBe(true);
  });
});
