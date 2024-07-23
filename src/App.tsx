import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';
import AudioVisualizer from '@/components/AudioVisualizer';
import AudioPlayer from '@/components/AudioPlayer';
import { useGestureStore } from '@/hooks/useGesture';

function App() {
  const { user, setUser } = useAuthStore();
  const { setTouchPositions, setScale, setRotation, setGestureStart, gestureStart } = useGestureStore();
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

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

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const newTouchPositions = Array.from(event.touches).map(touch => ({
      x: (touch.clientX / window.innerWidth) * 2 - 1,
      y: -(touch.clientY / window.innerHeight) * 2 + 1
    }));
    setTouchPositions(newTouchPositions);

    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const currentAngle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );
      
      if (gestureStart) {
        const scaleDiff = currentDistance / gestureStart.distance;
        const rotationDiff = currentAngle - gestureStart.angle;
        
        setScale(prevScale => prevScale * scaleDiff);
        setRotation(prevRotation => prevRotation + rotationDiff);
      }
    }
  }, [setTouchPositions, setScale, setRotation, gestureStart]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const initialDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const initialAngle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );
      setGestureStart({ distance: initialDistance, angle: initialAngle });
    }
  }, [setGestureStart]);

  const handleTouchEnd = useCallback(() => {
    setGestureStart(null);
  }, [setGestureStart]);

  if (!isAuthChecked) {
    return <div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div 
      className="h-screen w-full bg-black relative" 
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {user ? (
        <>
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white p-4 rounded">
            <AudioPlayer onAudioLoad={handleAudioLoad} />
          </div>
          <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded">
            <UserProfile />
            <button onClick={handleLogout} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          </div>
          {audioLoaded && (
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
              <AudioVisualizer />
            </Canvas>
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