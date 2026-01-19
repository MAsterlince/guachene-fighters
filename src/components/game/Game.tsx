import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import { MainMenu } from '@/components/game/MainMenu';
import { CharacterSelect } from '@/components/game/CharacterSelect';
import { MapSelect } from '@/components/game/MapSelect';
import { FightScreen } from '@/components/game/FightScreen';

const Game: React.FC = () => {
  const {
    state,
    setMode,
    setScreen,
    setPlayer1Character,
    setPlayer2Character,
    setSelectedMap,
    resetGame,
    goToCharacterSelect,
  } = useGameState();

  const handleSelectMode = (mode: 'cpu' | 'pvp') => {
    setMode(mode);
    setScreen('character-select');
  };

  const handleSelectCharacters = (p1: typeof state.player1Character, p2: typeof state.player2Character) => {
    if (p1 && p2) {
      setPlayer1Character(p1);
      setPlayer2Character(p2);
      setScreen('map-select');
    }
  };

  const handleSelectMap = (map: typeof state.selectedMap) => {
    if (map) {
      setSelectedMap(map);
      setScreen('fight');
    }
  };

  const handleBackToMenu = () => {
    resetGame();
  };

  const handleBackToCharacterSelect = () => {
    goToCharacterSelect();
  };

  return (
    <div className="min-h-screen bg-background">
      {state.screen === 'menu' && (
        <MainMenu onSelectMode={handleSelectMode} />
      )}

      {state.screen === 'character-select' && (
        <CharacterSelect
          mode={state.mode}
          onSelectCharacters={handleSelectCharacters}
          onBack={handleBackToMenu}
        />
      )}

      {state.screen === 'map-select' && (
        <MapSelect
          onSelectMap={handleSelectMap}
          onBack={handleBackToCharacterSelect}
        />
      )}

      {state.screen === 'fight' && state.player1Character && state.player2Character && state.selectedMap && (
        <FightScreen
          player1Character={state.player1Character}
          player2Character={state.player2Character}
          selectedMap={state.selectedMap}
          mode={state.mode}
          onCharacterSelect={handleBackToCharacterSelect}
          onMainMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default Game;
