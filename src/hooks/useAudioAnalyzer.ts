import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';

interface AudioStore {
  audioData: Uint8Array | null;
  setAudioData: (data: Uint8Array | null) => void;
}

const useAudioStore = create<AudioStore>((set) => ({
  audioData: null,
  setAudioData: (data) => set({ audioData: data }),
}));

const useAudioAnalyzer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const { setAudioData } = useAudioStore();

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      console.log('AudioContext initialized');
    }
  }, []);

  const connectAudio = useCallback((audioElement: HTMLAudioElement) => {
    console.log('Connecting audio');
    initAudioContext();

    if (!audioContextRef.current || !analyzerRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    try {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      sourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error('Error connecting audio:', error);
      return;
    }

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (analyzerRef.current && !audioElement.paused) {
        analyzerRef.current.getByteFrequencyData(dataArray);
        setAudioData(new Uint8Array(dataArray));
      } else {
        setAudioData(null);
      }
      rafRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();
    console.log('Audio analysis started');
  }, [initAudioContext, setAudioData]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      console.log('Audio analyzer cleanup');
    };
  }, []);

  return { connectAudio };
};

export { useAudioAnalyzer, useAudioStore };