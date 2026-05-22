import React, { useState, useEffect, useRef } from 'react';
import { GameMode } from '@/types/game';
import menuBackground from '@/assets/menu-background.png';
import tituloImg from '@/assets/titulo.png';
import { Volume2, VolumeX } from 'lucide-react';

// Importar audios como URLs con ?url para Vite
import menuMoveSrc from '@/assets/audio/menu-move.mp3?url';
import menuConfirmSrc from '@/assets/audio/menu-confirm.mp3?url';
import backgroundMusicSrc from '@/assets/audio/background-music.mp3?url';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [blink, setBlink] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);

  const bgMusicRef     = useRef<HTMLAudioElement | null>(null);
  const moveRef        = useRef<HTMLAudioElement | null>(null);
  const confirmRef     = useRef<HTMLAudioElement | null>(null);

  const options: { label: string; icon: string; mode: GameMode }[] = [
    { label: 'VS JUGADOR', icon: '👥', mode: 'pvp' },
    { label: 'VS CPU',     icon: '🤖', mode: 'cpu' },
  ];

  // ── Crear objetos Audio ──────────────────────────────────────────────────
  useEffect(() => {
    bgMusicRef.current  = new Audio(backgroundMusicSrc);
    moveRef.current     = new Audio(menuMoveSrc);
    confirmRef.current  = new Audio(menuConfirmSrc);

    bgMusicRef.current.loop   = true;
    bgMusicRef.current.volume = 0.45;

    // Intento inmediato (puede fallar por política del navegador)
    bgMusicRef.current.play().then(() => setMusicStarted(true)).catch(() => {});

    return () => {
      bgMusicRef.current?.pause();
      bgMusicRef.current = null;
    };
  }, []);

  // Primer click/keydown desbloquea el audio si no arrancó
  useEffect(() => {
    const unlock = () => {
      if (!musicStarted && bgMusicRef.current) {
        bgMusicRef.current.play().then(() => setMusicStarted(true)).catch(() => {});
      }
    };
    window.addEventListener('click',   unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click',   unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [musicStarted]);

  // ── Sync mute ───────────────────────────────────────────────────────────
  useEffect(() => {
    [bgMusicRef, moveRef, confirmRef].forEach(r => {
      if (r.current) r.current.muted = isMuted;
    });
  }, [isMuted]);

  // ── Parpadeo "PULSA PARA INICIAR" ───────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 550);
    return () => clearInterval(id);
  }, []);

  // ── Helpers de sonido ───────────────────────────────────────────────────
  const playMove = () => {
    if (!moveRef.current) return;
    moveRef.current.currentTime = 0;
    moveRef.current.play().catch(() => {});
  };

  const playConfirm = () => {
    if (!confirmRef.current) return;
    confirmRef.current.currentTime = 0;
    confirmRef.current.play().catch(() => {});
  };

  // ── Teclado ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp'   || e.key === 'w' || e.key === 'W') {
        setSelectedIndex(i => { const n = (i - 1 + options.length) % options.length; playMove(); return n; });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSelectedIndex(i => { const n = (i + 1) % options.length; playMove(); return n; });
      } else if (e.key === 'Enter' || e.key === ' ') {
        playConfirm();
        const mode = options[selectedIndex].mode;
        setTimeout(() => onSelectMode(mode), 250);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex]);

  const handleClick = (index: number, mode: GameMode) => {
    playConfirm();
    setSelectedIndex(index);
    setTimeout(() => onSelectMode(mode), 250);
  };

  const handleHover = (index: number) => {
    if (index !== selectedIndex) { playMove(); setSelectedIndex(index); }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        backgroundImage: `url(${menuBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'8bitOperator', monospace",
      }}
    >
      {/* Gradiente oscuro inferior */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.78) 100%)',
      }} />

      {/* Scanlines sutiles */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
      }} />

      {/* ── Botón mute (top-left) ── */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
        <button
          onClick={() => { setIsMuted(m => !m); }}
          style={{
            background: 'rgba(0,0,0,0.72)',
            border: '2px solid rgba(255,140,50,0.6)',
            borderRadius: 8,
            padding: '10px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(255,100,30,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {isMuted
            ? <VolumeX style={{ width: 22, height: 22, color: '#ff5533' }} />
            : <Volume2 style={{ width: 22, height: 22, color: '#ffaa44' }} />
          }
        </button>
      </div>

      {/* ── TÍTULO ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '1rem', marginBottom: '-2rem',
      }}>
        <img
          src={tituloImg}
          alt="Guachene Fighters"
          style={{
            width: 'clamp(300px, 48vw, 620px)',
            filter: 'drop-shadow(0 0 28px rgba(255,120,0,0.6)) drop-shadow(0 6px 10px rgba(0,0,0,0.85))',
            animation: 'gfTitleFloat 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── BOTONES + INFO (bottom) ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.5rem', paddingBottom: '0.8rem', width: '100%',
      }}>

        {/* Botones */}
        {options.map((opt, i) => {
          const sel = selectedIndex === i;
          return (
            <button
              key={opt.mode}
              onClick={() => handleClick(i, opt.mode)}
              onMouseEnter={() => handleHover(i)}
              style={{
                minWidth: 300,
                padding: '13px 36px',
                fontFamily: "'8bitOperator', monospace",
                fontSize: '1.05rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                background: sel
                  ? 'linear-gradient(180deg, #ff9944 0%, #ff5511 50%, #cc2200 100%)'
                  : 'linear-gradient(180deg, rgba(28,28,38,0.93) 0%, rgba(18,18,28,0.97) 100%)',
                border: `3px solid ${sel ? '#ffcc66' : 'rgba(110,110,130,0.45)'}`,
                borderRadius: 6,
                color: sel ? '#ffffff' : '#aabbcc',
                boxShadow: sel
                  ? '0 0 32px rgba(255,110,30,0.75), 0 5px 0 #881100, inset 0 1px 0 rgba(255,255,255,0.22)'
                  : '0 5px 0 rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
                transform: sel ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
                textShadow: sel ? '0 0 12px rgba(255,255,255,0.85)' : 'none',
              }}
            >
              {sel && (
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ffdd44', fontSize: '0.95rem',
                  animation: 'gfArrow 0.45s ease-in-out infinite alternate',
                }}>▶</span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.05rem' }}>{opt.icon}</span>
                {opt.label}
              </span>
            </button>
          );
        })}

        {/* Controles */}
        <div style={{
          background: 'rgba(0,0,0,0.72)',
          border: '1px solid rgba(255,110,40,0.32)',
          borderRadius: 8,
          padding: '11px 28px',
          boxShadow: '0 0 18px rgba(255,80,20,0.12)',
        }}>
          <div style={{
            display: 'flex', gap: 36,
            fontFamily: "'8bitOperator', monospace",
            fontSize: '0.66rem', color: '#8899aa',
          }}>
            <div>
              <p style={{ color: '#4488ff', marginBottom: 4, letterSpacing: '0.1em' }}>P1</p>
              <p><span style={{ color: '#5577aa' }}>WASD</span>&nbsp; Moverse</p>
              <p><span style={{ color: '#5577aa' }}>C / V</span>&nbsp; Golpes</p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,100,40,0.2)', alignSelf: 'stretch' }} />
            <div>
              <p style={{ color: '#ff4444', marginBottom: 4, letterSpacing: '0.1em' }}>P2</p>
              <p><span style={{ color: '#5577aa' }}>Flechas</span>&nbsp; Moverse</p>
              <p><span style={{ color: '#5577aa' }}>O / P</span>&nbsp; Golpes</p>
            </div>
          </div>
        </div>

        {/* PULSA PARA INICIAR */}
        <p style={{
          fontFamily: "'8bitOperator', monospace",
          fontSize: '0.8rem',
          letterSpacing: '0.22em',
          color: '#ffcc00',
          textShadow: '0 0 14px rgba(255,200,0,0.6)',
          opacity: blink ? 1 : 0,
          transition: 'opacity 0.12s',
          margin: 0,
        }}>
          PUTO EL QUE LO LEA
        </p>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes gfTitleFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-9px); }
        }
        @keyframes gfArrow {
          from { transform: translateY(-50%) translateX(0px); }
          to   { transform: translateY(-50%) translateX(5px); }
        }
      `}</style>
    </div>
  );
}