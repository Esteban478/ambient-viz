import React, { useRef, useEffect, useState } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

interface AudioPlayerProps {
  onAudioLoad: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ onAudioLoad }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { connectAudio } = useAudioAnalyzer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioConnected, setIsAudioConnected] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      const handleCanPlay = () => {
        setDuration(audioRef.current!.duration);
        onAudioLoad();
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        audioRef.current?.removeEventListener('canplay', handleCanPlay);
        audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [onAudioLoad]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (!isAudioConnected) {
        connectAudio(audioRef.current);
        setIsAudioConnected(true);
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
      <audio ref={audioRef} src="/ambience-sea.mp3" />
      <div className="flex items-center justify-between w-full mb-4">
        <button 
          onClick={togglePlayPause} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="text-black">Ambience: Sea</div>
      </div>
      <div className="w-full mb-4">
        <input 
          type="range" 
          min={0} 
          max={duration} 
          value={currentTime} 
          onChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center w-full">
        <span className="mr-2">🔈</span>
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01} 
          value={volume} 
          onChange={handleVolumeChange}
          className="w-full"
        />
        <span className="ml-2">🔊</span>
      </div>
    </div>
  );
};

export default AudioPlayer;