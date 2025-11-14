// Lógica de IA para o jogo

import type { Bid, Player, GameState } from '../../types';
import { countDiceValue, isValidBid } from '../gameLogic';

/**
 * Calcula a probabilidade de uma aposta ser verdadeira
 * baseado nos dados conhecidos da IA
 */
function calculateProbability(
  bid: Bid,
  aiDice: number[],
  totalDiceOnTable: number
): number {
  // Conta quantos dados a IA tem que podem contar para a aposta
  const aiCount = countDiceValue(aiDice, bid.value);
  
  // Dados desconhecidos (outros jogadores)
  const unknownDice = totalDiceOnTable - aiDice.length;
  
  // Probabilidade simplificada: assume que cada dado desconhecido tem
  // 1/3 de chance de ser o valor apostado ou coringa (1)
  const expectedUnknown = unknownDice / 3;
  const totalExpected = aiCount + expectedUnknown;
  
  return totalExpected / bid.quantity;
}

/**
 * Decide se a IA deve duvidar de uma aposta
 */
export function shouldAIDoubt(
  currentBid: Bid,
  gameState: GameState,
  aiPlayer: Player
): boolean {
  const totalDice = gameState.players.reduce((sum, p) => sum + p.dice.length, 0);
  const probability = calculateProbability(currentBid, aiPlayer.dice, totalDice);
  
  // IA duvida se a probabilidade for muito baixa
  // Personalidade default: duvida se probabilidade < 0.6
  const doubtThreshold = 0.6;
  
  return probability < doubtThreshold;
}

/**
 * Gera uma nova aposta para a IA
 */
export function generateAIBid(
  previousBid: Bid | null,
  _gameState: GameState,
  aiPlayer: Player
): Bid | null {
  // Se não há aposta anterior, faz aposta inicial
  if (!previousBid) {
    return makeInitialBid(aiPlayer);
  }

  // Tenta aumentar a aposta
  const newBid = increaseBid(previousBid, aiPlayer);
  
  if (newBid && isValidBid(newBid, previousBid)) {
    return newBid;
  }

  // Se não conseguiu aumentar, retorna null (deve duvidar)
  return null;
}

/**
 * Faz uma aposta inicial baseada nos dados da IA
 */
function makeInitialBid(aiPlayer: Player): Bid {
  // Conta quantos dados de cada valor a IA tem
  const counts = [0, 0, 0, 0, 0, 0, 0]; // índice 0 não usado
  aiPlayer.dice.forEach(d => counts[d]++);
  
  // Não aposta em 1s inicialmente (são coringas, mas não confiáveis)
  counts[1] = 0;
  
  // Encontra o valor que a IA mais tem
  let bestValue = 2;
  let maxCount = counts[2];
  for (let i = 3; i <= 6; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      bestValue = i;
    }
  }

  // Aposta inicial conservadora: 2 dados do valor que mais tem
  return {
    quantity: 2,
    value: bestValue,
    playerId: aiPlayer.id,
  };
}

/**
 * Aumenta a aposta anterior
 */
function increaseBid(previousBid: Bid, aiPlayer: Player): Bid | null {
  let newQuantity = previousBid.quantity;
  let newValue = previousBid.value + 1;

  // Se o valor passou de 6, aumenta a quantidade e reseta o valor para 2
  if (newValue > 6) {
    newQuantity++;
    newValue = 2;
  }

  // Verifica se a aposta é válida
  const newBid: Bid = {
    quantity: newQuantity,
    value: newValue,
    playerId: aiPlayer.id,
  };

  return newBid;
}

