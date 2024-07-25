import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';

const UserProfile: React.FC = () => {
  const { user, setUser } = useAuthStore();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="text-sm">
      <p className="font-bold">{user.email}</p>
      <p className="text-gray-600">ID: {user.uid.slice(0, 6)}...</p>
      <button 
        onClick={handleLogout}
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;