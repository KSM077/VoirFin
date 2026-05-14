import React, { useState } from 'react';  
import logo from '../../assets/logo.png';
import './Auth.css';
import Login from './Login';
import Signup from './SignUp';

const AuthPage = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [isActionActive, setIsActionActive] = useState(true);

  const toggleAuth = () => {
    setIsLoginActive(!isLoginActive);
    setIsActionActive(!isActionActive);
  };

  return (
    <div className="auth-container">
      <div className="toggle">
        <label className={`toggle-layer ${isActionActive ? 'active' : ''}`} onClick={toggleAuth}> 
          {isLoginActive ? 'SignUp' : 'Login'}
        <img src={logo} alt="" />
        </label>
      </div>
      <div className={`auth-toggle ${isActionActive ? 'active' : ''}`}>
        {isLoginActive ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default AuthPage;