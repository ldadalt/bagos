/**
 * Cloud Functions para Liar's Dice
 */

import {onCall} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();

// Configurações globais
setGlobalOptions({
  maxInstances: 10,
  region: "southamerica-east1", // Região mais próxima do Brasil
});

/**
 * Resolve um desafio de forma segura no servidor
 */
export const resolveChallenge = onCall(
  {
    region: "southamerica-east1", // Região mais próxima do Brasil
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request) => {
    // Verifica autenticação
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const {gameId} = request.data;
    if (!gameId) {
      throw new Error("gameId é obrigatório");
    }

    const db = admin.firestore();
    const gameRef = db.collection("games").doc(gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
      throw new Error("Jogo não encontrado");
    }

    const gameData = gameDoc.data();
    if (!gameData || !gameData.currentBid) {
      throw new Error("Não há aposta para desafiar");
    }

    // Busca dados de todos os jogadores
    const allDice: number[][] = [];
    const playerNames: Record<string, string> = gameData.playerNames || {};
    for (const playerId of gameData.players) {
      const playerRef = gameRef.collection("players").doc(playerId);
      const playerDoc = await playerRef.get();
      allDice.push(playerDoc.data()?.dice || []);
      if (!playerNames[playerId]) {
        playerNames[playerId] = "Jogador " + playerId.slice(0, 6);
      }
    }

    // Resolve o desafio (lógica do jogo)
    const bid = gameData.currentBid;
    const allDiceFlat = allDice.flat();
    let count = 0;
    for (const die of allDiceFlat) {
      if (die === bid.value || die === 1) {
        count++;
      }
    }

    const bidderWon = count >= bid.quantity;
    const challengerIndex = gameData.currentPlayerIndex;
    const challengerId = gameData.players[challengerIndex];
    const bidderIndex = gameData.players.findIndex(
      (id: string) => id === bid.playerId
    );
    const bidderId = bid.playerId;
    const loserIndex = bidderWon ? challengerIndex : bidderIndex;
    const loserId = gameData.players[loserIndex];

    // Remove um dado do perdedor
    const loserRef = gameRef.collection("players").doc(loserId);
    const loserDoc = await loserRef.get();
    const loserDice = loserDoc.data()?.dice || [];
    const newDice = loserDice.slice(0, -1);

    await loserRef.update({dice: newDice});

    // Calcula quantidade de dados de cada jogador após o desafio
    const playerDiceCounts: Record<string, number> = {};
    for (let i = 0; i < gameData.players.length; i++) {
      const playerId = gameData.players[i];
      const playerRef = gameRef.collection("players").doc(playerId);
      const playerDoc = await playerRef.get();
      const diceCount = playerId === loserId ? newDice.length :
        (playerDoc.data()?.dice || []).length;
      playerDiceCounts[playerId] = diceCount;
    }

    // Salva resultado da rodada
    const currentRoundNumber = gameData.roundNumber || 1;
    const roundResultRef = gameRef.collection("roundResults").doc(
      `round-${currentRoundNumber}`
    );

    // Busca histórico de apostas da rodada (se existir)
    // Busca todas as entradas de histórico recentes e filtra pela rodada
    const historySnap = await gameRef.collection("history")
      .orderBy("timestamp", "desc")
      .limit(50) // Limita para evitar buscar tudo
      .get();

    const bids: Array<{
      playerId: string;
      playerName: string;
      bid: {quantity: number; value: number; playerId: string};
    }> = [];

    // Coleta todas as apostas da rodada atual
    const roundBids: Array<{
      timestamp: number;
      playerId: string;
      playerName: string;
      bid: {quantity: number; value: number; playerId: string};
    }> = [];

    historySnap.forEach((doc) => {
      const data = doc.data();
      // Filtra apenas apostas da rodada atual
      if (data.type === "bid" &&
          data.data?.bid &&
          (data.roundNumber === currentRoundNumber)) {
        const playerName = playerNames[data.playerId] ||
          data.playerName || "Jogador";
        roundBids.push({
          timestamp: data.timestamp || 0,
          playerId: data.playerId,
          playerName: playerName,
          bid: data.data.bid,
        });
      }
    });

    // Ordena por timestamp (mais antiga primeiro)
    roundBids.sort((a, b) => a.timestamp - b.timestamp);
    bids.push(...roundBids.map((b) => ({
      playerId: b.playerId,
      playerName: b.playerName,
      bid: b.bid,
    })));

    await roundResultRef.set({
      roundNumber: currentRoundNumber,
      startTime: gameData.roundStartTime || Date.now(),
      endTime: Date.now(),
      bids: bids,
      challengeResult: {
        challengerId: challengerId,
        challengerName: playerNames[challengerId] || "Jogador",
        bidderId: bidderId,
        bidderName: playerNames[bidderId] || "Jogador",
        bid: bid,
        actualCount: count,
        bidderWon: bidderWon,
        loserId: loserId,
        loserName: playerNames[loserId] || "Jogador",
      },
      playerDiceCounts: playerDiceCounts,
    });

    // Verifica se o jogo terminou
    const winnerId = newDice.length === 0 ?
      gameData.players.find((id: string) => id !== loserId) : null;

    // Atualiza estado do jogo
    const updates: {
      currentBid: null;
      lastRoundLoserIndex: number;
      currentPlayerIndex: number;
      roundNumber: number;
      roundStartTime?: number;
      updatedAt: admin.firestore.FieldValue;
      gameStatus?: string;
      winnerId?: string;
    } = {
      currentBid: null,
      lastRoundLoserIndex: loserIndex,
      currentPlayerIndex: loserIndex,
      roundNumber: (gameData.roundNumber || 1) + 1,
      roundStartTime: Date.now(), // Inicia nova rodada
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (winnerId) {
      updates.gameStatus = "finished";
      updates.winnerId = winnerId;
    } else {
      // Rola novos dados para todos
      for (const playerId of gameData.players) {
        const playerRef = gameRef.collection("players").doc(playerId);
        const playerDoc = await playerRef.get();
        const currentDice = playerDoc.data()?.dice || [];
        await playerRef.update({dice: rollDice(currentDice.length)});
      }
    }

    await gameRef.update(updates);

    return {
      bidderWon,
      actualCount: count,
      loserId,
    };
  });

/**
 * Rola dados aleatórios
 * @param {number} numDice - Número de dados a rolar
 * @return {number[]} Array com os valores dos dados rolados (1-6)
 */
function rollDice(numDice: number): number[] {
  const dice: number[] = [];
  for (let i = 0; i < numDice; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1);
  }
  return dice;
}
