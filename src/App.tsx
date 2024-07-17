import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';
import AudioVisualizer from '@/components/AudioVisualizer';
import AudioPlayer from '@/components/AudioPlayer';

function App() {
  const { user, setUser } = useAuthStore();
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleAudioLoad = () => {
    setAudioLoaded(true);
  };

  return (
    <div className="h-screen w-full">
      {user ? (
        <>
          <UserProfile />
          <AudioPlayer onAudioLoad={handleAudioLoad} />
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            {audioLoaded && <AudioVisualizer />}
            <OrbitControls />
          </Canvas>
        </>
      ) : (
        <div className="flex justify-center items-center h-full">
          <AuthForm />
        </div>
      )}
    </div>
  );
}

export default App;