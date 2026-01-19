export type GameMode = 'cpu' | 'pvp';

export type GameScreen = 'menu' | 'character-select' | 'map-select' | 'fight';

export interface Character {
  id: string;
  name: string;
  image: string;
  color: string;
}

export interface GameMap {
  id: string;
  name: string;
  image: string;
}

export interface Fighter {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isBlocking: boolean;
  isAttacking: boolean;
  attackType: 'none' | 'light' | 'heavy';
  facingRight: boolean;
  state: 'idle' | 'walking' | 'jumping' | 'attacking' | 'blocking' | 'hit' | 'defeated' | 'victory';
  character: Character;
}

export interface GameState {
  screen: GameScreen;
  mode: GameMode;
  player1Character: Character | null;
  player2Character: Character | null;
  selectedMap: GameMap | null;
  isPaused: boolean;
  winner: 1 | 2 | null;
  roundTime: number;
}

export interface Controls {
  up: string;
  down: string;
  left: string;
  right: string;
  lightAttack: string;
  heavyAttack: string;
}

export const PLAYER1_CONTROLS: Controls = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  lightAttack: 'c',
  heavyAttack: 'v',
};

export const PLAYER2_CONTROLS: Controls = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  lightAttack: 'o',
  heavyAttack: 'p',
};
