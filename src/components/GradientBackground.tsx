import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RawShaderMaterial, Vector2, Color, Matrix4 } from 'three';
import { useAudioStore } from '@/hooks/useAudioAnalyzer';

const vertexShader = `
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec2 uResolution;
  uniform float uAudioLow;
  uniform float uAudioMid;
  uniform float uAudioHigh;
  varying vec2 vUv;

  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b*cos(6.28318*(c*t+d));
  }

  void main() {
    vec2 uv = vUv;
    vec2 pos = uv * 2.0 - 1.0;
    pos.x *= uResolution.x / uResolution.y;
    
    float dist = length(pos);
    float angle = atan(pos.y, pos.x);
    
    vec3 color = palette(
      dist + uTime * 0.1 + sin(angle * 5.0 + uTime) * 0.1,
      uColorA + vec3(uAudioLow, uAudioMid, uAudioHigh) * 0.2,
      uColorB + vec3(uAudioMid, uAudioHigh, uAudioLow) * 0.2,
      uColorC + vec3(uAudioHigh, uAudioLow, uAudioMid) * 0.2,
      vec3(0.5, 0.5, 0.5)
    );
    
    float waves = sin(dist * 20.0 - uTime * 2.0) * 0.5 + 0.5;
    waves *= mix(0.01, 0.05, (uAudioLow + uAudioMid + uAudioHigh) / 3.0);
    color += waves;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const GradientBackground: React.FC = () => {
  const { audioData } = useAudioStore();
  const materialRef = useRef<RawShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      modelViewMatrix: { value: new Matrix4() },
      projectionMatrix: { value: new Matrix4() },
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
      uColorA: { value: new Color(0.5, 0.5, 0.5) },
      uColorB: { value: new Color(0.5, 0.5, 0.5) },
      uColorC: { value: new Color(1.0, 1.0, 1.0) },
      uAudioLow: { value: 0 },
      uAudioMid: { value: 0 },
      uAudioHigh: { value: 0 },
    }),
    [size]
  );

  useFrame((state) => {
    if (materialRef.current && audioData) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.modelViewMatrix.value.copy(state.camera.matrixWorldInverse);
      materialRef.current.uniforms.projectionMatrix.value.copy(state.camera.projectionMatrix);

      const lowFreq = audioData.slice(0, 5).reduce((sum, val) => sum + val, 0) / 5 / 255;
      const midFreq = audioData.slice(5, 10).reduce((sum, val) => sum + val, 0) / 5 / 255;
      const highFreq = audioData.slice(10, 15).reduce((sum, val) => sum + val, 0) / 5 / 255;

      materialRef.current.uniforms.uAudioLow.value = lowFreq;
      materialRef.current.uniforms.uAudioMid.value = midFreq;
      materialRef.current.uniforms.uAudioHigh.value = highFreq;

      materialRef.current.uniforms.uColorA.value.lerp(new Color(lowFreq, midFreq, highFreq), 0.05);
      materialRef.current.uniforms.uColorB.value.lerp(new Color(midFreq, highFreq, lowFreq), 0.05);
      materialRef.current.uniforms.uColorC.value.lerp(new Color(highFreq, lowFreq, midFreq), 0.05);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default GradientBackground;