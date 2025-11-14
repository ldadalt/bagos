// Tipos e interfaces compartilhados do jogo

export interface Player {
  id: string;
  name: string;
  dice: number[];
  isHuman: boolean;
  isAI?: boolean;
  aiPersonality?: 'cautious' | 'aggressive' | 'analytical' | 'default';
}

export interface Bid {
  quantity: number;
  value: number;
  playerId: string;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentBid: Bid | null;
  lastRoundLoserIndex: number;
  roundNumber: number;
  gameStatus: GameStatus;
  winnerId?: string;
}

export interface GameActions {
  makeBid: (quantity: number, value: number) => void;
  challenge: () => void;
  startNewRound: () => void;
  startGame: () => void;
  leaveGame?: () => Promise<void>;
}

// Tipos para histórico e estatísticas
export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  type: 'bid' | 'challenge' | 'round_start' | 'round_end';
  playerId: string;
  playerName: string;
  data?: {
    bid?: Bid;
    challengeResult?: {
      bidderWon: boolean;
      actualCount: number;
      loserId: string;
      loserName: string;
    };
  };
}

export interface RoundResult {
  roundNumber: number;
  startTime: number;
  endTime?: number;
  bids: Array<{
    playerId: string;
    playerName: string;
    bid: Bid;
  }>;
  challengeResult?: {
    challengerId: string;
    challengerName: string;
    bidderId: string;
    bidderName: string;
    bid: Bid;
    actualCount: number;
    bidderWon: boolean;
    loserId: string;
    loserName: string;
  };
  playerDiceCounts: Record<string, number>; // Quantidade de dados de cada jogador no final da rodada
}

