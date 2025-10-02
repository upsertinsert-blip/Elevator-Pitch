// FIX: Removed a self-import of `FloorContent` that conflicted with the interface declaration in this file.

export interface FloorContent {
  type: string; // MIME type
  data: string; // base64 data URL
  name: string; // original file name
}

export interface FloorData {
  level: number;
  name: string;
  description?: string;
  content?: FloorContent | null;
  musicContent?: FloorContent | null;
}

export type Direction = 'up' | 'down' | 'idle';

export type ModalMode = 'add' | 'edit' | null;

export type Theme = 'cyberpunk' | 'outrun' | 'vaporwave';