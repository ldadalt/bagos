import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGame } from '../useLocalGame';

describe('useLocalGame', () => {
  it('initializes game with two players when startGame is called', () => {
    const { result } = renderHook(() => useLocalGame());

    act(() => {
      result.current.actions.startGame();
    });

    const { gameState } = result.current;
    expect(gameState.players).toHaveLength(2);
    expect(gameState.gameStatus).toBe('playing');
    expect(gameState.players[0].dice.length).toBeGreaterThan(0);
  });

  it('records bids and challenges', () => {
    const { result } = renderHook(() => useLocalGame());

    act(() => {
      result.current.actions.startGame();
    });

    act(() => {
      result.current.actions.makeBid(2, 3);
    });

    expect(result.current.gameState.currentBid).toMatchObject({ quantity: 2, value: 3 });
    expect(result.current.history.some(entry => entry.type === 'bid')).toBe(true);

    act(() => {
      result.current.actions.challenge();
    });

    expect(result.current.history.some(entry => entry.type === 'challenge')).toBe(true);
  });
});

