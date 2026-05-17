import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../components/Firebase/FirebaseService"; 

const API_URL = import.meta.env.VITE_API_URL; // 


const BankContext = createContext(null);

export function BankProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [banks, setBanks]       = useState([]);
  const [loading, setLoading]   = useState(true);  
  const [error, setError]       = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchBanks(firebaseUser.uid);
      } else {
        setUser(null);
        setBanks([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBanks = useCallback(async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/banks?uid=${uid}`);
      if (!res.ok) throw new Error(`Error ${res.status}: no se pudieron cargar los bancos`);
      const data = await res.json();
      setBanks(data);
    } catch (err) {
      console.error("[BankContext] fetchBanks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);


  const createBank = useCallback(async ({ name, color }) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid: user.uid, name, color }),
    });
    if (!res.ok) throw new Error("No se pudo crear el banco");
    const newBank = await res.json();
    setBanks((prev) => [...prev, newBank]);
    return newBank;
  }, [user]);


  const deleteBank = useCallback(async (bankId) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks/${bankId}?uid=${user.uid}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el banco");
    setBanks((prev) => prev.filter((b) => b.id !== bankId));
  }, [user]);


  const viewTransactions = useCallback(async (bankId) => {
    if (!user) return [];
    try {
      const res = await fetch(
        `${API_URL}/api/banks/${bankId}/transactions?uid=${user.uid}`
      );
      if (!res.ok) throw new Error(`Error ${res.status} al obtener transacciones`);
      const transactions = await res.json();


      return transactions.map((tx) => ({
        id:          tx.id,
        description: tx.reason ?? tx.description ?? "Sin descripción",
        amount:      tx.amount,
        date:        tx.date ?? tx.createdAt,
        type:        tx.type,
        categoryId:  tx.categoryId ?? null,
      }));
    } catch (err) {
      console.error("[BankContext] viewTransactions:", err);
      return [];
    }
  }, [user]);


  const addTransaction = useCallback(async (bankId, { type, amount, reason, categoryId }) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks/${bankId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUid: user.uid,
        type,
        amount,
        reason,
        categoryId: categoryId ?? null,
      }),
    });
    if (!res.ok) throw new Error("No se pudo agregar la transacción");
    const updatedBank = await res.json();
    setBanks((prev) => prev.map((b) => (b.id === bankId ? updatedBank : b)));
    return updatedBank;
  }, [user]);

  const editTransaction = useCallback(async (bankId, txId, { amount, reason }) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks/${bankId}/transactions/${txId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid: user.uid, amount, reason }),
    });
    if (!res.ok) throw new Error("No se pudo editar la transacción");
    const updatedBank = await res.json();
    setBanks((prev) => prev.map((b) => (b.id === bankId ? updatedBank : b)));
    return updatedBank;
  }, [user]);

  const deleteTransaction = useCallback(async (bankId, txId) => {
    if (!user) return;
    const res = await fetch(
      `${API_URL}/api/banks/${bankId}/transactions/${txId}?uid=${user.uid}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("No se pudo eliminar la transacción");
    const updatedBank = await res.json();
    setBanks((prev) => prev.map((b) => (b.id === bankId ? updatedBank : b)));
    return updatedBank;
  }, [user]);


  const logout = useCallback(async () => {
    setBanks([]);
    setUser(null);
    setError(null);
    await firebaseSignOut(auth);
  }, []);


  const value = {
    user,
    banks,
    loading,
    error,
    fetchBanks,
    createBank,
    deleteBank,
    viewTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    logout,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}


export function useBanks() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBanks debe usarse dentro de <BankProvider>");
  return ctx;
}