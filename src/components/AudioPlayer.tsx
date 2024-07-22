import React, { useRef, useEffect, useState } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

interface AudioPlayerProps {
  onAudioLoad: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ onAudioLoad }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { connectAudio } = useAudioAnalyzer();
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (audioRef.current && audioSrc && !isConnected) {
      const handleCanPlay = () => {
        connectAudio(audioRef.current!);
        setIsConnected(true);
        onAudioLoad();
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        audioRef.current?.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [audioSrc, connectAudio, onAudioLoad, isConnected]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setIsConnected(false);  // Reset connection state for new file
      console.log("Audio file loaded:", file.name);
    }
  };

  return (
    <div className="mt-4">
      <input type="file" accept="audio/*" onChange={handleFileUpload} className="mb-2" />
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} controls className="w-full" />
      )}
    </div>
  );
};

export default AudioPlayer;