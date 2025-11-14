import { describe, expect, it } from 'vitest';
import { isValidBid, resolveChallenge, countDiceValue } from '../gameLogic';
import type { Bid } from '../../types';

describe('isValidBid', () => {
  it('accepts first bid regardless of values', () => {
    const bid: Bid = { quantity: 1, value: 2, playerId: 'p1' };
    expect(isValidBid(bid, null)).toBe(true);
  });

  it('requires higher quantity or same quantity with higher value', () => {
    const previous: Bid = { quantity: 2, value: 3, playerId: 'p1' };
    expect(isValidBid({ quantity: 3, value: 2, playerId: 'p2' }, previous)).toBe(true);
    expect(isValidBid({ quantity: 2, value: 4, playerId: 'p2' }, previous)).toBe(true);
    expect(isValidBid({ quantity: 2, value: 3, playerId: 'p2' }, previous)).toBe(false);
    expect(isValidBid({ quantity: 1, value: 6, playerId: 'p2' }, previous)).toBe(false);
  });
});

describe('resolveChallenge', () => {
  it('counts wild ones when determining actual count', () => {
    const bid: Bid = { quantity: 3, value: 5, playerId: 'p1' };
    const result = resolveChallenge(bid, [
      [1, 5, 2],
      [3, 1, 4],
    ]);
    expect(result.actualCount).toBe(3); // two wild 1s plus one 5
    expect(result.bidderWon).toBe(true);
  });

  it('detects failed bids when actual count is lower', () => {
    const bid: Bid = { quantity: 4, value: 6, playerId: 'p1' };
    const result = resolveChallenge(bid, [
      [6, 2, 3],
      [4, 5, 2],
    ]);
    expect(result.actualCount).toBe(1);
    expect(result.bidderWon).toBe(false);
  });
});

describe('countDiceValue', () => {
  it('includes ones as wildcards', () => {
    expect(countDiceValue([1, 1, 2, 3, 5], 5)).toBe(3);
  });

  it('returns zero when value not present', () => {
    expect(countDiceValue([2, 3, 4], 6)).toBe(0);
  });
});

