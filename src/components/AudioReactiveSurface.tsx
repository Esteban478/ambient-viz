import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudioStore } from '@/hooks/useAudioAnalyzer';

interface AudioReactiveSurfaceProps {
  gridSize: number;
}

const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vElevation = modelPosition.y;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vec3 color = mix(uColorA, uColorB, vUv.x);
    color = mix(color, uColorC, vElevation * 2.0 + 0.5);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const AudioReactiveSurface: React.FC<AudioReactiveSurfaceProps> = ({ gridSize }) => {
  const { audioData } = useAudioStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 2, gridSize - 1, gridSize - 1);
  }, [gridSize]);

  const uniforms = useMemo(() => ({
    uColorA: { value: new THREE.Color(0x1e90ff) },
    uColorB: { value: new THREE.Color(0xff1493) },
    uColorC: { value: new THREE.Color(0xffff00) },
  }), []);

  useFrame((state) => {
    if (meshRef.current && materialRef.current && audioData) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const ix = Math.floor((i / 3) % gridSize);
        const iy = Math.floor((i / 3) / gridSize);
        
        const audioIndex = (ix + iy) % audioData.length;
        const audioValue = audioData[audioIndex] / 255;

        // Create wave-like motion
        const waveX = Math.sin(x * 5 + time) * 0.1;
        const waveY = Math.sin(y * 5 + time) * 0.1;
        
        // Combine audio reactivity with wave motion
        positions[i + 2] = waveX + waveY + audioValue * 0.5;
      }

      meshRef.current.geometry.attributes.position.needsUpdate = true;

      // Update colors based on audio data
      const lowFreq = audioData.slice(0, 5).reduce((sum, val) => sum + val, 0) / 5 / 255;
      const midFreq = audioData.slice(5, 10).reduce((sum, val) => sum + val, 0) / 5 / 255;
      const highFreq = audioData.slice(10, 15).reduce((sum, val) => sum + val, 0) / 5 / 255;

      materialRef.current.uniforms.uColorA.value.setRGB(lowFreq, midFreq, highFreq);
      materialRef.current.uniforms.uColorB.value.setRGB(midFreq, highFreq, lowFreq);
      materialRef.current.uniforms.uColorC.value.setRGB(highFreq, lowFreq, midFreq);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default AudioReactiveSurface;