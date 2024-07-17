import React, { useRef, useEffect, useState } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

interface AudioPlayerProps {
  onAudioLoad: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ onAudioLoad }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { connectAudio } = useAudioAnalyzer();
  const [isAudioConnected, setIsAudioConnected] = useState(false);

  useEffect(() => {
    if (audioRef.current && !isAudioConnected) {
      const handleCanPlay = () => {
        connectAudio(audioRef.current!);
        setIsAudioConnected(true);
        onAudioLoad();
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        audioRef.current?.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [connectAudio, onAudioLoad, isAudioConnected]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setIsAudioConnected(false); // Reset connection state for new file
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded shadow-md">
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      <audio ref={audioRef} controls />
    </div>
  );
};

export default AudioPlayer;