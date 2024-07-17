import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col items-center space-y-4">
      {isLogin ? <Login /> : <SignUp />}
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="text-blue-500 underline"
      >
        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
      </button>
    </div>
  );
};

export default AuthForm;