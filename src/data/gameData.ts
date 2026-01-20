import { Character, GameMap } from '@/types/game';

import andresImg from '@/assets/characters/andres.png';
import jordanImg from '@/assets/characters/jordan.png';
import oliverImg from '@/assets/characters/oliver.png';
import camiloImg from '@/assets/characters/camilo.png';

import bogotaImg from '@/assets/maps/bogota.png';
import medellinImg from '@/assets/maps/medellin.png';
import barImg from '@/assets/maps/bar.png';

export const CHARACTERS: Character[] = [
  {
    id: 'camilo',
    name: 'Camilo',
    image: camiloImg,
    color: '#1a1a2e',
  },
  {
    id: 'oliver',
    name: 'Oliver',
    image: oliverImg,
    color: '#3b5998',
  },
  {
    id: 'andres',
    name: 'Andres',
    image: andresImg,
    color: '#2563eb',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    image: jordanImg,
    color: '#1f2937',
  },
];

export const MAPS: GameMap[] = [
  {
    id: 'bogota',
    name: 'Bogotá',
    image: bogotaImg,
  },
  {
    id: 'medellin',
    name: 'Medellín',
    image: medellinImg,
  },
  {
    id: 'bar',
    name: 'Bar',
    image: barImg,
  },
];

export const GAME_CONFIG = {
  ARENA_WIDTH: 1200,
  ARENA_HEIGHT: 500,
  GROUND_Y: 380,
  FIGHTER_WIDTH: 120,
  FIGHTER_HEIGHT: 200,
  GRAVITY: 0.5,
  JUMP_FORCE: -12,
  MOVE_SPEED: 4.5, // Smooth floating point movement
  LIGHT_DAMAGE: 8,
  HEAVY_DAMAGE: 15,
  ATTACK_RANGE: 100,
  BLOCK_REDUCTION: 0.3,
  MAX_HEALTH: 100,
  ROUND_TIME: 99,
};
