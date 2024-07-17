import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Vector3, Color, Group } from 'three';
import * as THREE from 'three';
import { useAudioStore } from '@/hooks/useAudioAnalyzer';

const AudioVisualizer: React.FC = () => {
  const { audioData } = useAudioStore();
  const groupRef = useRef<Group>(null);
  const cubeRef = useRef<Mesh>(null);
  const [debugText, setDebugText] = useState('');
  const baseScale = useRef(new Vector3(1, 1, 1));
  const color = useRef(new Color(0.5, 0.5, 0.5));
  const lastUpdateTime = useRef(Date.now());

  useEffect(() => {
    console.log('AudioVisualizer mounted');
    return () => console.log('AudioVisualizer unmounted');
  }, []);

  useFrame((state) => {
    const currentTime = Date.now();
    const isAudioPlaying = audioData && audioData.some(value => value > 0);

    if (groupRef.current && cubeRef.current && isAudioPlaying) {
      lastUpdateTime.current = currentTime;

      const lowFreq = audioData.slice(0, 5).reduce((sum, val) => sum + val, 0) / 5;
      const midFreq = audioData.slice(5, 10).reduce((sum, val) => sum + val, 0) / 5;
      const highFreq = audioData.slice(10, 15).reduce((sum, val) => sum + val, 0) / 5;

      // More dramatic scaling
      const scaleX = baseScale.current.x * (1 + lowFreq / 128);
      const scaleY = baseScale.current.y * (1 + midFreq / 128);
      const scaleZ = baseScale.current.z * (1 + highFreq / 128);

      cubeRef.current.scale.set(scaleX, scaleY, scaleZ);

      // Rotate the entire group
      const avgFreq = (lowFreq + midFreq + highFreq) / 3;
      groupRef.current.rotation.y += 0.01 * (avgFreq / 128);
      
      // Move the cube up and down based on mid frequencies
      cubeRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * (midFreq / 256);

      // Change color based on frequencies
      const r = 0.5 + (lowFreq / 512);
      const g = 0.5 + (midFreq / 512);
      const b = 0.5 + (highFreq / 512);
      color.current.setRGB(r, g, b);
      
      if (cubeRef.current.material) {
        (cubeRef.current.material as THREE.MeshPhongMaterial).color = color.current;
        (cubeRef.current.material as THREE.MeshPhongMaterial).emissive = color.current.clone().multiplyScalar(0.3);
      }

      const debugInfo = `
        Scales: ${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}, ${scaleZ.toFixed(2)}
        Freqs: ${lowFreq.toFixed(2)}, ${midFreq.toFixed(2)}, ${highFreq.toFixed(2)}
        Color: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}
      `;
      setDebugText(debugInfo);
    } else if (currentTime - lastUpdateTime.current > 100) {
      // Gradually return to initial state when audio is not playing
      if (cubeRef.current) {
        cubeRef.current.scale.lerp(baseScale.current, 0.1);
        cubeRef.current.position.y *= 0.9;
      }
      if (groupRef.current) {
        groupRef.current.rotation.y *= 0.95;
      }
      color.current.lerp(new Color(0.5, 0.5, 0.5), 0.1);
      if (cubeRef.current && cubeRef.current.material) {
        (cubeRef.current.material as THREE.MeshPhongMaterial).color = color.current;
        (cubeRef.current.material as THREE.MeshPhongMaterial).emissive = color.current.clone().multiplyScalar(0.3);
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <mesh ref={cubeRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial />
        </mesh>
        {/* Add some orbiting spheres */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.sin(i * 2 * Math.PI / 3) * 2, 0, Math.cos(i * 2 * Math.PI / 3) * 2]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshPhongMaterial color={new Color(i === 0 ? 'red' : i === 1 ? 'green' : 'blue')} />
          </mesh>
        ))}
      </group>
      <Html position={[0, 2, 0]}>
        <div style={{color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', whiteSpace: 'pre-line'}}>
          {debugText}
        </div>
      </Html>
      {/* Add some ambient and directional light */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </>
  );
};

export default AudioVisualizer;