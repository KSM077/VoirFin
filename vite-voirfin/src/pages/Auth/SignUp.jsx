import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db, API_URL } from "../../components/Firebase/FirebaseService"; 
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import LoginWithGoogle from "./LoginWithGoogle";
import "./Auth.css";

const userImg = "/user.png";
const eyeImg = "/eye.png";
const emailImg = "/email.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [dataForm, setDataForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChangeInput = (e) =>
    setDataForm((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const handleSubmitForm = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, dataForm.email, dataForm.password);
    if (!userCredential.user) throw new Error("Error al crear el usuario");


    await setDoc(doc(db, "users", userCredential.user.uid), {
      username: dataForm.username,
      email: dataForm.email,
      avatar: "default.png",
      enabled: false
    });

    await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: userCredential.user.uid,
        username: dataForm.username, 
        email: dataForm.email,     
        avatar: "default.png"
      }),
    });
    
    await sendEmailVerification(userCredential.user);
    navigate("/login");
  } catch (error) {
    console.error("Error en registro:", error);
  }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmitForm}>
        <div className="header">
          <h3>Sign Up</h3>
        </div>
        <div className="input-group">
          <div className="input">
            <img src={userImg} alt="User" />
            <input 
              type="text" 
              name="username" 
              value={dataForm.username} 
              onChange={handleChangeInput} 
              placeholder="Username" 
            />
          </div>
          <div className="input">
            <img src={emailImg} alt="Email" />
            <input 
              type="email" 
              name="email" 
              value={dataForm.email} 
              onChange={handleChangeInput} 
              placeholder="Email" 
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
            />
          </div>
        </div>
        <button className="submit" type="submit">Sign Up</button>
        <div className="social">
          <LoginWithGoogle/>    
        </div>
      </form>
    </div>
  );
};

export default SignUp;