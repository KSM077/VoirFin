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
    if (!userCredential.user) throw new Error("Error al loguear con google");
    
    const userRef = doc(db, "users", userCredential.user.uid);
    const userDb = await getDoc(userRef);
    
    const userData = {
      firebaseUid: userCredential.user.uid,
      username: userCredential.user.displayName || userCredential.user.email.split("@")[0],
      email: userCredential.user.email,
      avatar: userCredential.user.photoURL || "default.png",
    };

    if (!userDb.exists()) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
      });
    }

    // CONEXIÓN AL BACKEND (POSTGRES)
    await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    navigate("/dashboard");
  } catch (error) {
    console.log(error);
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