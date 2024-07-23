import React from 'react';
import GradientBackground from './GradientBackground';
import ParticleGrid from './ParticleGrid';
import AudioReactiveSurface from './AudioReactiveSurface';

interface AudioVisualizerProps {
  touchPositions: { x: number; y: number }[];
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ touchPositions }) => {
  return (
    <>
      <GradientBackground />
      <AudioReactiveSurface gridSize={1000} touchPositions={touchPositions} />
      <ParticleGrid gridSize={700} touchPositions={touchPositions} />
    </>
  );
};

export default AudioVisualizer;