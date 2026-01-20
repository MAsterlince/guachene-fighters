import { useState, useEffect, useRef, useCallback } from 'react';
import backgroundMusic from '@/assets/audio/background-music.mp3';

// Singleton audio instance to persist across component re-renders
let audioInstance: HTMLAudioElement | null = null;

export function useGameAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio instance only once
  useEffect(() => {
    if (!audioInstance) {
      audioInstance = new Audio(backgroundMusic);
      audioInstance.loop = true;
      audioInstance.volume = 0.5;
    }
    audioRef.current = audioInstance;

    // Update playing state based on audio
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audioInstance.addEventListener('play', handlePlay);
    audioInstance.addEventListener('pause', handlePause);

    return () => {
      if (audioInstance) {
        audioInstance.removeEventListener('play', handlePlay);
        audioInstance.removeEventListener('pause', handlePause);
      }
    };
  }, []);

  const play = useCallback(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(console.error);
    }
  }, [isMuted]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        if (newMuted) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(console.error);
        }
      }
      return newMuted;
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    isMuted,
    isPlaying,
    play,
    pause,
    toggleMute,
    setVolume,
  };
}
