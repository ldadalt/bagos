import { useEffect, useRef, useCallback } from 'react';
import { useLocalGame } from '../state/useLocalGame';
import { useOnlineGame } from '../state/useOnlineGame';
import PlayerArea from './PlayerArea';
import Controls from './Controls';
import MessageDisplay from './MessageDisplay';
import GameHistory from './GameHistory';
import RoundResults from './RoundResults';
import './GameBoard.css';

interface GameBoardProps {
  mode?: 'local' | 'online';
  gameId?: string;
  onBack?: () => void;
}

export default function GameBoard({ mode = 'local', gameId, onBack }: GameBoardProps) {
  const localGame = useLocalGame();
  const onlineGame = useOnlineGame(gameId);
  
  // Usa o hook apropriado baseado no modo
  const game = mode === 'online' ? onlineGame : localGame;
  const { gameState, actions, processAITurn, history, roundResults, currentRound } = game;
  const statusMessage = mode === 'online' && 'statusMessage' in game ? game.statusMessage : null;
  const shouldReturnToMenu = mode === 'online' && 'shouldReturnToMenu' in game ? game.shouldReturnToMenu : false;
  
  const aiTurnTimeoutRef = useRef<number | null>(null);

  // Processa turno da IA automaticamente (apenas no modo local)
  useEffect(() => {
    if (mode === 'online' || !processAITurn) return;

    if (gameState.gameStatus !== 'playing') {
      if (aiTurnTimeoutRef.current) {
        clearTimeout(aiTurnTimeoutRef.current);
        aiTurnTimeoutRef.current = null;
      }
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer?.isAI) {
      // Limpa timeout anterior se existir
      if (aiTurnTimeoutRef.current) {
        clearTimeout(aiTurnTimeoutRef.current);
      }

      // Espera 1.5 segundos antes da IA jogar (para dar tempo de ver a aposta anterior)
      aiTurnTimeoutRef.current = window.setTimeout(() => {
        processAITurn();
      }, 1500);
    }

    return () => {
      if (aiTurnTimeoutRef.current) {
        clearTimeout(aiTurnTimeoutRef.current);
      }
    };
  }, [gameState.currentPlayerIndex, gameState.currentBid, gameState.gameStatus, processAITurn, mode]);

  const handleBackToMenu = useCallback(async (skipLeave = false) => {
    if (!skipLeave && mode === 'online' && typeof actions.leaveGame === 'function') {
      try {
        console.log('[GameBoard] Chamando leaveGame antes de voltar ao menu');
        await actions.leaveGame();
        console.log('[GameBoard] leaveGame concluído');
      } catch (err) {
        console.error('Erro ao sair do jogo online:', err);
      }
    }
    if (onBack) {
      onBack();
    } else {
      window.location.reload(); // Fallback - voltar ao menu
    }
  }, [mode, actions, onBack]);
  
  useEffect(() => {
    if (mode === 'online' && shouldReturnToMenu) {
      void handleBackToMenu(true);
    }
  }, [mode, shouldReturnToMenu, handleBackToMenu]);

  const handleStartGame = () => {
    actions.startGame();
  };

  const handleBid = (quantity: number, value: number) => {
    actions.makeBid(quantity, value);
  };

  const handleChallenge = () => {
    actions.challenge();
  };

  const getMessage = (): string => {
    if (gameState.gameStatus === 'waiting') {
      return 'Bem-vindo! Clique em "Iniciar Jogo" para começar.';
    }

    if (gameState.gameStatus === 'finished') {
      const winner = gameState.players.find(p => p.id === gameState.winnerId);
      return winner 
        ? `Fim de Jogo! ${winner.name} venceu! 🎉`
        : 'Fim de Jogo!';
    }

    if (gameState.gameStatus === 'playing') {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      
      if (currentPlayer?.isHuman) {
        if (gameState.currentBid) {
          return `Sua vez! Aposte ou duvide.`;
        }
        return 'Nova rodada! Faça sua primeira aposta.';
      }

      if (currentPlayer?.isAI) {
        return `Vez da ${currentPlayer.name}...`;
      }
    }

    return '';
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer?.isHuman && gameState.gameStatus === 'playing';
  const canChallenge = gameState.currentBid !== null && gameState.gameStatus === 'playing';

  // Mostra loading/erro no modo online
  if (mode === 'online') {
    if ('loading' in game && game.loading) {
      return (
        <div className="game-board">
          <div className="game-loading">Carregando jogo...</div>
        </div>
      );
    }

    if ('error' in game && game.error) {
      return (
        <div className="game-board">
          <div className="game-error">{game.error}</div>
          <button onClick={() => handleBackToMenu(false)} className="start-button">
            Voltar ao Menu
          </button>
        </div>
      );
    }
  }

  return (
    <div className="game-board">
      <button 
        className="back-to-menu-button"
        onClick={() => handleBackToMenu(false)}
      >
        ← Voltar ao Menu
      </button>
      <MessageDisplay message={getMessage()} />
      {statusMessage && (
        <div className="connection-status">
          {statusMessage}
        </div>
      )}

      {gameState.gameStatus === 'waiting' && (
        <div className="start-screen">
          <button onClick={handleStartGame} className="start-button">
            {mode === 'online' ? 'Aguardando outro jogador...' : 'Iniciar Jogo'}
          </button>
        </div>
      )}

      {gameState.gameStatus !== 'waiting' && (
        <>
          <div className="game-layout">
            <div className="game-main">
              <div className="game-area">
                {/* Área do Oponente */}
                {gameState.players
                  .filter(p => !p.isHuman)
                  .map((player) => (
                    <PlayerArea
                      key={player.id}
                      player={player}
                      isCurrentPlayer={gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === player.id)}
                    />
                  ))}

                {/* Mesa Central */}
                <div className="table-area">
                  <h2>Mesa</h2>
                  <div className="current-bid">
                    {gameState.currentBid ? (
                      <div>
                        <p>
                          Aposta de{' '}
                          <strong>
                            {gameState.players.find(p => p.id === gameState.currentBid!.playerId)?.name}
                          </strong>
                          :
                        </p>
                        <p className="bid-info">
                          {gameState.currentBid.quantity} dado(s) de valor {gameState.currentBid.value}
                        </p>
                      </div>
                    ) : (
                      <p>Nenhuma aposta feita.</p>
                    )}
                  </div>
                  <div className="round-info">
                    Rodada: {gameState.roundNumber}
                  </div>
                </div>

                {/* Área do Jogador */}
                {gameState.players
                  .filter(p => p.isHuman)
                  .map((player) => (
                    <div key={player.id} className="player-section">
                      <PlayerArea
                        player={player}
                        isCurrentPlayer={gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === player.id)}
                        isHuman={true}
                      />
                      <Controls
                        onBid={handleBid}
                        onChallenge={handleChallenge}
                        disabled={!isHumanTurn}
                        canChallenge={canChallenge}
                        currentBid={gameState.currentBid}
                      />
                    </div>
                  ))}
              </div>

              {/* Tabela de Resultados das Rodadas */}
              <RoundResults 
                roundResults={roundResults} 
                currentRound={currentRound}
                players={gameState.players}
              />
            </div>

            {/* Painel Lateral com Histórico */}
            <div className="game-sidebar">
              <GameHistory history={history} />
            </div>
          </div>

          {gameState.gameStatus === 'finished' && (
            <div className="game-over">
              <button onClick={handleStartGame} className="start-button">
                Jogar Novamente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

