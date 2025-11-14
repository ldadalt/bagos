/**
 * Adaptador que abstrai a fonte de dados do estado do jogo
 * 
 * Esta abstração permite que o GameBoard e outros componentes
 * trabalhem com o estado do jogo sem saber se ele vem de:
 * - Memória local (useLocalGame)
 * - Firestore (useOnlineGame)
 * - Outra fonte futura
 * 
 * Por enquanto, esta é apenas uma interface/conceito.
 * Na Fase 2, quando implementarmos useOnlineGame, ambos os hooks
 * seguirão esta mesma interface, permitindo troca fácil.
 */

import type { GameState, GameActions } from '../types';

/**
 * Interface que qualquer hook de gerenciamento de estado deve seguir
 */
export interface GameStateManager {
  gameState: GameState;
  actions: GameActions;
  processAITurn?: () => void; // Opcional, apenas para modo local
}

/**
 * Tipo para identificar a fonte de dados
 */
export type GameMode = 'local' | 'online';

/**
 * Factory function para criar o gerenciador apropriado
 * 
 * NOTA: Esta função não pode ser usada diretamente porque hooks
 * devem ser chamados no nível superior dos componentes.
 * 
 * Em vez disso, use os hooks diretamente no componente:
 * - useLocalGame() para modo local
 * - useOnlineGame(gameId) para modo online
 * 
 * Esta função existe apenas como documentação do padrão a seguir.
 */
export function createGameManager(_mode: GameMode, _gameId?: string): never {
  throw new Error(
    'createGameManager não deve ser usado diretamente. ' +
    'Use useLocalGame() ou useOnlineGame() nos componentes React.'
  );
}

/**
 * Valida se um GameState está em um estado válido
 */
export function validateGameState(state: GameState): boolean {
  if (!state.players || state.players.length === 0) {
    return false;
  }

  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
    return false;
  }

  if (state.gameStatus === 'playing' && state.players.some(p => p.dice.length === 0)) {
    return false; // Não pode estar jogando se alguém não tem dados
  }

  return true;
}

