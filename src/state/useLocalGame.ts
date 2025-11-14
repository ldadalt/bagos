// Hook para gerenciar jogo local (em memória)

import { useState, useCallback } from 'react';
import type { GameState, Bid, GameActions, GameHistoryEntry, RoundResult } from '../types';
import { 
  isValidBid, 
  resolveChallenge, 
  rollDice, 
  checkGameEnd 
} from '../game/gameLogic';
import { generateAIBid, shouldAIDoubt } from '../game/ai/aiStrategies';

export function useLocalGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    currentBid: null,
    lastRoundLoserIndex: 0,
    roundNumber: 1,
    gameStatus: 'waiting',
  });

  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundResult | null>(null);

  const startGame = useCallback(() => {
    const player: GameState['players'][0] = {
      id: 'player',
      name: 'Você',
      dice: rollDice(5),
      isHuman: true,
    };

    const ai: GameState['players'][0] = {
      id: 'ai',
      name: 'IA',
      dice: rollDice(5),
      isHuman: false,
      isAI: true,
      aiPersonality: 'default',
    };

    const players = [player, ai];
    const now = Date.now();
    const initialRound: RoundResult = {
      roundNumber: 1,
      startTime: now,
      bids: [],
      playerDiceCounts: {
        player: player.dice.length,
        ai: ai.dice.length,
      },
    };

    setGameState({
      players,
      currentPlayerIndex: 0, // Jogador humano começa
      currentBid: null,
      lastRoundLoserIndex: 0,
      roundNumber: 1,
      gameStatus: 'playing',
    });

    // Limpa histórico anterior e inicia novo
    setHistory([]);
    setRoundResults([]);
    setCurrentRound(initialRound);

    // Adiciona entrada de início de rodada
    const roundStartEntry: GameHistoryEntry = {
      id: `round-start-${now}`,
      timestamp: now,
      type: 'round_start',
      playerId: player.id,
      playerName: player.name,
    };
    setHistory([roundStartEntry]);
  }, []);

  const makeBid = useCallback((quantity: number, value: number) => {
    setGameState((prev) => {
      if (prev.gameStatus !== 'playing') return prev;
      
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      if (currentPlayer.isHuman === false) return prev; // Apenas humano pode fazer aposta manualmente

      const newBid: Bid = {
        quantity,
        value,
        playerId: currentPlayer.id,
      };

      if (!isValidBid(newBid, prev.currentBid)) {
        return prev; // Aposta inválida
      }

      // Move para o próximo jogador
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

      // Registra no histórico
      const now = Date.now();
      const historyEntry: GameHistoryEntry = {
        id: `bid-${now}-${currentPlayer.id}`,
        timestamp: now,
        type: 'bid',
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        data: { bid: newBid },
      };
      setHistory((h) => [...h, historyEntry]);

      // Atualiza rodada atual
      setCurrentRound((round) => {
        if (!round) return null;
        return {
          ...round,
          bids: [...round.bids, { playerId: currentPlayer.id, playerName: currentPlayer.name, bid: newBid }],
        };
      });

      return {
        ...prev,
        currentBid: newBid,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, []);

  const challenge = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus !== 'playing' || !prev.currentBid) return prev;

      const challenger = prev.players[prev.currentPlayerIndex];
      const bidder = prev.players.find(p => p.id === prev.currentBid!.playerId);
      
      if (!bidder) return prev;

      // Resolve o desafio
      const allPlayersDice = prev.players.map(p => p.dice);
      const result = resolveChallenge(prev.currentBid, allPlayersDice);

      // Determina o perdedor
      const loser = result.bidderWon ? challenger : bidder;
      const loserIndex = prev.players.findIndex(p => p.id === loser.id);

      // Remove um dado do perdedor
      const updatedPlayers = prev.players.map((p, index) => {
        if (index === loserIndex && p.dice.length > 0) {
          return {
            ...p,
            dice: p.dice.slice(0, -1), // Remove último dado
          };
        }
        return p;
      });

      // Verifica se o jogo terminou
      const winnerId = checkGameEnd({
        ...prev,
        players: updatedPlayers,
      });

      // Registra desafio no histórico
      const now = Date.now();
      const challengeEntry: GameHistoryEntry = {
        id: `challenge-${now}`,
        timestamp: now,
        type: 'challenge',
        playerId: challenger.id,
        playerName: challenger.name,
        data: {
          challengeResult: {
            bidderWon: result.bidderWon,
            actualCount: result.actualCount,
            loserId: loser.id,
            loserName: loser.name,
          },
        },
      };
      setHistory((h) => [...h, challengeEntry]);

      // Finaliza rodada atual e salva nos resultados
      setCurrentRound((round) => {
        if (!round) return null;
        const finalRound: RoundResult = {
          ...round,
          endTime: now,
          challengeResult: {
            challengerId: challenger.id,
            challengerName: challenger.name,
            bidderId: bidder.id,
            bidderName: bidder.name,
            bid: prev.currentBid!,
            actualCount: result.actualCount,
            bidderWon: result.bidderWon,
            loserId: loser.id,
            loserName: loser.name,
          },
          playerDiceCounts: {
            player: updatedPlayers.find(p => p.id === 'player')?.dice.length || 0,
            ai: updatedPlayers.find(p => p.id === 'ai')?.dice.length || 0,
          },
        };
        setRoundResults((r) => [...r, finalRound]);
        return null; // Reseta para próxima rodada
      });

      if (winnerId) {
        return {
          ...prev,
          players: updatedPlayers,
          gameStatus: 'finished',
          winnerId,
        };
      }

      // Inicia nova rodada - rola novos dados para todos
      const playersWithNewDice = updatedPlayers.map(p => ({
        ...p,
        dice: rollDice(p.dice.length),
      }));

      // Cria nova rodada
      const newRound: RoundResult = {
        roundNumber: prev.roundNumber + 1,
        startTime: now,
        bids: [],
        playerDiceCounts: {
          player: playersWithNewDice.find(p => p.id === 'player')?.dice.length || 0,
          ai: playersWithNewDice.find(p => p.id === 'ai')?.dice.length || 0,
        },
      };
      setCurrentRound(newRound);

      // Adiciona entrada de início de nova rodada
      const roundStartEntry: GameHistoryEntry = {
        id: `round-start-${now}`,
        timestamp: now,
        type: 'round_start',
        playerId: playersWithNewDice[loserIndex].id,
        playerName: playersWithNewDice[loserIndex].name,
      };
      setHistory((h) => [...h, roundStartEntry]);

      return {
        ...prev,
        players: playersWithNewDice,
        currentBid: null,
        lastRoundLoserIndex: loserIndex,
        currentPlayerIndex: loserIndex,
        roundNumber: prev.roundNumber + 1,
      };
    });
  }, []);

  const startNewRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus !== 'playing') return prev;

      // Rola novos dados para todos os jogadores (mantém quantidade)
      const updatedPlayers = prev.players.map(p => ({
        ...p,
        dice: rollDice(p.dice.length),
      }));

      return {
        ...prev,
        players: updatedPlayers,
        currentBid: null,
        currentPlayerIndex: prev.lastRoundLoserIndex,
        roundNumber: prev.roundNumber + 1,
      };
    });
  }, []);

  // Função para processar turno da IA automaticamente
  const processAITurn = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus !== 'playing') return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      
      // Se não é IA, não faz nada
      if (!currentPlayer.isAI) return prev;

      // Se há uma aposta anterior, decide se duvida ou aumenta
      if (prev.currentBid) {
        const shouldDoubt = shouldAIDoubt(prev.currentBid, prev, currentPlayer);
        
        if (shouldDoubt) {
          // IA duvida - resolve o desafio
          const challenger = currentPlayer;
          const bidder = prev.players.find(p => p.id === prev.currentBid!.playerId);
          
          if (!bidder) return prev;

          const allPlayersDice = prev.players.map(p => p.dice);
          const result = resolveChallenge(prev.currentBid, allPlayersDice);

          const loser = result.bidderWon ? challenger : bidder;
          const loserIndex = prev.players.findIndex(p => p.id === loser.id);

          const updatedPlayers = prev.players.map((p, index) => {
            if (index === loserIndex && p.dice.length > 0) {
              return {
                ...p,
                dice: p.dice.slice(0, -1),
              };
            }
            return p;
          });

          const winnerId = checkGameEnd({
            ...prev,
            players: updatedPlayers,
          });

          // Registra desafio no histórico
          const now = Date.now();
          const challengeEntry: GameHistoryEntry = {
            id: `challenge-${now}`,
            timestamp: now,
            type: 'challenge',
            playerId: challenger.id,
            playerName: challenger.name,
            data: {
              challengeResult: {
                bidderWon: result.bidderWon,
                actualCount: result.actualCount,
                loserId: loser.id,
                loserName: loser.name,
              },
            },
          };
          setHistory((h) => [...h, challengeEntry]);

          // Finaliza rodada atual
          setCurrentRound((round) => {
            if (!round) return null;
            const finalRound: RoundResult = {
              ...round,
              endTime: now,
              challengeResult: {
                challengerId: challenger.id,
                challengerName: challenger.name,
                bidderId: bidder.id,
                bidderName: bidder.name,
                bid: prev.currentBid!,
                actualCount: result.actualCount,
                bidderWon: result.bidderWon,
                loserId: loser.id,
                loserName: loser.name,
              },
              playerDiceCounts: {
                player: updatedPlayers.find(p => p.id === 'player')?.dice.length || 0,
                ai: updatedPlayers.find(p => p.id === 'ai')?.dice.length || 0,
              },
            };
            setRoundResults((r) => [...r, finalRound]);
            return null;
          });

          if (winnerId) {
            return {
              ...prev,
              players: updatedPlayers,
              gameStatus: 'finished',
              winnerId,
            };
          }

          // Inicia nova rodada - rola novos dados para todos
          const playersWithNewDice = updatedPlayers.map(p => ({
            ...p,
            dice: rollDice(p.dice.length),
          }));

          // Cria nova rodada
          const newRound: RoundResult = {
            roundNumber: prev.roundNumber + 1,
            startTime: now,
            bids: [],
            playerDiceCounts: {
              player: playersWithNewDice.find(p => p.id === 'player')?.dice.length || 0,
              ai: playersWithNewDice.find(p => p.id === 'ai')?.dice.length || 0,
            },
          };
          setCurrentRound(newRound);

          // Adiciona entrada de início de nova rodada
          const roundStartEntry: GameHistoryEntry = {
            id: `round-start-${now}`,
            timestamp: now,
            type: 'round_start',
            playerId: playersWithNewDice[loserIndex].id,
            playerName: playersWithNewDice[loserIndex].name,
          };
          setHistory((h) => [...h, roundStartEntry]);

          return {
            ...prev,
            players: playersWithNewDice,
            currentBid: null,
            lastRoundLoserIndex: loserIndex,
            currentPlayerIndex: loserIndex,
            roundNumber: prev.roundNumber + 1,
          };
        }
      }

      // IA faz uma nova aposta
      const newBid = generateAIBid(prev.currentBid, prev, currentPlayer);
      
      if (!newBid) {
        // Se não conseguiu gerar aposta, duvida
        return prev; // Será tratado no próximo processAITurn
      }

      // Registra aposta da IA no histórico
      const now = Date.now();
      const historyEntry: GameHistoryEntry = {
        id: `bid-${now}-${currentPlayer.id}`,
        timestamp: now,
        type: 'bid',
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        data: { bid: newBid },
      };
      setHistory((h) => [...h, historyEntry]);

      // Atualiza rodada atual
      setCurrentRound((round) => {
        if (!round) return null;
        return {
          ...round,
          bids: [...round.bids, { playerId: currentPlayer.id, playerName: currentPlayer.name, bid: newBid }],
        };
      });

      // Move para o próximo jogador
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

      return {
        ...prev,
        currentBid: newBid,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, []);

  const leaveGame = useCallback(async () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      currentBid: null,
      lastRoundLoserIndex: 0,
      roundNumber: 1,
      gameStatus: 'waiting',
    });
    setHistory([]);
    setRoundResults([]);
    setCurrentRound(null);
  }, []);

  const actions: GameActions = {
    makeBid,
    challenge,
    startNewRound,
    startGame,
    leaveGame,
  };

  return {
    gameState,
    actions,
    processAITurn,
    history,
    roundResults,
    currentRound,
    statusMessage: null,
    shouldReturnToMenu: false,
  };
}

