import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../components/Firebase/FirebaseService";
import LoginWithGoogle from "./LoginWithGoogle";
import ForgotPassword from "./ForgotPwd"
import "./Auth.css";


const userImg = "/user.png";
const eyeImg = "/eye.png";
const emailImg = "/email.png";

const Login = () => {
  const [dataForm, setDataForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChangeInput = (e) =>
    setDataForm((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  // ... dentro de handleSubmitForm en Login.js
const handleSubmitForm = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, dataForm.email, dataForm.password);
    
    // COMENTA ESTE BLOQUE TEMPORALMENTE
    /*
    if (!userCredential.user.emailVerified) {
      await auth.signOut();
      alert("Por favor, verifica tu correo antes de iniciar sesión.");
      return;
    }
    */

    // Sincronización con el backend (Postgres)
    const userData = {
      firebaseUid: userCredential.user.uid,
      username: userCredential.user.displayName || dataForm.email.split("@")[0],
      email: userCredential.user.email,
      avatar: "default.png"
    };

    await fetch('http://localhost:8080/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    // REDIRECCIÓN CORRECTA
    navigate("/dashboard"); 

  } catch (error) {
    console.error("Error en login:", error.message);
    alert("Credenciales inválidas o cuenta no encontrada.");
  }
  };

  return (
    <div className="container">
      <form method="POST" onSubmit={handleSubmitForm}>
        <div className="header">
          <h3>Login</h3>
        </div>
        <div className="input-group">
          <div className="input">
            <img src={emailImg} alt="Email" />
            <input 
              type="email" 
              name="email" 
              value={dataForm.email} 
              onChange={handleChangeInput} 
              placeholder="Email" 
              required
            />
          </div>
          <div className="input">
            <img src={eyeImg} alt="Password" />
            <input 
              type="password" 
              name="password" 
              value={dataForm.password} 
              onChange={handleChangeInput} 
              placeholder="Password" 
              required
            />
          </div>
        </div>
        <div className="forgot-password">
          <h6>Did you forget password? 
            <span>¡Click here!</span>
          </h6>
        </div>
        <button type="submit" className="submit">Login</button>
        <div className="social">
          <LoginWithGoogle />   
        </div>
      </form>
    </div>
  );
};

export default Login;