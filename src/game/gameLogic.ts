// Funções puras de lógica do jogo (sem dependências externas)

import type { Bid, GameState } from '../types';

/**
 * Valida se uma aposta é maior que a aposta anterior
 */
export function isValidBid(newBid: Bid, previousBid: Bid | null): boolean {
  if (!previousBid) {
    return true; // Primeira aposta é sempre válida
  }

  // Nova aposta é válida se:
  // 1. A quantidade for maior, OU
  // 2. A quantidade for igual mas o valor do dado for maior
  if (newBid.quantity > previousBid.quantity) {
    return true;
  }
  
  if (newBid.quantity === previousBid.quantity && newBid.value > previousBid.value) {
    return true;
  }

  return false;
}

/**
 * Conta quantos dados de um determinado valor existem na mesa
 * (incluindo coringas - dados de valor 1)
 */
export function countDiceValue(allDice: number[], targetValue: number): number {
  let count = 0;
  for (const die of allDice) {
    // Dados de valor 1 são coringas (sempre contam como o valor da aposta)
    if (die === targetValue || die === 1) {
      count++;
    }
  }
  return count;
}

/**
 * Resolve um desafio e retorna o resultado
 */
export function resolveChallenge(
  bid: Bid,
  allPlayersDice: number[][]
): {
  bidderWon: boolean;
  actualCount: number;
} {
  // Junta todos os dados de todos os jogadores
  const allDice = allPlayersDice.flat();
  
  // Conta quantos dados do valor apostado existem (incluindo coringas)
  const actualCount = countDiceValue(allDice, bid.value);
  
  // A aposta é válida se o número real for >= ao número apostado
  const bidderWon = actualCount >= bid.quantity;

  return {
    bidderWon,
    actualCount,
  };
}

/**
 * Rola um dado (retorna número entre 1 e 6)
 */
export function rollSingleDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Rola múltiplos dados
 */
export function rollDice(numDice: number): number[] {
  const dice: number[] = [];
  for (let i = 0; i < numDice; i++) {
    dice.push(rollSingleDie());
  }
  return dice;
}

/**
 * Verifica se o jogo terminou (algum jogador perdeu todos os dados)
 */
export function checkGameEnd(gameState: GameState): string | null {
  for (const player of gameState.players) {
    if (player.dice.length === 0) {
      return player.id;
    }
  }
  return null;
}

