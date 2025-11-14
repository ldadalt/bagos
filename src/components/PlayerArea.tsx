import './PlayerArea.css';
import DiceDisplay from './DiceDisplay';
import type { Player } from '../types';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  isHuman?: boolean;
}

export default function PlayerArea({ 
  player, 
  isCurrentPlayer,
  isHuman = false 
}: PlayerAreaProps) {
  return (
    <div className={`player-area ${isCurrentPlayer ? 'current-player' : ''}`}>
      <h2>{player.name}</h2>
      <DiceDisplay 
        dice={player.dice} 
        isHidden={!isHuman} 
        showCount={true}
      />
    </div>
  );
}

