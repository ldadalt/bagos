import { describe, expect, it } from 'vitest';
import { generateAIBid, shouldAIDoubt } from '../ai/aiStrategies';
import type { Bid, GameState, Player } from '../../types';

const mockGameState: GameState = {
  players: [
    { id: 'player', name: 'Player', dice: [1, 2, 3, 4, 5], isHuman: true },
    { id: 'ai', name: 'AI', dice: [2, 2, 3, 6, 5], isHuman: false, isAI: true },
  ],
  currentPlayerIndex: 0,
  currentBid: null,
  lastRoundLoserIndex: 0,
  roundNumber: 1,
  gameStatus: 'playing',
};

const aiPlayer: Player = mockGameState.players[1];

describe('generateAIBid', () => {
  it('creates an opening bid when no previous bid exists', () => {
    const bid = generateAIBid(null, mockGameState, aiPlayer);
    expect(bid).not.toBeNull();
    expect(bid?.quantity).toBeGreaterThan(0);
  });

  it('returns null when it cannot increase a bid further', () => {
    const previousBid: Bid = { quantity: 10, value: 6, playerId: 'player' };
    const bid = generateAIBid(previousBid, mockGameState, aiPlayer);
    expect(bid).toBeNull();
  });
});

describe('shouldAIDoubt', () => {
  it('doubts when probability is low', () => {
    const currentBid: Bid = { quantity: 10, value: 6, playerId: 'player' };
    expect(shouldAIDoubt(currentBid, mockGameState, aiPlayer)).toBe(true);
  });

  it('stays in when probability is reasonable', () => {
    const currentBid: Bid = { quantity: 2, value: 3, playerId: 'player' };
    expect(shouldAIDoubt(currentBid, mockGameState, aiPlayer)).toBe(false);
  });
});

