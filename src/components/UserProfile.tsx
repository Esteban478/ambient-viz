import React from 'react';
import { useAuthStore } from '@/store/authStore';

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="text-sm">
      <p className="font-bold">{user.email}</p>
      <p className="text-gray-600">ID: {user.uid.slice(0, 6)}...</p>
    </div>
  );
};

export default UserProfile;