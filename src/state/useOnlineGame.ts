// Hook para gerenciar jogo online (Firestore)

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { db, auth } from '../services/firebase';
import type { GameState, GameActions, Bid, GameHistoryEntry, RoundResult, Player } from '../types';
import { rollDice } from '../game/gameLogic';

export function useOnlineGame(gameId?: string) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [shouldReturnToMenu, setShouldReturnToMenu] = useState(false);
  const autoExitRef = useRef(false);

  const currentUser = auth?.currentUser || null;

  const finishGameForCurrentPlayer = useCallback(async () => {
    if (!gameId || !currentUser || !db) {
      console.log('[finishGameForCurrentPlayer] Parâmetros inválidos');
      return;
    }

    try {
      console.log('[finishGameForCurrentPlayer] Iniciando finalização do jogo');
      const gameRef = doc(db!, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) {
        console.log('[finishGameForCurrentPlayer] Jogo não existe');
        return;
      }

      const data = gameSnap.data();
      const remainingPlayers: string[] = (data.players || []).filter((id: string) => id !== currentUser.uid);
      const winnerId = remainingPlayers.length === 1 ? remainingPlayers[0] : null;

      console.log('[finishGameForCurrentPlayer] Atualizando jogo:', {
        remainingPlayers,
        winnerId,
        currentPlayers: data.players
      });

      await updateDoc(gameRef, {
        players: remainingPlayers,
        status: 'finished',
        gameStatus: 'finished',
        winnerId: winnerId || null,
        currentBid: null,
        updatedAt: serverTimestamp(),
      });

      console.log('[finishGameForCurrentPlayer] Jogo finalizado com sucesso');

      await setDoc(doc(db!, 'games', gameId, 'players', currentUser.uid), {
        lastSeen: serverTimestamp(),
        isConnected: false,
      }, { merge: true });
    } catch (err) {
      console.error('Erro ao finalizar jogo ao sair:', err);
    }
  }, [gameId, currentUser, db]);

  const finishGameDueToOpponentLeaving = useCallback(async (opponentId: string) => {
    if (!gameId || !currentUser || !db) return;

    try {
      console.log('[finishGameDueToOpponentLeaving] Encerrando jogo por saída do oponente', opponentId);
      const gameRef = doc(db!, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) return;

      const data = gameSnap.data();
      const remainingPlayers: string[] = (data.players || []).filter((id: string) => id !== opponentId);

      await updateDoc(gameRef, {
        players: remainingPlayers,
        status: 'finished',
        gameStatus: 'finished',
        winnerId: currentUser.uid,
        currentBid: null,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db!, 'games', gameId, 'players', opponentId), {
        lastSeen: serverTimestamp(),
        isConnected: false,
      }, { merge: true });
    } catch (err) {
      console.error('Erro ao finalizar jogo por saída do oponente:', err);
    }
  }, [gameId, currentUser, db]);

  // Sincroniza estado do jogo do Firestore
  useEffect(() => {
    if (!gameId || !currentUser || !db) {
      setLoading(false);
      if (!db) {
        setError('Firebase não está configurado.');
      }
      return;
    }

    const gameRef = doc(db!, 'games', gameId);
    const unsubscribe = onSnapshot(gameRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setError('Jogo não encontrado.');
        setLoading(false);
        return;
      }

      const data = snapshot.data();
      
      // Inicializa dados automaticamente quando o jogo começa com 2 jogadores
      if (data.gameStatus === 'playing' && data.players?.length === 2) {
        const currentPlayerDiceRef = doc(db!, 'games', gameId, 'players', currentUser.uid);
        const currentPlayerDiceSnap = await getDoc(currentPlayerDiceRef);

        // Se o jogador atual não tem dados ainda, inicializa com 5 dados
        if (!currentPlayerDiceSnap.exists() || !currentPlayerDiceSnap.data().dice || currentPlayerDiceSnap.data().dice.length === 0) {
          await setDoc(currentPlayerDiceRef, {
            dice: rollDice(5),
            lastSeen: serverTimestamp(),
            isConnected: true,
          }, { merge: true });
        }
      }
      
      // Busca dados privados dos jogadores
      const playersWithDice: Player[] = [];
      for (const playerId of data.players || []) {
        const playerDiceRef = doc(db!, 'games', gameId, 'players', playerId);
        const playerDiceSnap = await getDoc(playerDiceRef);
        const playerDice = playerDiceSnap.exists() && playerDiceSnap.data().dice 
          ? playerDiceSnap.data().dice 
          : [];

        // Busca informações do jogador
        const isHuman = playerId === currentUser.uid;
        playersWithDice.push({
          id: playerId,
          name: data.playerNames?.[playerId] || (isHuman ? 'Você' : 'Jogador ' + playerId.slice(0, 6)),
          dice: playerDice,
          isHuman,
        });
      }

      let adjustedGameState: GameState = {
        players: playersWithDice,
        currentPlayerIndex: data.currentPlayerIndex || 0,
        currentBid: data.currentBid || null,
        lastRoundLoserIndex: data.lastRoundLoserIndex || 0,
        roundNumber: data.roundNumber || 1,
        gameStatus: data.gameStatus || 'waiting',
        winnerId: data.winnerId,
      };

      const playerCount = data.players?.length || 0;
      console.log('[onSnapshot] Estado do jogo atualizado:', {
        playerCount,
        gameStatus: adjustedGameState.gameStatus,
        players: data.players,
        currentUser: currentUser?.uid,
        isPlayerInGame: data.players?.includes(currentUser?.uid)
      });

      if (data.players && currentUser && !data.players.includes(currentUser.uid)) {
        console.log('[onSnapshot] Jogador não está mais na lista');
        setStatusMessage('Você foi removido da sala ou ela foi encerrada.');
        setShouldReturnToMenu(true);
      } else if (adjustedGameState.gameStatus === 'finished') {
        console.log('[onSnapshot] Jogo finalizado');
        setStatusMessage(
          adjustedGameState.winnerId && adjustedGameState.winnerId !== currentUser.uid
            ? 'O outro jogador saiu. A partida foi encerrada.'
            : 'Partida encerrada.'
        );
        setShouldReturnToMenu(true);
        autoExitRef.current = true;
      } else if (adjustedGameState.gameStatus === 'playing' && playerCount < 2) {
        console.log('[onSnapshot] Jogo em andamento com menos de 2 jogadores, encerrando');
        setStatusMessage('O outro jogador saiu da partida. A partida foi encerrada.');
        adjustedGameState = {
          ...adjustedGameState,
          gameStatus: 'finished',
          winnerId: adjustedGameState.players.find(p => p.id !== currentUser.uid)?.id,
        };
        setShouldReturnToMenu(true);
        autoExitRef.current = true;
      } else if (playerCount < 2) {
        console.log('[onSnapshot] Menos de 2 jogadores, aguardando');
        setStatusMessage('Aguardando outro jogador entrar na sala.');
        setShouldReturnToMenu(false);
        autoExitRef.current = false;
      } else {
        setStatusMessage(null);
        setShouldReturnToMenu(false);
        autoExitRef.current = false;
        const opponentId = adjustedGameState.players.find(p => p.id !== currentUser.uid)?.id;
        if (opponentId) {
          const opponentDocRef = doc(db!, 'games', gameId, 'players', opponentId);
          const opponentDoc = await getDoc(opponentDocRef);
          const opponentData = opponentDoc.exists() ? opponentDoc.data() : null;
          const lastSeenValue = opponentData?.lastSeen;
          const lastSeen = lastSeenValue?.toMillis ? lastSeenValue.toMillis() :
            lastSeenValue instanceof Date ? lastSeenValue.getTime() : null;
          if (opponentData?.isConnected === false) {
            setStatusMessage('Seu oponente saiu para o menu. Partida encerrada.');
          } else if (lastSeen && Date.now() - lastSeen > 30_000) {
            setStatusMessage('Seu oponente está desconectado. Aguardando reconexão...');
          }
        }
      }

      setGameState(adjustedGameState);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Erro ao sincronizar jogo:', err);
      // Não mostra erro se for apenas problema de conexão (o Firebase tenta reconectar automaticamente)
      if (err.code === 'unavailable' || err.message?.includes('network')) {
        setError('Sem conexão com a internet. Reconectando...');
      } else {
        setError('Erro ao sincronizar jogo.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId, currentUser, db]);

  // Sincroniza resultados das rodadas do Firestore
  useEffect(() => {
    if (!gameId || !db || !currentUser) return;

    const roundResultsRef = collection(db, 'games', gameId, 'roundResults');
    const q = query(roundResultsRef, orderBy('roundNumber', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: RoundResult[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          roundNumber: data.roundNumber,
          startTime: data.startTime,
          endTime: data.endTime,
          bids: data.bids || [],
          challengeResult: data.challengeResult || undefined,
          playerDiceCounts: data.playerDiceCounts || {},
        });
      });
      
      // Ordena por número da rodada
      results.sort((a, b) => a.roundNumber - b.roundNumber);
      setRoundResults(results);
    }, (err) => {
      // Ignora erros de rede (são esperados)
      if (err.code !== 'unavailable' && !err.message?.includes('network')) {
        console.error('Erro ao sincronizar resultados das rodadas:', err);
      }
    });

    return () => unsubscribe();
  }, [gameId, db, currentUser]);
  useEffect(() => {
    if (!gameId || !currentUser || !db || gameState.gameStatus === 'finished') {
      return;
    }

    const playerDocRef = doc(db!, 'games', gameId, 'players', currentUser.uid);
    const updatePresence = async () => {
      try {
        await setDoc(playerDocRef, {
          lastSeen: serverTimestamp(),
          isConnected: true,
        }, { merge: true });
      } catch (err) {
        console.warn('Não foi possível atualizar presença:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      } else {
        setDoc(playerDocRef, {
          lastSeen: serverTimestamp(),
          isConnected: false,
        }, { merge: true }).catch(() => {});
      }
    };

    updatePresence();
    const interval = window.setInterval(updatePresence, 15000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleBeforeUnload = () => {
      finishGameForCurrentPlayer().catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setDoc(playerDocRef, {
        lastSeen: serverTimestamp(),
        isConnected: false,
      }, { merge: true }).catch(() => {});
    };
  }, [gameId, currentUser, db, finishGameForCurrentPlayer, finishGameDueToOpponentLeaving]);

  // Verifica periodicamente se os jogadores ainda estão na sala (ping a cada 5 segundos)
  useEffect(() => {
    if (!gameId || !currentUser || !db) {
      return;
    }

    const checkPlayers = async () => {
      try {
        const gameRef = doc(db!, 'games', gameId);
        const gameSnap = await getDoc(gameRef);
        
        if (!gameSnap.exists()) {
          console.log('[checkPlayers] Jogo não existe');
          return;
        }

        const data = gameSnap.data();
        const playerCount = data.players?.length || 0;
        const isPlayerInGame = data.players?.includes(currentUser.uid) || false;
        const gameStatus = data.gameStatus || data.status || 'waiting';
        const opponentId = data.players?.find((id: string) => id !== currentUser.uid);
        let opponentOffline = false;

        if (opponentId) {
          const opponentDocRef = doc(db!, 'games', gameId, 'players', opponentId);
          const opponentDoc = await getDoc(opponentDocRef);
          if (!opponentDoc.exists()) {
            opponentOffline = true;
          } else {
            const opponentData = opponentDoc.data();
            const lastSeenValue = opponentData?.lastSeen;
            const lastSeen = lastSeenValue?.toMillis ? lastSeenValue.toMillis() :
              lastSeenValue instanceof Date ? lastSeenValue.getTime() : null;
            if (opponentData?.isConnected === false || (lastSeen && Date.now() - lastSeen > 10000)) {
              opponentOffline = true;
            }
          }
        }

        console.log('[checkPlayers] Verificando jogadores:', {
          playerCount,
          isPlayerInGame,
          gameStatus,
          players: data.players,
          currentUser: currentUser.uid,
          autoExitRef: autoExitRef.current,
          opponentOffline,
        });

        // Se o jogador atual não está mais na lista, volta ao menu
        if (!isPlayerInGame) {
          console.log('[checkPlayers] Jogador não está mais na lista, voltando ao menu');
          setStatusMessage('Você foi removido da sala ou ela foi encerrada.');
          setShouldReturnToMenu(true);
          return;
        }

        // Se o jogo foi finalizado e já processamos a saída, não precisa verificar novamente
        if (gameStatus === 'finished' && autoExitRef.current) {
          console.log('[checkPlayers] Jogo já finalizado e processado, ignorando');
          return;
        }

        // Se o jogo estava em andamento e agora tem menos de 2 jogadores, encerra
        if (gameStatus === 'playing' && (playerCount < 2 || opponentOffline)) {
          console.log('[checkPlayers] Jogo em andamento com menos de 2 jogadores, encerrando');
          setStatusMessage('O outro jogador saiu da partida. A partida foi encerrada.');
          if (!autoExitRef.current) {
            autoExitRef.current = true;
            if (opponentOffline && opponentId) {
              await finishGameDueToOpponentLeaving(opponentId);
            } else {
              await finishGameForCurrentPlayer();
            }
            setShouldReturnToMenu(true);
          }
        } else if (gameStatus === 'finished' && playerCount < 2 && !autoExitRef.current) {
          // Se o jogo foi finalizado e o jogador está sozinho, volta ao menu
          console.log('[checkPlayers] Jogo finalizado com menos de 2 jogadores, voltando ao menu');
          setStatusMessage('O outro jogador saiu. A partida foi encerrada.');
          autoExitRef.current = true;
          setShouldReturnToMenu(true);
        } else {
          console.log('[checkPlayers] Nenhuma ação necessária');
        }
      } catch (err: any) {
        // Ignora erros de rede silenciosamente
        if (err?.code !== 'unavailable' && !err?.message?.includes('network')) {
          console.warn('[checkPlayers] Erro ao verificar jogadores:', err);
        }
      }
    };

    // Verifica imediatamente e depois a cada 5 segundos
    checkPlayers();
    const interval = window.setInterval(checkPlayers, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [gameId, currentUser, db, finishGameForCurrentPlayer]);

  // Sincroniza histórico do jogo para atualizar rodada atual
  useEffect(() => {
    if (!gameId || !db || !gameState.roundNumber || gameState.gameStatus !== 'playing') {
      return;
    }

    const historyRef = collection(db, 'games', gameId, 'history');
    const q = query(historyRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentRoundNumber = gameState.roundNumber || 1;
      
      // Verifica se já existe resultado para a rodada atual
      const roundExists = roundResults.some(
        (r) => r.roundNumber === currentRoundNumber
      );
      
      if (roundExists) {
        setCurrentRound(null);
        return;
      }
      
      // Busca apostas da rodada atual
      const currentRoundBids: Array<{
        playerId: string;
        playerName: string;
        bid: {quantity: number; value: number; playerId: string};
      }> = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'bid' && 
            data.data?.bid && 
            (data.roundNumber === currentRoundNumber)) {
          const player = gameState.players.find(p => p.id === data.playerId);
          currentRoundBids.push({
            playerId: data.playerId,
            playerName: player?.name || data.playerName || 'Jogador',
            bid: data.data.bid,
          });
        }
      });
      
      // Atualiza rodada atual
      const gameRef = doc(db!, 'games', gameId);
      getDoc(gameRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentRoundData: RoundResult = {
            roundNumber: currentRoundNumber,
            startTime: data.roundStartTime || Date.now(),
            bids: currentRoundBids,
            playerDiceCounts: {},
          };
          
          // Inicializa contagem de dados
          gameState.players.forEach((player) => {
            currentRoundData.playerDiceCounts[player.id] = player.dice.length;
          });
          
          setCurrentRound(currentRoundData);
        }
      }).catch(() => {
        // Ignora erros
      });
    }, (err) => {
      // Ignora erros de rede
      if (err.code !== 'unavailable' && !err.message?.includes('network')) {
        console.error('Erro ao sincronizar histórico:', err);
      }
    });

    return () => unsubscribe();
  }, [gameId, db, gameState.roundNumber, gameState.gameStatus, gameState.players, roundResults]);

  // Inicializa o jogo quando ambos os jogadores entram
  const startGame = useCallback(async () => {
    if (!gameId || !currentUser || !db) {
      setError('Firebase não está configurado.');
      return;
    }

    try {
      const gameRef = doc(db!, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) {
        setError('Jogo não encontrado.');
        return;
      }

      const gameData = gameSnap.data();
      
      if (gameData.players.length < 2) {
        setError('Aguardando outro jogador...');
        return;
      }

      // Rola dados para o jogador atual
      const playerDiceRef = doc(db!, 'games', gameId, 'players', currentUser.uid);
      const playerDiceSnap = await getDoc(playerDiceRef);
      
      if (!playerDiceSnap.exists()) {
        // Primeira vez, rola dados
        await setDoc(playerDiceRef, {
          dice: rollDice(5),
        });
      }

      // Atualiza estado do jogo para 'playing'
      const now = Date.now();
      await updateDoc(gameRef, {
        gameStatus: 'playing',
        status: 'playing',
        roundStartTime: now, // Inicia contagem da primeira rodada
      });

      // Inicia rodada
      const initialRound: RoundResult = {
        roundNumber: 1,
        startTime: now,
        bids: [],
        playerDiceCounts: {},
      };

      setCurrentRound(initialRound);
      setHistory([{
        id: `round-start-${now}`,
        timestamp: now,
        type: 'round_start',
        playerId: currentUser.uid,
        playerName: 'Você',
      }]);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
      setError('Erro ao iniciar jogo.');
    }
  }, [gameId, currentUser, db]);

  // Faz uma aposta
  const makeBid = useCallback(async (quantity: number, value: number) => {
    if (!gameId || !currentUser || !db) {
      setError('Firebase não está configurado.');
      return;
    }

    try {
      const gameRef = doc(db!, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (!gameSnap.exists()) return;

      const gameData = gameSnap.data();
      const currentPlayerIndex = gameData.currentPlayerIndex || 0;
      const currentPlayerId = gameData.players[currentPlayerIndex];

      if (currentPlayerId !== currentUser.uid) {
        setError('Não é sua vez!');
        return;
      }

      const newBid: Bid = {
        quantity,
        value,
        playerId: currentUser.uid,
      };

      const nextPlayerIndex = (currentPlayerIndex + 1) % gameData.players.length;

      // Atualiza aposta e turno
      await updateDoc(gameRef, {
        currentBid: newBid,
        currentPlayerIndex: nextPlayerIndex,
        updatedAt: new Date(),
      });

      // Salva aposta no histórico do Firestore (para resultados das rodadas)
      const now = Date.now();
      const historyRef = collection(db, 'games', gameId, 'history');
      const historyEntryDoc = doc(historyRef, `bid-${now}-${currentUser.uid}`);
      const currentPlayer = gameState.players.find(p => p.id === currentUser.uid);
      await setDoc(historyEntryDoc, {
        id: `bid-${now}-${currentUser.uid}`,
        timestamp: now,
        type: 'bid',
        playerId: currentUser.uid,
        playerName: currentPlayer?.name || 'Você',
        roundNumber: gameData.roundNumber || 1,
        data: { bid: newBid },
      });

      // Adiciona ao histórico local
      const historyEntry: GameHistoryEntry = {
        id: `bid-${now}-${currentUser.uid}`,
        timestamp: now,
        type: 'bid',
        playerId: currentUser.uid,
        playerName: currentPlayer?.name || 'Você',
        data: { bid: newBid },
      };
      setHistory((h) => [...h, historyEntry]);

      setError(null);
    } catch (err) {
      console.error('Erro ao fazer aposta:', err);
      setError('Erro ao fazer aposta.');
    }
  }, [gameId, currentUser, db]);

  // Duvida/Desafio
  const challenge = useCallback(async () => {
    if (!gameId || !currentUser || !db) {
      setError('Firebase não está configurado.');
      return;
    }

    try {
      // Chama Cloud Function para resolver desafio
      // Nota: Os erros ERR_INTERNET_DISCONNECTED que aparecem no console durante
      // esta chamada são normais - são do navegador tentando reconectar os listeners
      // do Firestore enquanto a função executa. A função ainda funciona normalmente.
      const functions = getFunctions(undefined, 'southamerica-east1');
      const resolveChallenge = httpsCallable(functions, 'resolveChallenge');
      
      await resolveChallenge({ gameId });
      setError(null);
    } catch (err: any) {
      // Não loga erros de rede (são esperados durante a execução da função)
      const isNetworkError = err?.code === 'unavailable' || 
                            err?.message?.includes('network') ||
                            err?.code === 'internal' ||
                            err?.code === 'deadline-exceeded' ||
                            err?.code === 'cancelled';
      
      if (isNetworkError) {
        // Não mostra erro se for apenas problema de rede temporário
        // A função pode ter sido executada mesmo com esses erros
        setError(null);
      } else {
        // Para outros erros, mostra mensagem apropriada
        const errorMessage = err?.code === 'not-found' 
          ? 'Cloud Function não encontrada. Verifique se foi deployada.'
          : 'Erro ao resolver desafio. Tente novamente.';
        
        setError(errorMessage);
        console.error('Erro ao duvidar:', err);
      }
    }
  }, [gameId, currentUser, db]);

  const startNewRound = useCallback(() => {
    // Rodadas são iniciadas automaticamente pelo Cloud Function ou pela lógica de desafio
    console.log('startNewRound chamado - geralmente gerenciado pelo Cloud Function');
  }, []);

  const leaveGame = useCallback(async () => {
    console.log('[leaveGame] Jogador está saindo do jogo');
    await finishGameForCurrentPlayer();
    console.log('[leaveGame] Jogador saiu do jogo');
  }, [finishGameForCurrentPlayer]);

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
    history,
    roundResults,
    currentRound,
    loading,
    error,
    processAITurn: undefined, // IA não é usada no modo online
    statusMessage,
    shouldReturnToMenu,
  };
}
