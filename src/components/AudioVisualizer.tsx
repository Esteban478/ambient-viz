import React from 'react';
import GradientBackground from './GradientBackground';
import ParticleGrid from './ParticleGrid';

interface AudioVisualizerProps {
  pointerPosition: { x: number; y: number };
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ pointerPosition }) => {
  return (
    <>
      <GradientBackground />
      <ParticleGrid gridSize={100} pointerPosition={pointerPosition} />
    </>
  );
};

export default AudioVisualizer;