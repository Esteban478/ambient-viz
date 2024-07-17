import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

const Logout: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
      Logout
    </button>
  );
};

export default Logout;