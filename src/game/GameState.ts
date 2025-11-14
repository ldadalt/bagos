/**
 * Interfaces e tipos relacionados ao estado do jogo
 * 
 * Este arquivo mantém as definições relacionadas diretamente ao GameState.
 * Tipos mais gerais estão em types/index.ts.
 * 
 * Nota: Os tipos principais (GameState, Player, Bid) estão em types/index.ts
 * para manter uma organização centralizada. Este arquivo pode conter
 * tipos específicos do módulo game/ se necessário no futuro.
 */

// Re-exporta tipos principais para manter compatibilidade
export type {
  GameState,
  Player,
  Bid,
  GameStatus,
  GameActions,
} from '../types';

// Tipos específicos do módulo game/ podem ser adicionados aqui no futuro
// Por exemplo:
// export interface GameStateHistory { ... }
// export interface GameStateSnapshot { ... }

