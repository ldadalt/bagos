import './ModeSelector.css';

interface ModeSelectorProps {
  onSelectMode: (mode: 'local' | 'online') => void;
  isFirebaseConfigured: boolean;
}

export default function ModeSelector({ onSelectMode, isFirebaseConfigured }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h2>Escolha o Modo de Jogo</h2>
      <div className="mode-options">
        <div className="mode-card" onClick={() => onSelectMode('local')}>
          <div className="mode-icon">🎮</div>
          <h3>Modo Local</h3>
          <p>Jogue contra a IA no seu navegador</p>
          <button className="mode-button">Jogar Local</button>
        </div>

        <div 
          className={`mode-card ${!isFirebaseConfigured ? 'disabled' : ''}`}
          onClick={() => isFirebaseConfigured && onSelectMode('online')}
        >
          <div className="mode-icon">🌐</div>
          <h3>Modo Online</h3>
          <p>Jogue contra outros jogadores em tempo real</p>
          {isFirebaseConfigured ? (
            <button className="mode-button">Jogar Online</button>
          ) : (
            <div className="mode-warning">
              ⚠️ Firebase não configurado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

