import React, { useState, useRef, useCallback, useEffect } from 'react';
import { INITIAL_FLOORS, TRAVEL_TIME_PER_FLOOR_MS, SFX } from './constants';
import type { Direction, FloorData, ModalMode, Theme } from './types';
import ControlPanel from './components/ControlPanel';
import ElevatorShaft from './components/ElevatorShaft';
import FloorManagementModal from './components/FloorManagementModal';

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};


function App() {
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [floors, setFloors] = usePersistentState<FloorData[]>('floors', INITIAL_FLOORS);
  const [currentFloor, setCurrentFloor] = usePersistentState<number>('currentFloor', 0);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<Direction>('idle');
  const [justArrived, setJustArrived] = useState(false);
  
  // New features state
  const [sfxEnabled, setSfxEnabled] = usePersistentState<boolean>('sfxEnabled', true);
  const [travelSpeed, setTravelSpeed] = usePersistentState<number>('travelSpeed', 1); // Multiplier
  const [theme, setTheme] = usePersistentState<Theme>('theme', 'cyberpunk');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSfx = useCallback((key: keyof typeof SFX) => {
    if (sfxEnabled && sfxRef.current[key]) {
      sfxRef.current[key].currentTime = 0;
      sfxRef.current[key].play().catch(e => {
        // Ignore AbortError which can happen on rapid user interaction
        if (e.name !== 'AbortError') {
          console.error(`SFX play failed for ${key}`, e)
        }
      });
    }
  }, [sfxEnabled]);

  // Create SFX audio elements on mount
  useEffect(() => {
    Object.entries(SFX).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.preload = 'auto'; // Aggressively preload SFX
      audio.crossOrigin = 'anonymous'; // Set cross-origin for external audio
      sfxRef.current[key] = audio;
    });
  }, []);

  // Centralized effect for managing music playback
  useEffect(() => {
    if (!experienceStarted || !audioRef.current || floors.length === 0) {
      return;
    }
    const audio = audioRef.current;
    const currentFloorData = floors.find(f => f.level === currentFloor);

    // Wrapper to play audio and handle potential errors
    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
          }
        });
      }
    };
    
    // Define the handler separately to be able to remove it
    const handleCanPlay = () => {
        playAudio();
    };

    if (isMoving || !currentFloorData || !currentFloorData.musicContent) {
      audio.pause();
      // Important: remove listener if we pause, to avoid it playing after a move
      audio.removeEventListener('canplay', handleCanPlay);
    } else {
      const newSrc = currentFloorData.musicContent.data;
      if (audio.src !== newSrc) {
        audio.src = newSrc;
        audio.addEventListener('canplay', handleCanPlay, { once: true });
        audio.load();
      } else if (audio.paused) {
        playAudio();
      }
    }

    return () => {
      if (audio) {
        audio.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [currentFloor, isMoving, experienceStarted, floors]);

  const handleFloorSelect = useCallback((floorLevel: number) => {
    if (floorLevel === currentFloor || isMoving) return;

    playSfx('click');

    const oldFloor = currentFloor;
    const travelDuration = Math.abs(floorLevel - oldFloor) * (TRAVEL_TIME_PER_FLOOR_MS / travelSpeed);
    const doorAnimationTime = 1000;

    setIsMoving(true);
    setDirection(floorLevel > oldFloor ? 'up' : 'down');
    
    setTimeout(() => {
      playSfx('depart');
      setCurrentFloor(floorLevel);
    }, doorAnimationTime);

    setTimeout(() => {
      playSfx('arrive');
      setIsMoving(false);
      setDirection('idle');
      setJustArrived(true);
      setTimeout(() => setJustArrived(false), 2000);
    }, doorAnimationTime + travelDuration);
  }, [currentFloor, isMoving, playSfx, travelSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isModalOpen) return; // Don't trigger while editing
        const floorLevel = parseInt(e.key, 10);
        if (!isNaN(floorLevel) && floors.some(f => f.level === floorLevel)) {
            handleFloorSelect(floorLevel);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFloorSelect, floors, isModalOpen]);

  const handleStart = () => {
    setExperienceStarted(true);
    if (audioRef.current) {
        audioRef.current.volume = 0.7;
    }
    // Eagerly load all SFX audio on the first user interaction.
    // This helps prevent "no supported source" errors by ensuring
    // the browser has started fetching the files.
    Object.values(sfxRef.current).forEach(audio => audio.load());
  };

  const currentMusicName = floors.find(f => f.level === currentFloor)?.musicContent?.name ?? null;

  const themeClasses: Record<Theme, { bg: string, text: string, shadow: string, border: string }> = {
    cyberpunk: { bg: 'bg-gray-900', text: 'text-cyan-300', shadow: 'shadow-[0_0_20px_rgba(0,255,255,0.4)]', border: 'border-cyan-500'},
    outrun: { bg: 'bg-indigo-900', text: 'text-pink-400', shadow: 'shadow-[0_0_20px_rgba(255,0,255,0.5)]', border: 'border-pink-500' },
    vaporwave: { bg: 'bg-gray-800', text: 'text-teal-300', shadow: 'shadow-[0_0_20px_rgba(100,200,200,0.5)]', border: 'border-teal-400' },
  };
  const activeTheme = themeClasses[theme];

  if (!experienceStarted) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${activeTheme.bg} font-mono transition-colors duration-500`}>
        <div className={`text-center p-8 bg-black bg-opacity-50 rounded-lg border ${activeTheme.border} ${activeTheme.shadow}`}>
          <h1 className={`text-4xl font-bold ${activeTheme.text} mb-4`} style={{textShadow: '0 0 8px'}}>Synthwave Elevator</h1>
          <p className="text-gray-300 mb-8 max-w-md">An immersive audio-visual experience. Each floor features a unique electronic track. Please enable audio for the best experience.</p>
          <button
            onClick={handleStart}
            className={`px-8 py-3 bg-cyan-500 text-gray-900 font-bold rounded-md hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.6)]`}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`${activeTheme.bg} min-h-screen text-white font-mono overflow-hidden transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4 h-full">
            <ElevatorShaft 
              floors={floors}
              currentFloor={currentFloor} 
              isMoving={isMoving} 
              travelSpeed={travelSpeed}
              theme={theme}
            />
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4 h-full flex items-center justify-center">
            <ControlPanel
                floors={floors}
                currentFloor={currentFloor}
                isMoving={isMoving}
                direction={direction}
                onSelectFloor={handleFloorSelect}
                currentMusicName={currentMusicName}
                justArrived={justArrived}
                sfxEnabled={sfxEnabled}
                onSfxToggle={() => setSfxEnabled(prev => !prev)}
                onManageFloors={() => setIsModalOpen(true)}
                travelSpeed={travelSpeed}
                onTravelSpeedChange={setTravelSpeed}
                theme={theme}
                onThemeChange={setTheme}
            />
        </div>
        <audio ref={audioRef} loop />
        {isModalOpen && (
          <FloorManagementModal
            floors={floors}
            onClose={() => setIsModalOpen(false)}
            onSave={setFloors}
            theme={theme}
          />
        )}
      </div>
    </main>
  );
}

export default App;