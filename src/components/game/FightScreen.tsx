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
const PARALLAX_AMOUNT = 100;

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
  
  // Knockout effects state
  const [isKnockout, setIsKnockout] = useState(false);
  const [knockoutFreeze, setKnockoutFreeze] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const attackCooldown = useRef<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const damageIdRef = useRef(0);

  // Jump release tracking for reliable edge detection
  const p1JumpReleased = useRef(true);
  const p2JumpReleased = useRef(true);

  // CPU AI state
  const cpuActionTimer = useRef(0);
  const cpuAction = useRef<'idle' | 'approach' | 'attack' | 'retreat'>('idle');

  // Calculate parallax offset based on fighters' average position
  const parallaxOffset = useMemo(() => {
    const centerX = (fighter1.x + fighter2.x) / 2;
    const normalizedPosition = (centerX / ARENA_WIDTH) * 2 - 1;
    return -normalizedPosition * PARALLAX_AMOUNT;
  }, [fighter1.x, fighter2.x]);

  const addDamageNumber = useCallback((x: number, y: number, damage: number) => {
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, x: Math.round(x), y: Math.round(y), damage }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 800);
  }, []);

  // Hitbox check with different ranges for light vs heavy attacks
  const checkCollision = useCallback((attacker: FighterType, defender: FighterType, attackType: 'light' | 'heavy'): boolean => {
    const attackerCenter = attacker.x + 100;
    const defenderCenter = defender.x + 100;
    const distance = Math.abs(attackerCenter - defenderCenter);
    
    // Heavy attacks have longer range
    const range = attackType === 'heavy' ? GAME_CONFIG.HEAVY_ATTACK_RANGE : GAME_CONFIG.LIGHT_ATTACK_RANGE;
    return distance < range;
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

    attackCooldown.current[cooldownKey] = attackType === 'heavy' ? 60 : 30;

    const attackDuration = attackType === 'heavy' ? 500 : 250;
    setTimeout(() => {
      setAttacker(prev => ({
        ...prev,
        isAttacking: false,
        attackType: 'none',
        state: prev.health > 0 ? 'idle' : 'defeated',
      }));
    }, attackDuration);

    // Check hit with attack-type-specific range
    if (checkCollision(attacker, defender, attackType)) {
      const baseDamage = attackType === 'heavy' ? GAME_CONFIG.HEAVY_DAMAGE : GAME_CONFIG.LIGHT_DAMAGE;
      const damage = defender.isBlocking 
        ? Math.floor(baseDamage * GAME_CONFIG.BLOCK_REDUCTION) 
        : baseDamage;

      setDefender(prev => {
        const newHealth = Math.max(0, prev.health - damage);
        return {
          ...prev,
          health: newHealth,
          state: newHealth <= 0 ? 'hit' : 'hit', // Always show hit first, defeat comes after freeze
        };
      });

      addDamageNumber(defender.x + 100, 150, damage);

      // Hit stun duration - let animation play fully (1 second)
      if (!defender.isBlocking) {
        setTimeout(() => {
          setDefender(prev => ({
            ...prev,
            state: prev.health > 0 ? 'idle' : 'hit', // Keep hit state if defeated, will transition after freeze
          }));
        }, 1000);
      }
    }
  }, [checkCollision, addDamageNumber]);

  // Game loop with smooth physics
  useEffect(() => {
    if (isPaused || winner || knockoutFreeze) return;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime >= 16) { // ~60fps
        lastTimeRef.current = currentTime;

        // Update cooldowns
        if (attackCooldown.current.p1 > 0) attackCooldown.current.p1--;
        if (attackCooldown.current.p2 > 0) attackCooldown.current.p2--;

        // Update Fighter 1 with smooth physics
        setFighter1(prev => {
          if (prev.state === 'defeated') return prev;
          
          let newVelocityX = prev.velocityX;
          let newVelocityY = prev.velocityY;
          let isJumping = prev.isJumping;
          let isBlocking = keysPressed.current.has(PLAYER1_CONTROLS.down);
          let facingRight = prev.facingRight;

          // Smooth horizontal movement with acceleration/deceleration
          const targetVelocityX = (() => {
            if (isBlocking) return 0;
            if (keysPressed.current.has(PLAYER1_CONTROLS.left) && keysPressed.current.has(PLAYER1_CONTROLS.right)) return 0;
            if (keysPressed.current.has(PLAYER1_CONTROLS.left)) return -GAME_CONFIG.MOVE_SPEED;
            if (keysPressed.current.has(PLAYER1_CONTROLS.right)) return GAME_CONFIG.MOVE_SPEED;
            return 0;
          })();

          // Smooth acceleration towards target velocity
          const acceleration = 1.5;
          const deceleration = 1.2;
          
          if (targetVelocityX !== 0) {
            // Accelerate towards target
            if (Math.abs(newVelocityX) < Math.abs(targetVelocityX)) {
              newVelocityX += Math.sign(targetVelocityX) * acceleration;
              if (Math.abs(newVelocityX) > Math.abs(targetVelocityX)) {
                newVelocityX = targetVelocityX;
              }
            } else {
              newVelocityX = targetVelocityX;
            }
          } else {
            // Decelerate to stop
            if (Math.abs(newVelocityX) > 0.5) {
              newVelocityX -= Math.sign(newVelocityX) * deceleration;
            } else {
              newVelocityX = 0;
            }
          }

          // Update facing direction based on movement
          if (newVelocityX < -0.5) facingRight = false;
          else if (newVelocityX > 0.5) facingRight = true;

          // Jump - reliable edge detection with ref
          const jumpKeyPressed = keysPressed.current.has(PLAYER1_CONTROLS.up);
          
          if (jumpKeyPressed) {
            if (p1JumpReleased.current && prev.y <= 0 && !prev.isJumping && !isBlocking) {
              newVelocityY = GAME_CONFIG.JUMP_FORCE;
              isJumping = true;
              p1JumpReleased.current = false;
            }
          } else {
            p1JumpReleased.current = true;
          }

          // Apply gravity and vertical movement
          let newY = prev.y;
          
          // Apply physics when jumping or in air
          if (isJumping || prev.isJumping || newVelocityY !== 0 || prev.y > 0) {
            newVelocityY -= GAME_CONFIG.GRAVITY;
            newY = prev.y + newVelocityY;
            isJumping = true;
          }
          
          // Landing on ground
          if (newY <= 0 && prev.y > 0) {
            newY = 0;
            newVelocityY = 0;
            isJumping = false;
          } else if (newY < 0) {
            newY = 0;
            newVelocityY = 0;
            isJumping = false;
          }

          // Apply horizontal velocity
          let newX = prev.x + newVelocityX;

          // Boundaries
          newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

          const state = prev.isAttacking ? 'attacking' 
            : isBlocking ? 'blocking'
            : isJumping ? 'jumping'
            : Math.abs(newVelocityX) > 0.5 ? 'walking'
            : 'idle';

          return {
            ...prev,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            isJumping,
            isBlocking,
            facingRight,
            state: prev.isAttacking ? prev.state : (prev.state === 'hit' ? 'hit' : state),
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
            
            let newVelocityX = prev.velocityX;
            let newVelocityY = prev.velocityY;
            let newY = prev.y;
            let isJumping = prev.isJumping;
            let facingRight = prev.facingRight;

            const distanceToPlayer = prev.x - fighter1.x;
            facingRight = distanceToPlayer > 0 ? false : true;

            // CPU target velocity based on action
            let targetVelocityX = 0;
            
            switch (cpuAction.current) {
              case 'approach':
                if (Math.abs(distanceToPlayer) > GAME_CONFIG.LIGHT_ATTACK_RANGE) {
                  targetVelocityX = distanceToPlayer > 0 ? -GAME_CONFIG.MOVE_SPEED * 0.7 : GAME_CONFIG.MOVE_SPEED * 0.7;
                }
                break;
              case 'retreat':
                targetVelocityX = distanceToPlayer > 0 ? GAME_CONFIG.MOVE_SPEED * 0.5 : -GAME_CONFIG.MOVE_SPEED * 0.5;
                break;
              case 'attack':
                if (Math.abs(distanceToPlayer) < GAME_CONFIG.HEAVY_ATTACK_RANGE + 50) {
                  if (!prev.isAttacking && attackCooldown.current.p2 === 0) {
                    const attackType = Math.random() > 0.6 ? 'heavy' : 'light';
                    handleAttack(prev, fighter1, setFighter2, setFighter1, attackType, 2);
                  }
                } else {
                  targetVelocityX = distanceToPlayer > 0 ? -GAME_CONFIG.MOVE_SPEED : GAME_CONFIG.MOVE_SPEED;
                }
                break;
            }

            // Smooth CPU movement
            const acceleration = 1.2;
            if (targetVelocityX !== 0) {
              if (Math.abs(newVelocityX) < Math.abs(targetVelocityX)) {
                newVelocityX += Math.sign(targetVelocityX) * acceleration;
              } else {
                newVelocityX = targetVelocityX;
              }
            } else {
              if (Math.abs(newVelocityX) > 0.5) {
                newVelocityX -= Math.sign(newVelocityX) * acceleration;
              } else {
                newVelocityX = 0;
              }
            }

            // Random jump - only when grounded
            if (Math.random() < 0.01 && prev.y <= 0 && !prev.isJumping) {
              newVelocityY = GAME_CONFIG.JUMP_FORCE;
              isJumping = true;
            }

            // Apply physics when jumping or in air
            if (isJumping || prev.isJumping || newVelocityY !== 0 || prev.y > 0) {
              newVelocityY -= GAME_CONFIG.GRAVITY;
              newY = prev.y + newVelocityY;
              isJumping = true;
            }
            
            // Landing on ground
            if (newY <= 0 && prev.y > 0) {
              newY = 0;
              newVelocityY = 0;
              isJumping = false;
            } else if (newY < 0) {
              newY = 0;
              newVelocityY = 0;
              isJumping = false;
            }

            let newX = prev.x + newVelocityX;
            newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

            const state = prev.isAttacking ? 'attacking'
              : isJumping ? 'jumping'
              : Math.abs(newVelocityX) > 0.5 ? 'walking'
              : 'idle';

            return {
              ...prev,
              x: newX,
              y: newY,
              velocityX: newVelocityX,
              velocityY: newVelocityY,
              isJumping,
              facingRight,
              state: prev.isAttacking ? prev.state : (prev.state === 'hit' ? 'hit' : state),
            };
          });
        } else {
          // Player 2 controls with smooth physics
          setFighter2(prev => {
            if (prev.state === 'defeated') return prev;
            
            let newVelocityX = prev.velocityX;
            let newVelocityY = prev.velocityY;
            let isJumping = prev.isJumping;
            let isBlocking = keysPressed.current.has(PLAYER2_CONTROLS.down);
            let facingRight = prev.facingRight;

            // Smooth horizontal movement
            const targetVelocityX = (() => {
              if (isBlocking) return 0;
              if (keysPressed.current.has(PLAYER2_CONTROLS.left) && keysPressed.current.has(PLAYER2_CONTROLS.right)) return 0;
              if (keysPressed.current.has(PLAYER2_CONTROLS.left)) return -GAME_CONFIG.MOVE_SPEED;
              if (keysPressed.current.has(PLAYER2_CONTROLS.right)) return GAME_CONFIG.MOVE_SPEED;
              return 0;
            })();

            const acceleration = 1.5;
            const deceleration = 1.2;
            
            if (targetVelocityX !== 0) {
              if (Math.abs(newVelocityX) < Math.abs(targetVelocityX)) {
                newVelocityX += Math.sign(targetVelocityX) * acceleration;
                if (Math.abs(newVelocityX) > Math.abs(targetVelocityX)) {
                  newVelocityX = targetVelocityX;
                }
              } else {
                newVelocityX = targetVelocityX;
              }
            } else {
              if (Math.abs(newVelocityX) > 0.5) {
                newVelocityX -= Math.sign(newVelocityX) * deceleration;
              } else {
                newVelocityX = 0;
              }
            }

            if (newVelocityX < -0.5) facingRight = false;
            else if (newVelocityX > 0.5) facingRight = true;

            // Jump - reliable edge detection with ref
            const jumpKeyPressed = keysPressed.current.has(PLAYER2_CONTROLS.up);
            
            if (jumpKeyPressed) {
              if (p2JumpReleased.current && prev.y <= 0 && !prev.isJumping && !isBlocking) {
                newVelocityY = GAME_CONFIG.JUMP_FORCE;
                isJumping = true;
                p2JumpReleased.current = false;
              }
            } else {
              p2JumpReleased.current = true;
            }

            // Apply gravity and vertical movement
            let newY = prev.y;
            
            // Apply physics when jumping or in air
            if (isJumping || prev.isJumping || newVelocityY !== 0 || prev.y > 0) {
              newVelocityY -= GAME_CONFIG.GRAVITY;
              newY = prev.y + newVelocityY;
              isJumping = true;
            }
            
            // Landing on ground
            if (newY <= 0 && prev.y > 0) {
              newY = 0;
              newVelocityY = 0;
              isJumping = false;
            } else if (newY < 0) {
              newY = 0;
              newVelocityY = 0;
              isJumping = false;
            }

            let newX = prev.x + newVelocityX;
            newX = Math.max(0, Math.min(ARENA_WIDTH - 200, newX));

            const state = prev.isAttacking ? 'attacking' 
              : isBlocking ? 'blocking'
              : isJumping ? 'jumping'
              : Math.abs(newVelocityX) > 0.5 ? 'walking'
              : 'idle';

            return {
              ...prev,
              x: newX,
              y: newY,
              velocityX: newVelocityX,
              velocityY: newVelocityY,
              isJumping,
              isBlocking,
              facingRight,
              state: prev.isAttacking ? prev.state : (prev.state === 'hit' ? 'hit' : state),
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
  }, [isPaused, winner, knockoutFreeze, mode, handleAttack, fighter1.x]);

  // Check for winner with knockout effects
  useEffect(() => {
    if (winner || isKnockout) return;

    const checkKnockout = (loserHealth: number, winnerNum: 1 | 2) => {
      if (loserHealth <= 0) {
        setIsKnockout(true);
        setScreenShake(true);
        setKnockoutFreeze(true);

        // Stop shake after 500ms
        setTimeout(() => setScreenShake(false), 500);

        // After 1 second freeze, transition to defeat animation
        setTimeout(() => {
          setKnockoutFreeze(false);
          
          if (winnerNum === 1) {
            setFighter2(prev => ({ ...prev, state: 'defeated' }));
            setFighter1(prev => ({ 
              ...prev, 
              state: 'victory',
              // Move winner away from loser
              x: Math.max(50, prev.x - 100)
            }));
          } else {
            setFighter1(prev => ({ ...prev, state: 'defeated' }));
            setFighter2(prev => ({ 
              ...prev, 
              state: 'victory',
              // Move winner away from loser  
              x: Math.min(ARENA_WIDTH - 300, prev.x + 100)
            }));
          }
          
          setWinner(winnerNum);
          
          // Show victory screen after animations play
          setTimeout(() => setShowVictoryScreen(true), 2500);
        }, 1000);
      }
    };

    if (fighter1.health <= 0) {
      checkKnockout(fighter1.health, 2);
    } else if (fighter2.health <= 0) {
      checkKnockout(fighter2.health, 1);
    }
  }, [fighter1.health, fighter2.health, winner, isKnockout]);

  // Timer
  useEffect(() => {
    if (isPaused || winner || isKnockout) return;
    
    const timer = setInterval(() => {
      setRoundTime(prev => {
        if (prev <= 0) {
          setIsKnockout(true);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
          
          setTimeout(() => {
            if (fighter1.health > fighter2.health) {
              setWinner(1);
              setFighter2(prev => ({ ...prev, state: 'defeated' }));
              setFighter1(prev => ({ 
                ...prev, 
                state: 'victory',
                x: Math.max(50, prev.x - 100)
              }));
            } else if (fighter2.health > fighter1.health) {
              setWinner(2);
              setFighter1(prev => ({ ...prev, state: 'defeated' }));
              setFighter2(prev => ({ 
                ...prev, 
                state: 'victory',
                x: Math.min(ARENA_WIDTH - 300, prev.x + 100)
              }));
            }
            setTimeout(() => setShowVictoryScreen(true), 2500);
          }, 1000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, winner, isKnockout, fighter1.health, fighter2.health]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      
      if (key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused || winner || knockoutFreeze) return;
      
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
  }, [isPaused, winner, knockoutFreeze, fighter1, fighter2, mode, handleAttack]);

  const handleRematch = () => {
    setFighter1(createFighter(player1Character, false));
    setFighter2(createFighter(player2Character, true));
    setWinner(null);
    setShowVictoryScreen(false);
    setRoundTime(GAME_CONFIG.ROUND_TIME);
    setIsKnockout(false);
    setKnockoutFreeze(false);
    setScreenShake(false);
    attackCooldown.current = { p1: 0, p2: 0 };
    p1JumpReleased.current = true;
    p2JumpReleased.current = true;
  };

  return (
    <div 
      className={`fixed inset-0 overflow-hidden bg-black ${screenShake ? 'animate-screen-shake' : ''}`}
    >
      {/* Full screen background with parallax and flash effect */}
      <div 
        className={`absolute inset-0 transition-transform duration-100 ${isKnockout && !showVictoryScreen ? 'animate-bg-flash' : ''}`}
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
              className="text-5xl font-bold text-white px-4 py-2 rounded-lg min-w-[80px] text-center"
              style={{
                background: 'linear-gradient(180deg, #333 0%, #111 100%)',
                border: '3px solid #666',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            >
              {roundTime}
            </div>
          </div>

          {/* Player 2 health */}
          <HealthBar 
            health={fighter2.health} 
            maxHealth={fighter2.maxHealth} 
            playerName={fighter2.name}
            isPlayer2
          />
        </div>
      </div>

      {/* Fighters Layer */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <AnimatedFighter fighter={fighter1} isPlayer2={false} />
        <AnimatedFighter fighter={fighter2} isPlayer2={true} />
      </div>

      {/* Damage Numbers */}
      {damageNumbers.map(({ id, x, y, damage }) => (
        <div
          key={id}
          className="absolute text-3xl font-bold text-red-500 pointer-events-none animate-bounce"
          style={{
            left: `${(x / ARENA_WIDTH) * 100}%`,
            top: `${30 + (y / ARENA_HEIGHT) * 30}%`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'fadeUp 0.8s ease-out forwards',
          }}
        >
          -{damage}
        </div>
      ))}

      {/* Pause Menu */}
      {isPaused && !winner && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onCharacterSelect={onCharacterSelect}
          onMainMenu={onMainMenu}
        />
      )}

      {/* Victory Screen */}
      {showVictoryScreen && winner && (
        <VictoryScreen
          winner={winner === 1 ? player1Character : player2Character}
          winnerPlayer={winner}
          onRematch={handleRematch}
          onCharacterSelect={onCharacterSelect}
          onMainMenu={onMainMenu}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-50px); }
        }
        
        @keyframes screenShake {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-8px) translateY(-2px); }
          20% { transform: translateX(8px) translateY(2px); }
          30% { transform: translateX(-6px) translateY(-1px); }
          40% { transform: translateX(6px) translateY(1px); }
          50% { transform: translateX(-4px) translateY(-1px); }
          60% { transform: translateX(4px) translateY(1px); }
          70% { transform: translateX(-3px) translateY(0); }
          80% { transform: translateX(3px) translateY(0); }
          90% { transform: translateX(-1px) translateY(0); }
        }
        
        @keyframes bgFlash {
          0%, 100% { filter: brightness(1); }
          25% { filter: brightness(1.4); }
          50% { filter: brightness(1); }
          75% { filter: brightness(1.2); }
        }
        
        .animate-screen-shake {
          animation: screenShake 0.5s ease-out;
        }
        
        .animate-bg-flash {
          animation: bgFlash 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
