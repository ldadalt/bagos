import { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { rollDice } from '../game/gameLogic';
import './Lobby.css';

interface LobbyProps {
  onGameStart: (gameId: string) => void;
  onBack: () => void;
}

interface GameRoom {
  id: string;
  hostId: string;
  hostName: string;
  players: string[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: any;
}

const STALE_ROOM_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

export default function Lobby({ onGameStart, onBack }: LobbyProps) {
  const [user, setUser] = useState<User | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [ownedRoom, setOwnedRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Autenticação anônima
  useEffect(() => {
    if (!auth) {
      setError('Firebase não está configurado.');
      setLoading(false);
      return;
    }

    const firebaseAuth = auth;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Faz login anônimo
        signInAnonymously(firebaseAuth)
          .then(() => {
            setLoading(false);
          })
          .catch((err) => {
            console.error('Erro ao fazer login:', err);
            setError('Erro ao conectar. Verifique sua conexão com a internet.');
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  // Lista salas disponíveis
  useEffect(() => {
    if (!user || !db) return;

    const roomsQuery = query(
      collection(db, 'games'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const rooms: GameRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rooms.push({
          id: doc.id,
          hostId: data.hostId || '',
          hostName: data.hostName || 'Anônimo',
          players: data.players || [],
          status: data.status || 'waiting',
          createdAt: data.createdAt,
        });
      });
      const now = Date.now();
      const openRooms = rooms
        .filter(room => {
          if (room.status !== 'waiting' || room.players.length >= 2) {
            return false;
          }
          const createdAtMs = room.createdAt?.toMillis
            ? room.createdAt.toMillis()
            : room.createdAt instanceof Date
              ? room.createdAt.getTime()
              : Number(room.createdAt) || 0;

          if (!createdAtMs) {
            return true;
          }

          return now - createdAtMs <= STALE_ROOM_TIMEOUT_MS;
        })
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

      setAvailableRooms(openRooms);

      const myRoom = user
        ? rooms.find(room => room.hostId === user.uid && room.status === 'waiting')
        : null;
      setOwnedRoom(myRoom || null);
    }, (err) => {
      console.error('Erro ao buscar salas:', err);
      // Não mostra erro crítico se for apenas problema de conexão
      if (err.code === 'unavailable' || err.message?.includes('network')) {
        // O Firebase vai tentar reconectar automaticamente
        return;
      }
      setError('Erro ao buscar salas disponíveis.');
    });

    return () => unsubscribe();
  }, [user]);

  const createRoom = async () => {
    if (!user || !db) {
      setError('Firebase não está configurado ou você não está autenticado.');
      return;
    }

    try {
      const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const gameRef = doc(db, 'games', gameId);

      await setDoc(gameRef, {
        hostId: user.uid,
        hostName: user.displayName || 'Jogador ' + user.uid.slice(0, 6),
        players: [user.uid],
        playerNames: { [user.uid]: user.displayName || 'Jogador ' + user.uid.slice(0, 6) },
        status: 'waiting',
        createdAt: new Date(),
        currentPlayerIndex: 0,
        currentBid: null,
        lastRoundLoserIndex: 0,
        roundNumber: 1,
        gameStatus: 'waiting',
      });

      setRoomCode(gameId);
      setError(null);
      
      // Inicia o jogo automaticamente (modo aguardando segundo jogador)
      onGameStart(gameId);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      setError('Erro ao criar sala. Tente novamente.');
    }
  };

  const joinRoom = async () => {
    if (!user || !db) {
      setError('Firebase não está configurado ou você não está autenticado.');
      return;
    }

    if (!roomCode.trim()) {
      setError('Digite um código de sala.');
      return;
    }

    try {
      const gameRef = doc(db, 'games', roomCode.trim());
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setError('Sala não encontrada. Verifique o código.');
        return;
      }

      const gameData = gameSnap.data();
      
      if (gameData.status !== 'waiting') {
        setError('Esta sala já está em jogo.');
        return;
      }

      // Se já está na sala, apenas inicia o jogo (não dá erro)
      if (gameData.players.includes(user.uid)) {
        // Se já tem 2 jogadores, inicia o jogo
        if (gameData.players.length >= 2) {
          onGameStart(roomCode.trim());
          setError(null);
          return;
        }
        // Se ainda não tem 2 jogadores, apenas inicia o jogo (já está na sala)
        onGameStart(roomCode.trim());
        setError(null);
        return;
      }

      if (gameData.players.length >= 2) {
        setError('Esta sala está cheia.');
        return;
      }

      // Adiciona jogador à sala
      const allPlayers = [...gameData.players, user.uid];
      const updatedPlayerNames = {
        ...gameData.playerNames,
        [user.uid]: user.displayName || 'Jogador ' + user.uid.slice(0, 6),
      };
      
      // Usa updateDoc em vez de setDoc para garantir que é uma atualização
      await updateDoc(gameRef, {
        players: allPlayers,
        playerNames: updatedPlayerNames,
        status: 'waiting',
        gameStatus: 'waiting',
      });

      // Se agora tem 2 jogadores, muda para playing e inicializa dados
      if (allPlayers.length >= 2) {
        // Inicializa dados apenas do jogador autenticado para respeitar as regras do Firestore
        const playerDiceRef = doc(db, 'games', roomCode.trim(), 'players', user.uid);
        await setDoc(playerDiceRef, {
          dice: rollDice(5),
        }, { merge: true });

        // Muda status para playing
        await setDoc(gameRef, {
          status: 'playing',
          gameStatus: 'playing',
          currentPlayerIndex: 0,
          currentBid: null,
          roundNumber: 1,
        }, { merge: true });
      }

      // Inicia o jogo
      onGameStart(roomCode.trim());
      setError(null);
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      setError('Erro ao entrar na sala. Tente novamente.');
    }
  };

  const joinAvailableRoom = async (roomId: string) => {
    setRoomCode(roomId);
    await joinRoom();
  };

  const closeOwnedRoom = async () => {
    if (!ownedRoom || !db) return;

    try {
      const gameRef = doc(db, 'games', ownedRoom.id);
      await updateDoc(gameRef, {
        status: 'finished',
        gameStatus: 'finished',
        updatedAt: new Date(),
      });
      setOwnedRoom(null);
      setRoomCode('');
      setError(null);
    } catch (err) {
      console.error('Erro ao fechar sala:', err);
      setError('Não foi possível fechar a sala. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="lobby">
        <div className="lobby-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <button className="back-button" onClick={onBack}>
        ← Voltar
      </button>

      <h2>Lobby</h2>

      {user && (
        <div className="user-info">
          <p>Conectado como: <strong>{user.displayName || 'Jogador ' + user.uid.slice(0, 6)}</strong></p>
          <p className="user-id">ID: {user.uid}</p>
        </div>
      )}

      {error && (
        <div className="lobby-error">{error}</div>
      )}

      <div className="lobby-actions">
        <div className="lobby-section">
          <h3>Criar Sala</h3>
          <button className="lobby-button create-button" onClick={createRoom}>
            Criar Nova Sala
          </button>
          {ownedRoom && (
            <button className="lobby-button close-button" onClick={closeOwnedRoom}>
              Fechar Minha Sala
            </button>
          )}
          {roomCode && (
            <div className="room-code">
              <p>Código da sala:</p>
              <div className="room-code-display">{roomCode}</div>
              <p className="room-code-hint">Compartilhe este código com seu amigo!</p>
            </div>
          )}
        </div>

        <div className="lobby-section">
          <h3>Entrar por Código</h3>
          <div className="join-room">
            <input
              type="text"
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="room-code-input"
            />
            <button className="lobby-button join-button" onClick={joinRoom}>
              Entrar
            </button>
          </div>
        </div>
      </div>

      <div className="available-rooms">
        <h3>Salas Disponíveis ({availableRooms.length})</h3>
        {availableRooms.length === 0 ? (
          <p className="no-rooms">Nenhuma sala disponível no momento.</p>
        ) : (
          <div className="rooms-list">
            {availableRooms.map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-info">
                  <strong>{room.hostName}</strong>
                  <span className="room-players">{room.players.length}/2 jogadores</span>
                </div>
                <button
                  className="lobby-button small-button"
                  onClick={() => joinAvailableRoom(room.id)}
                  disabled={room.players.length >= 2}
                >
                  {room.players.length >= 2 ? 'Cheia' : 'Entrar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

