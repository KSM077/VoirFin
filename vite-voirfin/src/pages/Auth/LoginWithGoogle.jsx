import google from '../../../public/google.jpg'
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db, API_URL } from "../../components/Firebase/FirebaseService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LoginWithGoogle = () => {
  const navigate = useNavigate();

  const handleClickLoginGoogle = async() => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const userData = {
      firebaseUid: userCredential.user.uid,
      username: userCredential.user.displayName || userCredential.user.email.split("@")[0],
      email: userCredential.user.email,
      avatar: userCredential.user.photoURL || "default.png",
    };

    const userRef = doc(db, "users", userCredential.user.uid);
    const userDb = await getDoc(userRef);
    if (!userDb.exists()) {
      await setDoc(userRef, userData);
    }

    console.log("Intentando sincronizar con el backend en:", `${API_URL}/api/users/sync`);

    const response = await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      console.log("Sincronización exitosa");
      navigate("/dashboard");
    } else {
      console.error("El backend respondió con error:", response.status);
    }

  } catch (error) {
    console.error("Error completo en el proceso:", error);
    alert("Hubo un problema al conectar con el servidor. Revisa la consola.");
  }
  };

    return (
        <div className="login-with-google">
            <p>-- Or continue with --</p>
            <div className="google-login-card" onClick={handleClickLoginGoogle}>
                <img src={google} alt="google-icon" />
            </div>
        </div>
    )

};

export default LoginWithGoogle;