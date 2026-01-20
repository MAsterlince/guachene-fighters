import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Character, GameMap, Fighter as FighterType, GameMode, PLAYER1_CONTROLS, PLAYER2_CONTROLS } from '@/types/game';
import { GAME_CONFIG } from '@/data/gameData';
import { HealthBar } from './HealthBar';
import { AnimatedFighter } from './AnimatedFighter';
import { PauseMenu } from './PauseMenu';
import { VictoryScreen } from './VictoryScreen';

interface FightScreenProps {
  player1Character: Character;
  player2Character: Character;
  selectedMap: GameMap;
  mode: GameMode;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

const ARENA_WIDTH = 1200;
const ARENA_HEIGHT = 600;
const PARALLAX_AMOUNT = 100; // How much the background moves

const createFighter = (character: Character, isPlayer2: boolean): FighterType => ({
  id: character.id,
  name: character.name,
  health: GAME_CONFIG.MAX_HEALTH,
  maxHealth: GAME_CONFIG.MAX_HEALTH,
  x: isPlayer2 ? ARENA_WIDTH - 300 : 100,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isBlocking: false,
  isAttacking: false,
  attackType: 'none',
  facingRight: !isPlayer2,
  state: 'idle',
  character,
});

export function FightScreen({
  player1Character,
  player2Character,
  selectedMap,
  mode,
  onCharacterSelect,
  onMainMenu,
}: FightScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [fighter1, setFighter1] = useState<FighterType>(() => createFighter(player1Character, false));
  const [fighter2, setFighter2] = useState<FighterType>(() => createFighter(player2Character, true));
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [roundTime, setRoundTime] = useState(GAME_CONFIG.ROUND_TIME);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; x: number; y: number; damage: number }>>([]);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const attackCooldown = useRef<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const damageIdRef = useRef(0);

  // CPU AI state
  const cpuActionTimer = useRef(0);
  const cpuAction = useRef<'idle' | 'approach' | 'attack' | 'retreat'>('idle');

  // Calculate parallax offset based on fighters' average position
  const parallaxOffset = useMemo(() => {
    const centerX = (fighter1.x + fighter2.x) / 2;
    const normalizedPosition = (centerX / ARENA_WIDTH) * 2 - 1; // -1 to 1
    return -normalizedPosition * PARALLAX_AMOUNT;
  }, [fighter1.x, fighter2.x]);

  const addDamageNumber = useCallback((x: number, y: number, damage: number) => {
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, x: Math.round(x), y: Math.round(y), damage }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 800);
  }, []);

  const checkCollision = useCallback((attacker: FighterType, defender: FighterType): boolean => {
    const attackerCenter = attacker.x + 100;
    const defenderCenter = defender.x + 100;
    const distance = Math.abs(attackerCenter - defenderCenter);
    return distance < GAME_CONFIG.ATTACK_RANGE;
  }, []);

  const handleAttack = useCallback((
    attacker: FighterType,
    defender: FighterType,
    setAttacker: React.Dispatch<React.SetStateAction<FighterType>>,
    setDefender: React.Dispatch<React.SetStateAction<FighterType>>,
    attackType: 'light' | 'heavy',
    playerNum: 1 | 2
  ) => {
    const cooldownKey = playerNum === 1 ? 'p1' : 'p2';
    if (attackCooldown.current[cooldownKey] > 0) return;
    
    setAttacker(prev => ({
      ...prev,
      isAttacking: true,
      attackType,
      state: 'attacking',
    }));

    attackCooldown.current[cooldownKey] = attackType === 'heavy' ? 40 : 25;

    setTimeout(() => {
      setAttacker(prev => ({
        ...prev,
        isAttacking: false,
        attackType: 'none',
        state: prev.health > 0 ? 'idle' : 'defeated',
      }));
    }, attackType === 'heavy' ? 300 : 200);

    // Check hit
    if (checkCollision(attacker, defender)) {
      const baseDamage = attackType === 'heavy' ? GAME_CONFIG.HEAVY_DAMAGE : GAME_CONFIG.LIGHT_DAMAGE;
      const damage = defender.isBlocking 
        ? Math.floor(baseDamage * GAME_CONFIG.BLOCK_REDUCTION) 
        : baseDamage;

      setDefender(prev => {
        const newHealth = Math.max(0, prev.health - damage);
        return {
          ...prev,
          health: newHealth,
          state: newHealth <= 0 ? 'defeated' : 'hit',
        };
      });

      addDamageNumber(defender.x + 100, 150, damage);

      if (!defender.isBlocking) {
        setTimeout(() => {
          setDefender(prev => ({
            ...prev,
            state: prev.health > 0 ? 'idle' : 'defeated',
          }));
        }, 150);
      }
    }
  }, [checkCollision, addDamageNumber]);

  // Game loop
  useEffect(() => {
    if (isPaused || winner) return;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime >= 16) { // ~60fps
        lastTimeRef.current = currentTime;

        // Update cooldowns
        if (attackCooldown.current.p1 > 0) attackCooldown.current.p1--;
        if (attackCooldown.current.p2 > 0) attackCooldown.current.p2--;

        // Update Fighter 1
        setFighter1(prev => {
          if (prev.state === 'defeated') return prev;
          
          let newX = prev.x;
          let newY = prev.y;
          let newVelocityY = prev.velocityY;
          let isJumping = prev.isJumping;
          let isBlocking = keysPressed.current.has(PLAYER1_CONTROLS.down);
          let facingRight = prev.facingRight;

          // Movement
          if (keysPressed.current.has(PLAYER1_CONTROLS.left) && !isBlocking) {
            newX -= GAME_CONFIG.MOVE_SPEED;
            facingRight = false;
          }
          if (keysPressed.current.has(PLAYER1_CONTROLS.right) && !isBlocking) {
            newX += GAME_CONFIG.MOVE_SPEED;
            facingRight = true;
          }

          // Jump
          if (keysPressed.current.has(PLAYER1_CONTROLS.up) && !isJumping && !isBlocking) {
            newVelocityY = GAME_CONFIG.JUMP_FORCE;
            isJumping = true;
          }

          // Gravity
          if (isJumping) {
            newVelocityY += GAME_CONFIG.GRAVITY;
            newY -= newVelocityY;
            
            if (newY <= 0) {
              newY = 0;
              newVelocityY = 0;
              isJumping = false;
            }
          }

          // Boundaries
          newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

          const state = prev.isAttacking ? 'attacking' 
            : isBlocking ? 'blocking'
            : isJumping ? 'jumping'
            : (keysPressed.current.has(PLAYER1_CONTROLS.left) || keysPressed.current.has(PLAYER1_CONTROLS.right)) ? 'walking'
            : 'idle';

          return {
            ...prev,
            x: newX,
            y: newY,
            velocityY: newVelocityY,
            isJumping,
            isBlocking,
            facingRight,
            state: prev.isAttacking ? prev.state : state,
          };
        });

        // CPU or Player 2 logic
        if (mode === 'cpu') {
          // Simple CPU AI
          cpuActionTimer.current++;
          
          if (cpuActionTimer.current > 30) {
            cpuActionTimer.current = 0;
            const rand = Math.random();
            if (rand < 0.4) cpuAction.current = 'approach';
            else if (rand < 0.7) cpuAction.current = 'attack';
            else if (rand < 0.85) cpuAction.current = 'retreat';
            else cpuAction.current = 'idle';
          }

          setFighter2(prev => {
            if (prev.state === 'defeated') return prev;
            
            let newX = prev.x;
            let newY = prev.y;
            let newVelocityY = prev.velocityY;
            let isJumping = prev.isJumping;
            let facingRight = prev.facingRight;

            const distanceToPlayer = prev.x - fighter1.x;
            facingRight = distanceToPlayer > 0 ? false : true;

            switch (cpuAction.current) {
              case 'approach':
                if (Math.abs(distanceToPlayer) > GAME_CONFIG.ATTACK_RANGE) {
                  newX += distanceToPlayer > 0 ? -GAME_CONFIG.MOVE_SPEED * 0.7 : GAME_CONFIG.MOVE_SPEED * 0.7;
                }
                break;
              case 'retreat':
                newX += distanceToPlayer > 0 ? GAME_CONFIG.MOVE_SPEED * 0.5 : -GAME_CONFIG.MOVE_SPEED * 0.5;
                break;
              case 'attack':
                if (Math.abs(distanceToPlayer) < GAME_CONFIG.ATTACK_RANGE + 50) {
                  if (!prev.isAttacking && attackCooldown.current.p2 === 0) {
                    const attackType = Math.random() > 0.6 ? 'heavy' : 'light';
                    handleAttack(prev, fighter1, setFighter2, setFighter1, attackType, 2);
                  }
                } else {
                  newX += distanceToPlayer > 0 ? -GAME_CONFIG.MOVE_SPEED : GAME_CONFIG.MOVE_SPEED;
                }
                break;
            }

            // Random jump
            if (Math.random() < 0.01 && !isJumping) {
              newVelocityY = GAME_CONFIG.JUMP_FORCE;
              isJumping = true;
            }

            // Gravity
            if (isJumping) {
              newVelocityY += GAME_CONFIG.GRAVITY;
              newY -= newVelocityY;
              if (newY <= 0) {
                newY = 0;
                newVelocityY = 0;
                isJumping = false;
              }
            }

            newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

            return {
              ...prev,
              x: newX,
              y: newY,
              velocityY: newVelocityY,
              isJumping,
              facingRight,
            };
          });
        } else {
          // Player 2 controls
          setFighter2(prev => {
            if (prev.state === 'defeated') return prev;
            
            let newX = prev.x;
            let newY = prev.y;
            let newVelocityY = prev.velocityY;
            let isJumping = prev.isJumping;
            let isBlocking = keysPressed.current.has(PLAYER2_CONTROLS.down);
            let facingRight = prev.facingRight;

            if (keysPressed.current.has(PLAYER2_CONTROLS.left) && !isBlocking) {
              newX -= GAME_CONFIG.MOVE_SPEED;
              facingRight = false;
            }
            if (keysPressed.current.has(PLAYER2_CONTROLS.right) && !isBlocking) {
              newX += GAME_CONFIG.MOVE_SPEED;
              facingRight = true;
            }

            if (keysPressed.current.has(PLAYER2_CONTROLS.up) && !isJumping && !isBlocking) {
              newVelocityY = GAME_CONFIG.JUMP_FORCE;
              isJumping = true;
            }

            if (isJumping) {
              newVelocityY += GAME_CONFIG.GRAVITY;
              newY -= newVelocityY;
              if (newY <= 0) {
                newY = 0;
                newVelocityY = 0;
                isJumping = false;
              }
            }

            newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

            const state = prev.isAttacking ? 'attacking' 
              : isBlocking ? 'blocking'
              : isJumping ? 'jumping'
              : (keysPressed.current.has(PLAYER2_CONTROLS.left) || keysPressed.current.has(PLAYER2_CONTROLS.right)) ? 'walking'
              : 'idle';

            return {
              ...prev,
              x: newX,
              y: newY,
              velocityY: newVelocityY,
              isJumping,
              isBlocking,
              facingRight,
              state: prev.isAttacking ? prev.state : state,
            };
          });
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPaused, winner, mode, handleAttack, fighter1.x]);

  // Check for winner and add delay before showing victory screen
  useEffect(() => {
    if (fighter1.health <= 0 && !winner) {
      setWinner(2);
      setFighter1(prev => ({ ...prev, state: 'defeated' }));
      setFighter2(prev => ({ ...prev, state: 'victory' }));
      // Delay showing victory screen by 3 seconds
      setTimeout(() => setShowVictoryScreen(true), 3000);
    } else if (fighter2.health <= 0 && !winner) {
      setWinner(1);
      setFighter2(prev => ({ ...prev, state: 'defeated' }));
      setFighter1(prev => ({ ...prev, state: 'victory' }));
      // Delay showing victory screen by 3 seconds
      setTimeout(() => setShowVictoryScreen(true), 3000);
    }
  }, [fighter1.health, fighter2.health, winner]);

  // Timer - also add delay for time-based winner
  useEffect(() => {
    if (isPaused || winner) return;
    
    const timer = setInterval(() => {
      setRoundTime(prev => {
        if (prev <= 0) {
          if (fighter1.health > fighter2.health) {
            setWinner(1);
            setFighter2(prev => ({ ...prev, state: 'defeated' }));
            setFighter1(prev => ({ ...prev, state: 'victory' }));
          } else if (fighter2.health > fighter1.health) {
            setWinner(2);
            setFighter1(prev => ({ ...prev, state: 'defeated' }));
            setFighter2(prev => ({ ...prev, state: 'victory' }));
          }
          setTimeout(() => setShowVictoryScreen(true), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, winner, fighter1.health, fighter2.health]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      
      if (key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused || winner) return;
      
      keysPressed.current.add(key);

      // Player 1 attacks
      if (key === PLAYER1_CONTROLS.lightAttack && !fighter1.isAttacking) {
        handleAttack(fighter1, fighter2, setFighter1, setFighter2, 'light', 1);
      }
      if (key === PLAYER1_CONTROLS.heavyAttack && !fighter1.isAttacking) {
        handleAttack(fighter1, fighter2, setFighter1, setFighter2, 'heavy', 1);
      }

      // Player 2 attacks (only in PvP mode)
      if (mode === 'pvp') {
        if (key === PLAYER2_CONTROLS.lightAttack && !fighter2.isAttacking) {
          handleAttack(fighter2, fighter1, setFighter2, setFighter1, 'light', 2);
        }
        if (key === PLAYER2_CONTROLS.heavyAttack && !fighter2.isAttacking) {
          handleAttack(fighter2, fighter1, setFighter2, setFighter1, 'heavy', 2);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, winner, fighter1, fighter2, mode, handleAttack]);

  const handleRematch = () => {
    setFighter1(createFighter(player1Character, false));
    setFighter2(createFighter(player2Character, true));
    setWinner(null);
    setShowVictoryScreen(false);
    setRoundTime(GAME_CONFIG.ROUND_TIME);
    attackCooldown.current = { p1: 0, p2: 0 };
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Full screen background with parallax */}
      <div 
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `translateX(${parallaxOffset}px) scale(1.15)`,
        }}
      >
        <img 
          src={selectedMap.image} 
          alt={selectedMap.name}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Dark overlay at bottom for depth */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />

      {/* HUD Layer */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-start justify-between gap-4 max-w-6xl mx-auto">
          {/* Player 1 health */}
          <HealthBar 
            health={fighter1.health} 
            maxHealth={fighter1.maxHealth} 
            playerName={fighter1.name}
          />

          {/* Timer */}
          <div className="flex flex-col items-center">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(180deg, #444 0%, #222 100%)',
                border: '3px solid #666',
                boxShadow: '0 4px 0 #111, 0 0 20px rgba(255, 165, 0, 0.3)',
              }}
            >
              <span 
                className="text-2xl font-pixel"
                style={{
                  color: roundTime <= 10 ? '#FF4444' : '#FFFF00',
                  textShadow: '2px 2px 0 #000',
                }}
              >
                {roundTime}
              </span>
            </div>
            <button 
              onClick={() => setIsPaused(true)}
              className="mt-2 text-[8px] font-pixel text-white/60 hover:text-white/90 transition-colors"
            >
              ESC = PAUSA
            </button>
          </div>

          {/* Player 2 health */}
          <HealthBar 
            health={fighter2.health} 
            maxHealth={fighter2.maxHealth} 
            playerName={mode === 'cpu' ? `${fighter2.name} (CPU)` : fighter2.name}
            isPlayer2
          />
        </div>
      </div>

      {/* Fight arena - positioned at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: ARENA_HEIGHT }}
      >
        {/* Fighters */}
        <AnimatedFighter fighter={fighter1} />
        <AnimatedFighter fighter={fighter2} isPlayer2 />

        {/* Damage numbers */}
        {damageNumbers.map(({ id, x, y, damage }) => (
          <div
            key={id}
            className="absolute font-pixel text-2xl animate-damage-number"
            style={{ 
              left: x, 
              top: y,
              color: '#FF4444',
              textShadow: '2px 2px 0 #000, 0 0 10px rgba(255, 0, 0, 0.8)',
            }}
          >
            -{damage}
          </div>
        ))}
      </div>

      {/* Map name */}
      <div className="absolute bottom-2 left-4">
        <span 
          className="text-[10px] font-pixel"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {selectedMap.name}
        </span>
      </div>

      {/* Pause menu */}
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onCharacterSelect={onCharacterSelect}
          onMainMenu={onMainMenu}
        />
      )}

      {/* Victory screen - only shown after delay */}
      {showVictoryScreen && winner && (
        <VictoryScreen
          winner={winner === 1 ? player1Character : player2Character}
          winnerPlayer={winner}
          onRematch={handleRematch}
          onCharacterSelect={onCharacterSelect}
          onMainMenu={onMainMenu}
        />
      )}
    </div>
  );
}
