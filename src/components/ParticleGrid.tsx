import React, { useRef, useMemo, useState, useEffect } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { RawShaderMaterial, Vector3, BufferGeometry, Float32BufferAttribute, Matrix4 } from 'three';
import { useAudioStore } from '@/hooks/useAudioAnalyzer';
import { Html } from '@react-three/drei';
import THREE from 'three';

interface ParticleGridProps {
  gridSize: number;
  pointerPosition: { x: number; y: number };
}

const vertexShader = `
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec3 color;
  attribute float vertexIndex;
  varying vec3 vColor;
  uniform float uTime;
  uniform vec3 uMousePosition;
  uniform float uAudioData[16];

  void main() {
    vColor = color;
    vec3 pos = position;
    
    // Audio reactivity
    float audioValue = uAudioData[int(mod(vertexIndex, 16.0))];
    pos.z += sin(uTime + pos.x * 0.1 + pos.y * 0.1) * 0.1 + audioValue * 0.2;
    
    // Mouse interaction
    vec3 toMouse = uMousePosition - pos;
    float distToMouse = length(toMouse);
    if (distToMouse < 0.5) {
      float pushStrength = (1.0 - distToMouse / 0.5) * 0.2;
      pos -= normalize(toMouse) * pushStrength;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 3.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

const ParticleGrid: React.FC<ParticleGridProps> = ({ gridSize }) => {
  const { audioData } = useAudioStore();
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport, camera } = useThree();
  const [mousePosition, setMousePosition] = useState<Vector3>(new Vector3(0, 0, 0));
  const [debugInfo, setDebugInfo] = useState<string>('');

  const [particles, colors, indices] = useMemo(() => {
    const particlesArray = [];
    const colorsArray = [];
    const indicesArray = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / (gridSize - 1) - 0.5) * 2 * viewport.width;
        const y = (j / (gridSize - 1) - 0.5) * 2 * viewport.height;
        particlesArray.push(x, y, 0);
        colorsArray.push(Math.random(), Math.random(), Math.random());
        indicesArray.push(i * gridSize + j);
      }
    }
    return [
      new Float32Array(particlesArray),
      new Float32Array(colorsArray),
      new Float32Array(indicesArray)
    ];
  }, [gridSize, viewport]);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(particles, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geo.setAttribute('vertexIndex', new Float32BufferAttribute(indices, 1));
    return geo;
  }, [particles, colors, indices]);

  const uniforms = useMemo(() => ({
    modelViewMatrix: { value: new Matrix4() },
    projectionMatrix: { value: new Matrix4() },
    uTime: { value: 0 },
    uMousePosition: { value: new Vector3() },
    uAudioData: { value: new Float32Array(16) },
  }), []);

  const material = useMemo(() => {
    return new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      vertexColors: true,
    });
  }, [uniforms]);

  useFrame((state) => {
    if (pointsRef.current && audioData) {
      const material = pointsRef.current.material as RawShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.modelViewMatrix.value.copy(state.camera.matrixWorldInverse);
      material.uniforms.projectionMatrix.value.copy(state.camera.projectionMatrix);
      material.uniforms.uMousePosition.value.copy(mousePosition);

      // Update audio data uniform
      const audioDataArray = material.uniforms.uAudioData.value;
      for (let i = 0; i < 16; i++) {
        audioDataArray[i] = audioData[i] / 255;
      }
      material.uniformsNeedUpdate = true;
    }
  });

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    const vector = new Vector3(x, y, 0.5);
    vector.unproject(camera);
    setMousePosition(vector);
  };

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo(`Mouse: x=${mousePosition.x.toFixed(2)}, y=${mousePosition.y.toFixed(2)}`);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 100);
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <mesh onPointerMove={handlePointerMove}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <Html position={[-viewport.width / 2 + 0.2, viewport.height / 2 - 0.2, 0]}>
        <div style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px' }}>
          {debugInfo}
        </div>
      </Html>
    </>
  );
};

export default ParticleGrid;