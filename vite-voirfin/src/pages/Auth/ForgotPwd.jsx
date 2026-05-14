import { useEffect, useState } from "react";
import { auth } from "../../components/Firebase/FirebaseService";
import { db } from "../../components/Firebase/FirebaseService";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ForgotPassword = () => {
  const [user, setUser] = useState({});

  const getUser = () => {
    //detectamos cambios en el estado de autenticacion
    onAuthStateChanged(auth, async(user) => {
      //si el usuario esta autenticado recuperamos su info con el .uid
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDb = await getDoc(userRef)
        setUser({ id: userDb.id, ...userDb.data() })
      } else {
        // Si el usuario cerro sesion
        setUser(null);
      }
    });
  };
  
  useEffect(() => {
    getUser()
  }, []);

  return (
    <div>
      <h2>Profile</h2>

    </div>
  );
};
export default ForgotPassword;