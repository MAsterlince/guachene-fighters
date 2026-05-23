import React, { useState, useEffect, useRef } from 'react';
import { Character, GameMode } from '@/types/game';
import { CHARACTERS } from '@/data/gameData';
import { useGameAudio } from '@/hooks/useGameAudio';
import tituloImg from '@/assets/titulo.png';
import fondoImg from '@/assets/Fondo-Seleccion.jpg';
import selectSrc from '@/assets/audio/menu-select-fighter.wav?url';
import lockSrc from '@/assets/audio/Lock-fighter.wav?url';
import selectedSrc from '@/assets/audio/Fighters-selected.wav?url';

interface CharacterSelectProps {
  mode: GameMode;
  onSelectCharacters: (p1: Character, p2: Character) => void;
  onBack: () => void;
}

export function CharacterSelect({ mode, onSelectCharacters, onBack }: CharacterSelectProps) {
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(3);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [activePlayer, setActivePlayer] = useState<1|2>(1);

  const { play } = useGameAudio();
  const selectRef   = useRef<HTMLAudioElement | null>(null);
  const lockRef     = useRef<HTMLAudioElement | null>(null);
  const selectedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    play();
    selectRef.current   = new Audio(selectSrc);
    lockRef.current     = new Audio(lockSrc);
    selectedRef.current = new Audio(selectedSrc);
  }, []);

  const playSelect  = () => { if (selectRef.current)   { selectRef.current.currentTime   = 0; selectRef.current.play().catch(()=>{}); }};
  const playLock    = () => { if (lockRef.current)     { lockRef.current.currentTime     = 0; lockRef.current.play().catch(()=>{}); }};
  const playSelected= () => { if (selectedRef.current) { selectedRef.current.currentTime = 0; selectedRef.current.play().catch(()=>{}); }};

  const cols = 3;

  // CPU auto-select
  useEffect(() => {
    if (mode === 'cpu' && p1Locked && !p2Locked) {
      const available = CHARACTERS.filter((_, i) => i !== p1Index);
      const cpuChar = available[Math.floor(Math.random() * available.length)];
      const cpuIndex = CHARACTERS.indexOf(cpuChar);
      setP2Index(cpuIndex);
      setTimeout(() => { setP2Locked(true); playLock(); }, 600);
    }
  }, [p1Locked]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ── P1 ──
      if (!p1Locked && (mode === 'cpu' || activePlayer === 1)) {
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setP1Index(i => { const n = i % cols === 0 ? i + cols - 1 : i - 1; playSelect(); return n; }); }
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setP1Index(i => { const n = i % cols === cols-1 ? i - cols + 1 : i + 1; playSelect(); return n; }); }
        if (e.key === 'w' || e.key === 'W') { e.preventDefault(); setP1Index(i => { const n = i - cols >= 0 ? i - cols : i; playSelect(); return n; }); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); setP1Index(i => { const n = i + cols < CHARACTERS.length ? i + cols : i; playSelect(); return n; }); }
        if (e.key === 'c' || e.key === 'C') { setP1Locked(true); playLock(); if (mode === 'pvp') setActivePlayer(2); }
      }
      if (p1Locked && !p2Locked && (e.key === 'v' || e.key === 'V')) { setP1Locked(false); if (mode === 'pvp') setActivePlayer(1); playSelect(); }

      // ── P2 (pvp only) ──
      if (mode === 'pvp' && !p2Locked && activePlayer === 2) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setP2Index(i => { const n = i % cols === 0 ? i + cols - 1 : i - 1; playSelect(); return n; }); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setP2Index(i => { const n = i % cols === cols-1 ? i - cols + 1 : i + 1; playSelect(); return n; }); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); setP2Index(i => { const n = i - cols >= 0 ? i - cols : i; playSelect(); return n; }); }
        if (e.key === 'ArrowDown')  { e.preventDefault(); setP2Index(i => { const n = i + cols < CHARACTERS.length ? i + cols : i; playSelect(); return n; }); }
        if (e.key === 'o' || e.key === 'O') { setP2Locked(true); playLock(); }
      }
      if (mode === 'pvp' && p2Locked && (e.key === 'p' || e.key === 'P')) { setP2Locked(false); playSelect(); }

      // ── Enter para proceder ──
      if (e.key === 'Enter' && p1Locked && p2Locked) { handleProceed(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p1Locked, p2Locked, activePlayer, mode]);

  const canProceed = p1Locked && p2Locked;

  const handleProceed = () => {
    playSelected();
    setTimeout(() => onSelectCharacters(CHARACTERS[p1Index], CHARACTERS[p2Index]), 400);
  };

  const handleReset = () => { setP1Locked(false); setP2Locked(false); setActivePlayer(1); };

  const p1Char = CHARACTERS[p1Index];
  const p2Char = CHARACTERS[p2Index];

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      fontFamily: "'8bitOperator', monospace",
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)' }} />

      {/* P1 Portrait */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '26%', height: '88%', zIndex: 2 }}>
        <img src={p1Char.image} alt={p1Char.name} style={{
          width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom left',
          filter: p1Locked ? 'drop-shadow(0 0 24px rgba(80,160,255,0.9))' : 'drop-shadow(0 0 8px rgba(80,160,255,0.3))',
          transition: 'all 0.3s',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,20,60,0.35) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
          <p style={{ fontFamily: "'8bitOperator', monospace", fontSize: '0.9rem', color: p1Locked ? '#88ccff' : '#4488ff', letterSpacing: '0.15em', textShadow: '0 0 10px rgba(80,160,255,0.8)' }}>
            {p1Char.name.toUpperCase()}
          </p>
          {p1Locked && <p style={{ fontSize: '0.55rem', color: '#88ccff', letterSpacing: '0.1em' }}>— LISTO —</p>}
        </div>
      </div>

      {/* P2 Portrait */}
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '26%', height: '88%', zIndex: 2 }}>
        <img src={p2Char.image} alt={p2Char.name} style={{
          width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom right',
          transform: 'scaleX(-1)',
          filter: p2Locked ? 'drop-shadow(0 0 24px rgba(255,80,80,0.9))' : 'drop-shadow(0 0 8px rgba(255,80,80,0.3))',
          transition: 'all 0.3s',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(60,0,0,0.35) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
          <p style={{ fontFamily: "'8bitOperator', monospace", fontSize: '0.9rem', color: p2Locked ? '#ffaaaa' : '#ff4444', letterSpacing: '0.15em', textShadow: '0 0 10px rgba(255,80,80,0.8)', transform: 'scaleX(-1)' }}>
            {p2Char.name.toUpperCase()}
          </p>
          {p2Locked && <p style={{ fontSize: '0.55rem', color: '#ffaaaa', letterSpacing: '0.1em', transform: 'scaleX(-1)' }}>— LISTO —</p>}
        </div>
      </div>

      {/* CENTER */}
      <div style={{
        position: 'relative', zIndex: 10, height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', paddingTop: '0.6rem', gap: '0.5rem',
      }}>
        {/* Logo */}
        <img src={tituloImg} alt="Guachene Fighters" style={{
          width: 'clamp(180px, 28vw, 340px)',
          filter: 'drop-shadow(0 0 18px rgba(255,120,0,0.6))',
        }} />

        {/* Subtitle */}
        <p style={{
          fontFamily: "'8bitOperator', monospace",
          fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
          color: '#ffcc00', letterSpacing: '0.15em',
          textShadow: '0 0 10px rgba(255,200,0,0.6)', margin: 0,
        }}>
          {mode === 'cpu'
            ? (!p1Locked ? '— ESCOGE TU GUACHENE —' : '— CPU ELIGIENDO... —')
            : (!p1Locked ? '— P1: ESCOGE TU GUACHENE —' : !p2Locked ? '— P2: ESCOGE TU GUACHENE —' : '— ¡LISTOS PARA PELEAR! —')
          }
        </p>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px', padding: '10px',
          background: 'rgba(0,0,0,0.78)',
          border: '2px solid rgba(255,140,0,0.55)',
          borderRadius: '10px',
          boxShadow: '0 0 35px rgba(255,100,0,0.35)',
        }}>
          {CHARACTERS.map((char, i) => {
            const isP1 = i === p1Index;
            const isP2 = i === p2Index;
            const isP1L = isP1 && p1Locked;
            const isP2L = isP2 && p2Locked;
            return (
              <div key={char.id}
                onClick={() => {
                  if (mode === 'cpu' && !p1Locked) { setP1Index(i); playSelect(); }
                  if (mode === 'pvp') {
                    if (!p1Locked && activePlayer === 1) { setP1Index(i); playSelect(); }
                    else if (!p2Locked && activePlayer === 2) { setP2Index(i); playSelect(); }
                  }
                }}
                style={{
                  width: 110, height: 110, position: 'relative', cursor: 'pointer',
                  border: `3px solid ${isP1L ? '#4499ff' : isP2L ? '#ff4444' : isP1 ? 'rgba(80,160,255,0.9)' : isP2 ? 'rgba(255,80,80,0.9)' : 'rgba(255,140,0,0.3)'}`,
                  borderRadius: '8px', background: 'rgba(10,10,20,0.85)',
                  boxShadow: isP1L ? '0 0 22px rgba(80,160,255,0.8)' : isP2L ? '0 0 22px rgba(255,80,80,0.8)' : isP1 || isP2 ? '0 0 14px rgba(255,140,0,0.5)' : 'none',
                  transition: 'all 0.15s', overflow: 'hidden',
                  transform: (isP1 || isP2) && !isP1L && !isP2L ? 'scale(1.06)' : 'scale(1)',
                }}>
                <img src={char.icon} alt={char.name} style={{ width: '100%', height: '85%', objectFit: 'cover' }} />
                {isP1 && <div style={{ position: 'absolute', top: 3, left: 3, background: '#1155cc', borderRadius: '4px', padding: '1px 6px', fontSize: '0.55rem', fontFamily: "'8bitOperator', monospace", color: '#fff', fontWeight: 'bold' }}>P1</div>}
                {isP2 && <div style={{ position: 'absolute', top: 3, right: 3, background: '#cc1111', borderRadius: '4px', padding: '1px 6px', fontSize: '0.55rem', fontFamily: "'8bitOperator', monospace", color: '#fff', fontWeight: 'bold' }}>P2</div>}
                {(isP1L || isP2L) && (
                  <div style={{ position: 'absolute', inset: 0, background: isP1L ? 'rgba(80,160,255,0.18)' : 'rgba(255,80,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🔒</div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', textAlign: 'center', fontSize: '0.48rem', padding: '2px', fontFamily: "'8bitOperator', monospace", color: isP1 ? '#88bbff' : isP2 ? '#ff8888' : '#ffaa44', letterSpacing: '0.05em' }}>
                  {char.name.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,110,40,0.35)', borderRadius: '8px', padding: '7px 22px' }}>
          <div style={{ display: 'flex', gap: 28, fontFamily: "'8bitOperator', monospace", fontSize: '0.58rem', color: '#8899aa' }}>
            <div>
              <p style={{ color: '#4488ff', marginBottom: 3 }}>P1</p>
              <p><span style={{ color: '#5577aa' }}>WASD</span> Mover &nbsp;<span style={{ color: '#5577aa' }}>C</span> OK &nbsp;<span style={{ color: '#5577aa' }}>V</span> Deshacer</p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,100,40,0.2)', alignSelf: 'stretch' }} />
            <div>
              <p style={{ color: '#ff4444', marginBottom: 3 }}>P2</p>
              <p><span style={{ color: '#5577aa' }}>Flechas</span> Mover &nbsp;<span style={{ color: '#5577aa' }}>O</span> OK &nbsp;<span style={{ color: '#5577aa' }}>P</span> Deshacer</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} style={{ fontFamily: "'8bitOperator', monospace", fontSize: '0.68rem', padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.1em', background: 'rgba(30,30,40,0.9)', color: '#aabbcc', border: '2px solid rgba(100,100,120,0.5)', borderRadius: '6px', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>← VOLVER</button>
          {(p1Locked || p2Locked) && (
            <button onClick={handleReset} style={{ fontFamily: "'8bitOperator', monospace", fontSize: '0.68rem', padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.1em', background: 'rgba(30,30,40,0.9)', color: '#ffaa44', border: '2px solid rgba(255,140,0,0.5)', borderRadius: '6px', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>↺ REINICIAR</button>
          )}
          {canProceed && (
            <button onClick={handleProceed} style={{ fontFamily: "'8bitOperator', monospace", fontSize: '0.68rem', padding: '9px 22px', cursor: 'pointer', letterSpacing: '0.1em', background: 'linear-gradient(180deg, #ff9944 0%, #ff5511 50%, #cc2200 100%)', color: '#fff', border: '2px solid #ffcc66', borderRadius: '6px', boxShadow: '0 0 20px rgba(255,100,30,0.6), 0 4px 0 #881100', textShadow: '0 0 8px rgba(255,255,255,0.8)' }}>¡A PELEAR! → (ENTER)</button>
          )}
        </div>
      </div>
    </div>
  );
}
