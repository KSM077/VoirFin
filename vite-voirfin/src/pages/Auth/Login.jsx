import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, API_URL } from "../../components/Firebase/FirebaseService";
import LoginWithGoogle from "./LoginWithGoogle";
import ForgotPassword from "./ForgotPwd"
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./Auth.css";


const userImg = "/user.png";
const eyeImg = "/eye.png";
const emailImg = "/email.png";

const Login = () => {
  const [dataForm, setDataForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsLoading(false);
      return;
    }

    const handleLoad = () => setIsLoading(false);
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const handleChangeInput = (e) =>
    setDataForm((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, dataForm.email, dataForm.password);

      const userData = {
        firebaseUid: userCredential.user.uid,
        username: userCredential.user.displayName || dataForm.email.split("@")[0],
        email: userCredential.user.email,
        avatar: "default.png"
      };


      const response = await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        console.warn("Firebase ok, pero Postgres falló. Status:", response.status);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Error en login:", error.message);
      setIsAuthLoading(false);
      alert("Credenciales inválidas o cuenta no encontrada.");
    }
  };

  return (
    <>
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Cargando...</p>
        </div>
      )}
      {isAuthLoading && <LoadingScreen message="Iniciando sesión..." />}
      <div className="container" style={{ visibility: isLoading ? "hidden" : "visible" }}>
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
    </>
  );
};

export default Login;