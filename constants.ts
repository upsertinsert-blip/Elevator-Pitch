import type { FloorData } from './types';

export const INITIAL_FLOORS: FloorData[] = [
  {
    level: 0,
    name: "Lobby",
    description: "The gateway to the spire. Neon signs reflect off the polished chrome floors.",
    musicContent: null,
  },
  {
    level: 1,
    name: "Residential",
    description: "Compact, high-tech living spaces for the city's inhabitants.",
    musicContent: null,
  },
  {
    level: 2,
    name: "Hydroponics",
    description: "Lush, bioluminescent plants provide the tower with clean air and sustenance.",
    musicContent: null,
  },
  {
    level: 3,
    name: "Mainframe",
    description: "The digital heart of the tower. Endless rows of servers hum with raw data.",
    musicContent: null,
  },
  {
    level: 4,
    name: "Sky Lounge",
    description: "A high-class establishment with panoramic views of the neon-drenched cityscape.",
    musicContent: null,
  },
  {
    level: 5,
    name: "Observatory",
    description: "A view of the cosmos, far above the city lights. The stars are digital tonight.",
    musicContent: null,
  }
];

export const TRAVEL_TIME_PER_FLOOR_MS = 2000;

export const SFX = {
    click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c24a63162.mp3',
    arrive: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3b531e222.mp3',
    depart: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_355861619f.mp3',
};