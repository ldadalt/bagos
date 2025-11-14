/**
 * Personalidades de IA para o jogo
 * 
 * Este arquivo será implementado na Fase 3 quando adicionarmos
 * personalidades diferentes para as IAs (cautelosa, agressiva, analítica).
 * 
 * Por enquanto, mantém apenas a estrutura básica.
 */

import type { Bid } from '../../types';

export type AIPersonality = 'default' | 'cautious' | 'aggressive' | 'analytical';

/**
 * Configurações de comportamento para cada personalidade
 */
interface PersonalityConfig {
  doubtThreshold: number; // Probabilidade mínima para não duvidar (0-1)
  bidAggressiveness: number; // Quão agressivo é ao aumentar apostas (0-1)
  bluffFrequency: number; // Frequência de blefes (0-1)
}

const personalityConfigs: Record<AIPersonality, PersonalityConfig> = {
  default: {
    doubtThreshold: 0.6,
    bidAggressiveness: 0.5,
    bluffFrequency: 0.2,
  },
  cautious: {
    doubtThreshold: 0.7, // Duvida mais facilmente
    bidAggressiveness: 0.3, // Mais conservador
    bluffFrequency: 0.1, // Raramente blefa
  },
  aggressive: {
    doubtThreshold: 0.5, // Duvida menos
    bidAggressiveness: 0.8, // Muito agressivo
    bluffFrequency: 0.5, // Blefa frequentemente
  },
  analytical: {
    doubtThreshold: 0.65,
    bidAggressiveness: 0.6,
    bluffFrequency: 0.25,
  },
};

/**
 * Ajusta o threshold de dúvida baseado na personalidade
 * 
 * @param baseThreshold Threshold base (de aiStrategies.ts)
 * @param personality Personalidade da IA
 * @returns Threshold ajustado
 */
export function getDoubtThresholdForPersonality(
  baseThreshold: number,
  personality: AIPersonality
): number {
  const config = personalityConfigs[personality];
  return baseThreshold * (2 - config.doubtThreshold); // Inverte o threshold
}

/**
 * Determina se a IA deve blefar baseado na personalidade
 * 
 * @param personality Personalidade da IA
 * @returns true se deve blefar
 */
export function shouldBluff(personality: AIPersonality): boolean {
  const config = personalityConfigs[personality];
  return Math.random() < config.bluffFrequency;
}

/**
 * Ajusta a agressividade de uma aposta baseado na personalidade
 * 
 * @param baseBid Aposta base
 * @param personality Personalidade da IA
 * @returns Aposta ajustada (pode aumentar quantidade ou valor)
 */
export function adjustBidForPersonality(
  baseBid: Bid,
  personality: AIPersonality
): Bid {
  const config = personalityConfigs[personality];
  
  // Se a personalidade é agressiva, pode aumentar a aposta além do mínimo
  if (config.bidAggressiveness > 0.6 && Math.random() < 0.3) {
    return {
      ...baseBid,
      quantity: baseBid.quantity + 1,
    };
  }
  
  return baseBid;
}

/**
 * TODO: Implementar na Fase 3
 * - Integrar com aiStrategies.ts
 * - Permitir seleção de personalidades antes de iniciar partida
 * - Adicionar mais personalidades complexas
 */

