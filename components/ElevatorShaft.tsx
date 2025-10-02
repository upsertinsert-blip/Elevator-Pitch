import React, { useState, useEffect, useRef } from 'react';
import { TRAVEL_TIME_PER_FLOOR_MS } from '../constants';
import type { FloorData, Theme, FloorContent } from '../types';

interface ElevatorShaftProps {
  floors: FloorData[];
  currentFloor: number;
  isMoving: boolean;
  travelSpeed: number;
  theme: Theme;
}

const DOOR_ANIMATION_MS = 1000;

const ContentViewer: React.FC<{ content: FloorContent }> = ({ content }) => {
    if (content.type.startsWith('image/')) {
        return <img src={content.data} alt={content.name} className="max-w-full max-h-full object-contain" />;
    }
    if (content.type.startsWith('video/')) {
        return <video src={content.data} className="max-w-full max-h-full" autoPlay loop muted playsInline />;
    }
    if (content.type.startsWith('audio/')) {
        return (
            <div className="text-center text-white p-4">
                <p className="truncate mb-2">{content.name}</p>
                <audio src={content.data} controls autoPlay loop />
            </div>
        );
    }
    if (content.type === 'text/html' || content.type === 'image/svg+xml') {
        return <iframe srcDoc={content.data} sandbox="allow-scripts" className="w-full h-full bg-white border-0" title={content.name} />;
    }
    return <p className="text-gray-400">Unsupported file type: {content.type}</p>;
};


const ElevatorCar = ({ floors, currentFloor, isMoving, travelSpeed, theme }: { floors: FloorData[], currentFloor: number, isMoving: boolean, travelSpeed: number, theme: Theme }) => {
  const [doorsOpen, setDoorsOpen] = useState(true);
  const arrivalTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);

    if (isMoving) {
      setDoorsOpen(false);
    } else {
      setDoorsOpen(true);
      arrivalTimeoutRef.current = window.setTimeout(() => {
        setDoorsOpen(false);
      }, 3500); // Doors stay open for 3.5 seconds
    }

    return () => {
      if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
    };
  }, [isMoving]);
  
  const currentFloorData = floors.find(f => f.level === currentFloor);
  const totalFloors = floors.length > 0 ? Math.max(...floors.map(f => f.level)) + 1 : 1;
  const floorHeight = 100 / totalFloors;
  
  const themeClasses: Record<Theme, { border: string, shadow: string }> = {
    cyberpunk: { border: 'border-cyan-400/50', shadow: 'shadow-[0_0_15px_rgba(0,255,255,0.4)_inset]' },
    outrun: { border: 'border-pink-500/50', shadow: 'shadow-[0_0_15px_rgba(255,0,255,0.5)_inset]' },
    vaporwave: { border: 'border-teal-400/50', shadow: 'shadow-[0_0_15px_rgba(100,200,200,0.5)_inset]' },
  };
  const activeTheme = themeClasses[theme];


  return (
    <div
      className="absolute w-full"
      style={{
        height: `${floorHeight}%`,
        bottom: `${(currentFloorData ? currentFloorData.level : 0) * floorHeight}%`,
        transition: `bottom ${TRAVEL_TIME_PER_FLOOR_MS / 1000 / travelSpeed}s linear`,
      }}
    >
      <div className="h-full mx-2 relative overflow-hidden rounded-t-lg">
        <div className={`absolute inset-0 bg-black border-2 ${activeTheme.border} ${activeTheme.shadow} flex items-center justify-center p-2`}>
            {currentFloorData?.content ? (
                <ContentViewer content={currentFloorData.content} />
            ) : (
                <div className="w-1/2 h-1/2 bg-gray-900/70 border border-gray-600 rounded flex items-center justify-center">
                    <div className="w-1/3 h-2 bg-cyan-200 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
        <div
          className="absolute left-0 top-0 h-full w-1/2 bg-gray-700 border-r-2 border-black"
          style={{ transform: doorsOpen ? 'translateX(-100%)' : 'translateX(0%)', transition: `transform ${DOOR_ANIMATION_MS / 1000}s ease-in-out` }}
        />
        <div
          className="absolute right-0 top-0 h-full w-1/2 bg-gray-700 border-l-2 border-black"
          style={{ transform: doorsOpen ? 'translateX(100%)' : 'translateX(0%)', transition: `transform ${DOOR_ANIMATION_MS / 1000}s ease-in-out` }}
        />
      </div>
    </div>
  );
};

const ElevatorShaft: React.FC<ElevatorShaftProps> = ({ floors, currentFloor, isMoving, travelSpeed, theme }) => {
  const totalFloors = floors.length > 0 ? Math.max(...floors.map(f => f.level)) + 1 : 1;
  const floorLevels = Array.from({ length: totalFloors }, (_, i) => i).reverse();

  return (
    <div className="h-full w-full bg-black bg-opacity-30 border-2 border-gray-700 rounded-lg flex flex-col p-2">
      <div className="relative h-full w-full">
        {floorLevels.map((level) => (
          <div
            key={level}
            className="flex items-center"
            style={{ height: `${100 / totalFloors}%` }}
          >
            <span className="text-gray-500 text-sm font-bold mr-2">{level}</span>
            <div className="flex-grow border-b border-dashed border-gray-600"></div>
          </div>
        ))}
        {floors.length > 0 && <ElevatorCar floors={floors} currentFloor={currentFloor} isMoving={isMoving} travelSpeed={travelSpeed} theme={theme} />}
      </div>
    </div>
  );
};

export default ElevatorShaft;
