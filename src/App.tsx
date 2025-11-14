import { useState } from 'react'
import GameBoard from './components/GameBoard'
import ModeSelector from './components/ModeSelector'
import Lobby from './components/Lobby'
import { isFirebaseConfigured } from './services/firebase'
import './App.css'

type GameMode = 'select' | 'local' | 'online' | 'lobby';

function App() {
  const [mode, setMode] = useState<GameMode>('select');
  const [gameId, setGameId] = useState<string | null>(null);

  const handleModeSelect = (selectedMode: 'local' | 'online') => {
    if (selectedMode === 'local') {
      setMode('local');
    } else {
      setMode('lobby');
    }
  };

  const handleBackToModeSelect = () => {
    setMode('select');
    setGameId(null);
  };

  const handleGameStart = (id: string) => {
    setGameId(id);
    setMode('online');
  };

  return (
    <div className="App">
      <h1>Liar's Dice (Dado Mentiroso)</h1>
      
      {mode === 'select' && (
        <ModeSelector 
          onSelectMode={handleModeSelect}
          isFirebaseConfigured={isFirebaseConfigured()}
        />
      )}

      {mode === 'lobby' && (
        <Lobby 
          onGameStart={handleGameStart}
          onBack={handleBackToModeSelect}
        />
      )}

      {(mode === 'local' || mode === 'online') && (
        <GameBoard 
          mode={mode === 'online' ? 'online' : 'local'}
          gameId={gameId || undefined}
          onBack={handleBackToModeSelect}
        />
      )}
    </div>
  )
}

export default App

