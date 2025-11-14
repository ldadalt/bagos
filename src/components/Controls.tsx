import { useState } from 'react';
import './Controls.css';

interface ControlsProps {
  onBid: (quantity: number, value: number) => void;
  onChallenge: () => void;
  disabled: boolean;
  canChallenge: boolean;
  currentBid: { quantity: number; value: number } | null;
}

export default function Controls({ 
  onBid, 
  onChallenge, 
  disabled,
  canChallenge,
  currentBid 
}: ControlsProps) {
  const [quantity, setQuantity] = useState(1);
  const [value, setValue] = useState(1);

  const handleBid = () => {
    if (quantity > 0 && value >= 1 && value <= 6) {
      onBid(quantity, value);
      // Reset para valores mínimos após apostar
      if (currentBid) {
        setQuantity(currentBid.quantity);
        setValue(currentBid.value + 1 > 6 ? 2 : currentBid.value + 1);
      }
    }
  };

  return (
    <div className="controls">
      <div className="bid-controls">
        <label htmlFor="quantity">Qtd:</label>
        <input
          type="number"
          id="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          disabled={disabled}
        />
        <label htmlFor="value">Valor:</label>
        <input
          type="number"
          id="value"
          min="1"
          max="6"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value) || 1)}
          disabled={disabled}
        />
        <button 
          onClick={handleBid}
          disabled={disabled}
          className="bid-button"
        >
          Apostar
        </button>
      </div>
      <button 
        onClick={onChallenge}
        disabled={disabled || !canChallenge}
        className="challenge-button"
      >
        Duvidar
      </button>
    </div>
  );
}

