import { useState, useCallback } from 'react';
import { GameState, GameScreen, GameMode, Character, GameMap } from '@/types/game';

const initialState: GameState = {
  screen: 'menu',
  mode: 'pvp',
  player1Character: null,
  player2Character: null,
  selectedMap: null,
  isPaused: false,
  winner: null,
  roundTime: 99,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = useCallback((screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setPlayer1Character = useCallback((character: Character) => {
    setState(prev => ({ ...prev, player1Character: character }));
  }, []);

  const setPlayer2Character = useCallback((character: Character) => {
    setState(prev => ({ ...prev, player2Character: character }));
  }, []);

  const setSelectedMap = useCallback((map: GameMap) => {
    setState(prev => ({ ...prev, selectedMap: map }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const setWinner = useCallback((winner: 1 | 2 | null) => {
    setState(prev => ({ ...prev, winner }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const goToCharacterSelect = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      screen: 'character-select',
      player1Character: null,
      player2Character: null,
      winner: null,
    }));
  }, []);

  const startFight = useCallback(() => {
    setState(prev => ({ ...prev, screen: 'fight', isPaused: false, winner: null }));
  }, []);

  return {
    state,
    setScreen,
    setMode,
    setPlayer1Character,
    setPlayer2Character,
    setSelectedMap,
    togglePause,
    setWinner,
    resetGame,
    goToCharacterSelect,
    startFight,
  };
}
