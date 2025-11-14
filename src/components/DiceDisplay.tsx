import './DiceDisplay.css';

interface DiceDisplayProps {
  dice: number[];
  isHidden?: boolean;
  showCount?: boolean;
}

export default function DiceDisplay({ 
  dice, 
  isHidden = false,
  showCount = false 
}: DiceDisplayProps) {
  if (isHidden) {
    return (
      <div className="dice-container">
        {showCount && <div className="dice-count">Dados: {dice.length}</div>}
        <div className="dice-hidden">
          {dice.map((_, index) => (
            <div key={index} className="die die-hidden">?</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dice-container">
      {showCount && <div className="dice-count">Dados: {dice.length}</div>}
      <div className="dice-visible">
        {dice.map((value, index) => (
          <div key={index} className="die">
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

