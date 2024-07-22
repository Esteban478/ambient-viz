import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleAudioLoad = () => {
    setAudioLoaded(true);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const x = event.clientX / window.innerWidth * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    setPointerPosition({ x, y });
  };

  if (!isAuthChecked) {
    return <div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen w-full bg-black relative">
      {user ? (
        <>
          <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded">
            <AudioPlayer onAudioLoad={handleAudioLoad} />
          </div>
          <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded">
            <UserProfile />
            <button onClick={handleLogout} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          </div>
          {audioLoaded ? (
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }} onPointerMove={handlePointerMove}>
              <AudioVisualizer pointerPosition={pointerPosition} />
            </Canvas>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              Please upload and play an audio file to start visualization.
            </div>
          )}
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