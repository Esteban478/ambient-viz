import React from 'react';
import { useThree } from '@react-three/fiber';
import GradientBackground from './GradientBackground';
import ParticleGrid from './ParticleGrid';
import AudioReactiveSurface from './AudioReactiveSurface';
import { useGestureStore } from '@/hooks/useGesture';

const AudioVisualizer: React.FC = () => {
  const { touchPositions, scale, rotation } = useGestureStore();
  const { camera } = useThree();

  // Update camera based on scale
  camera.position.z = 1 / scale;

  return (
    <group rotation={[0, 0, rotation]}>
      <GradientBackground />
      <AudioReactiveSurface gridSize={1000} touchPositions={touchPositions} />
      <ParticleGrid gridSize={700} touchPositions={touchPositions} />
    </group>
  );
};

export default AudioVisualizer;