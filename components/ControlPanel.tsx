import React from 'react';
import type { FloorData, Direction, Theme } from '../types';
import { UpArrowIcon, DownArrowIcon, MusicNoteIcon, SettingsIcon, SoundOnIcon, SoundOffIcon } from './Icons';

interface ControlPanelProps {
  floors: FloorData[];
  currentFloor: number;
  isMoving: boolean;
  direction: Direction;
  onSelectFloor: (floorLevel: number) => void;
  currentMusicName: string | null;
  justArrived: boolean;
  sfxEnabled: boolean;
  onSfxToggle: () => void;
  onManageFloors: () => void;
  travelSpeed: number;
  onTravelSpeedChange: (speed: number) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  floors,
  currentFloor,
  isMoving,
  direction,
  onSelectFloor,
  currentMusicName,
  justArrived,
  sfxEnabled,
  onSfxToggle,
  onManageFloors,
  travelSpeed,
  onTravelSpeedChange,
  theme,
  onThemeChange,
}) => {
    const themeClasses: Record<Theme, { text: string, shadow: string, border: string, accent: string, button: string }> = {
    cyberpunk: { text: 'text-cyan-300', shadow: 'shadow-[0_0_30px_rgba(0,255,255,0.3)]', border: 'border-cyan-500/50', accent: 'bg-cyan-500', button: 'text-cyan-300 hover:bg-gray-600 hover:text-white' },
    outrun: { text: 'text-pink-400', shadow: 'shadow-[0_0_30px_rgba(255,0,255,0.4)]', border: 'border-pink-500/50', accent: 'bg-pink-500', button: 'text-pink-400 hover:bg-gray-600 hover:text-white' },
    vaporwave: { text: 'text-teal-300', shadow: 'shadow-[0_0_30px_rgba(100,200,200,0.4)]', border: 'border-teal-400/50', accent: 'bg-teal-400', button: 'text-teal-300 hover:bg-gray-600 hover:text-white' },
  };
  const activeTheme = themeClasses[theme];

  return (
    <div className={`w-full max-w-md bg-black bg-opacity-50 rounded-xl border-2 ${activeTheme.border} p-6 ${activeTheme.shadow} transition-all duration-500`}>
      <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 mb-6 text-center">
        <div className="text-gray-400 text-sm mb-2">CURRENT FLOOR</div>
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8">{direction === 'up' && <UpArrowIcon className="text-green-400 animate-pulse w-8 h-8" />}</div>
          <div className={`text-7xl font-bold ${activeTheme.text} ${justArrived ? 'animate-pulse' : ''}`} style={{textShadow: '0 0 10px'}}>{currentFloor}</div>
          <div className="w-8 h-8">{direction === 'down' && <DownArrowIcon className="text-red-400 animate-pulse w-8 h-8" />}</div>
        </div>
        <div className="text-gray-400 text-sm mt-2">{floors.find(f => f.level === currentFloor)?.name ?? 'Unknown'}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {floors.map((floor) => (
          <button
            key={floor.level}
            onClick={() => onSelectFloor(floor.level)}
            disabled={isMoving || currentFloor === floor.level}
            className={`py-4 text-2xl font-bold rounded-lg transition-all duration-300 ${currentFloor === floor.level ? `${activeTheme.accent} text-gray-900 shadow-lg` : `bg-gray-700 ${activeTheme.button} disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}`}
          >
            {floor.level}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 flex items-center space-x-4">
        <MusicNoteIcon className={`w-8 h-8 ${activeTheme.text} flex-shrink-0`} />
        <div className="overflow-hidden">
            <div className={`text-md font-bold text-white ${!isMoving && !!currentMusicName ? 'animate-pulse' : ''}`}>Now Playing</div>
            <p className="text-sm text-gray-300 truncate">{currentMusicName ?? 'Silence'}</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={onManageFloors} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"><SettingsIcon className="w-5 h-5" /><span>Manage Floors</span></button>
          <button onClick={onSfxToggle} className="text-gray-300 hover:text-white transition-colors">{sfxEnabled ? <SoundOnIcon className="w-6 h-6" /> : <SoundOffIcon className="w-6 h-6" />}</button>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-gray-400 text-sm">Speed:</label>
          <input type="range" min="0.5" max="3" step="0.1" value={travelSpeed} onChange={(e) => onTravelSpeedChange(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-gray-400 text-sm">Theme:</label>
          <select value={theme} onChange={e => onThemeChange(e.target.value as Theme)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5">
            <option value="cyberpunk">Cyberpunk</option>
            <option value="outrun">Outrun</option>
            <option value="vaporwave">Vaporwave</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;