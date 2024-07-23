import { create } from 'zustand';

interface GestureStart {
  distance: number;
  angle: number;
}

interface GestureState {
  touchPositions: { x: number; y: number }[];
  scale: number;
  rotation: number;
  gestureStart: GestureStart | null;
  setTouchPositions: (positions: { x: number; y: number }[]) => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setRotation: (rotation: number | ((prev: number) => number)) => void;
  setGestureStart: (start: GestureStart | null) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  touchPositions: [],
  scale: 1,
  rotation: 0,
  gestureStart: null,
  setTouchPositions: (positions) => set({ touchPositions: positions }),
  setScale: (scale) => set((state) => ({ 
    scale: typeof scale === 'function' ? scale(state.scale) : scale 
  })),
  setRotation: (rotation) => set((state) => ({ 
    rotation: typeof rotation === 'function' ? rotation(state.rotation) : rotation 
  })),
  setGestureStart: (start) => set({ gestureStart: start }),
}));