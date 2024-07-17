import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Logout from './Logout';

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded shadow-md">
      <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
      <p className="mb-4"><strong>UID:</strong> {user?.uid}</p>
      <Logout />
      <button 
        onClick={() => useAuthStore.setState({ user: null })}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Switch Account
      </button>
    </div>
  );
};

export default UserProfile;