import type { RoundResult, Player } from '../types';
import './RoundResults.css';

interface RoundResultsProps {
  roundResults: RoundResult[];
  currentRound: RoundResult | null;
  players?: Player[]; // Opcional: para exibir nomes corretos dos jogadores
}

export default function RoundResults({ roundResults, currentRound, players = [] }: RoundResultsProps) {
  const allRounds = currentRound ? [...roundResults, currentRound] : roundResults;
  
  // Função helper para obter nome do jogador pelo ID
  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.name || `Jogador ${playerId.slice(0, 6)}`;
  };
  
  // Função helper para formatar contagem de dados
  const formatDiceCounts = (playerDiceCounts: Record<string, number>) => {
    if (players.length > 0) {
      // Modo online: usa os players passados
      return Object.entries(playerDiceCounts).map(([playerId, count]) => ({
        name: getPlayerName(playerId),
        count,
      }));
    } else {
      // Modo local: usa as chaves padrão
      return [
        { name: 'Você', count: playerDiceCounts.player || 0 },
        { name: 'IA', count: playerDiceCounts.ai || 0 },
      ].filter(p => p.count !== undefined);
    }
  };

  if (allRounds.length === 0) {
    return (
      <div className="round-results">
        <h3>Resultados das Rodadas</h3>
        <div className="rounds-empty">Nenhuma rodada concluída ainda</div>
      </div>
    );
  }

  return (
    <div className="round-results">
      <h3>Resultados das Rodadas</h3>
      <div className="rounds-table-container">
        <table className="rounds-table">
          <thead>
            <tr>
              <th>Rodada</th>
              <th>Apostas</th>
              <th>Desafio</th>
              <th>Perdedor</th>
              <th>Dados Finais</th>
            </tr>
          </thead>
          <tbody>
            {allRounds.map((round, index) => {
              const isCurrentRoundRow = index === allRounds.length - 1 && currentRound;
              const rowKey = isCurrentRoundRow ? `${round.roundNumber}-current` : `${round.roundNumber}`;

              return (
              <tr key={rowKey} className={isCurrentRoundRow ? 'current-round' : ''}>
                <td className="round-number">#{round.roundNumber}</td>
                <td className="round-bids">
                  {round.bids.length === 0 ? (
                    <span className="no-bids">-</span>
                  ) : (
                    <div className="bids-list">
                      {round.bids.map((bidEntry, bidIndex) => (
                        <div key={bidIndex} className="bid-entry">
                          <span className="bid-player">{bidEntry.playerName}:</span>
                          <span className="bid-value">{bidEntry.bid.quantity}×{bidEntry.bid.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="round-challenge">
                  {round.challengeResult ? (
                    <div className="challenge-info">
                      <div className="challenge-detail">
                        {round.challengeResult.challengerName} duvidou
                      </div>
                      <div className="challenge-result">
                        {round.challengeResult.actualCount} dado(s) encontrado(s)
                      </div>
                    </div>
                  ) : (
                    <span className="no-challenge">-</span>
                  )}
                </td>
                <td className="round-loser">
                  {round.challengeResult ? (
                    <span className="loser-name">{round.challengeResult.loserName}</span>
                  ) : (
                    <span className="no-loser">-</span>
                  )}
                </td>
                <td className="round-dice-counts">
                  <div className="dice-counts">
                    {formatDiceCounts(round.playerDiceCounts).map((playerCount, idx) => (
                      <span key={idx} className="dice-count">
                        {playerCount.name}: <strong>{playerCount.count}</strong>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

