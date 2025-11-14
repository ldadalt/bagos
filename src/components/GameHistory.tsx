import { useRef, useEffect } from 'react';
import type { GameHistoryEntry } from '../types';
import './GameHistory.css';

interface GameHistoryProps {
  history: GameHistoryEntry[];
}

export default function GameHistory({ history }: GameHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final quando há nova entrada
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const renderEntry = (entry: GameHistoryEntry) => {
    switch (entry.type) {
      case 'round_start':
        return (
          <div key={entry.id} className="history-entry round-start">
            <span className="history-time">{formatTime(entry.timestamp)}</span>
            <span className="history-text">
              <strong>Rodada iniciada</strong> - {entry.playerName} começa
            </span>
          </div>
        );

      case 'bid':
        return (
          <div key={entry.id} className="history-entry bid">
            <span className="history-time">{formatTime(entry.timestamp)}</span>
            <span className="history-text">
              <strong>{entry.playerName}</strong> apostou{' '}
              <strong>{entry.data?.bid?.quantity}</strong> dado(s) de valor{' '}
              <strong>{entry.data?.bid?.value}</strong>
            </span>
          </div>
        );

      case 'challenge':
        const result = entry.data?.challengeResult;
        return (
          <div key={entry.id} className="history-entry challenge">
            <span className="history-time">{formatTime(entry.timestamp)}</span>
            <span className="history-text">
              <strong>{entry.playerName}</strong> duvidou! Havia{' '}
              <strong>{result?.actualCount}</strong> dado(s).{' '}
              <strong>{result?.loserName}</strong> perdeu um dado.
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-history">
      <h3>Histórico de Jogadas</h3>
      <div className="history-list" ref={scrollRef}>
        {history.length === 0 ? (
          <div className="history-empty">Nenhuma jogada ainda</div>
        ) : (
          history.map(renderEntry)
        )}
      </div>
    </div>
  );
}

