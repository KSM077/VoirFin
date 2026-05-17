import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../components/Firebase/FirebaseService";

const API_URL = import.meta.env.VITE_API_URL;

const BankContext = createContext(null);

export function BankProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [banks, setBanks]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [selectedBank, setSelectedBank]   = useState(null); 
  const [categories, setCategories]       = useState([]); 


  const sanitizeBank = (bank) => ({
    ...bank,
    income:       Number(bank.income       ?? 0),
    expense:      Number(bank.expense      ?? 0),
    loan:         Number(bank.loan         ?? 0),
    transactions: bank.transactions        ?? [],
  });

  const getBalance = useCallback((bank) => {
    if (!bank) return 0;
    return (
      Number(bank.income  ?? 0) -
      Number(bank.expense ?? 0) -
      Number(bank.loan    ?? 0)
    );
  }, []);


  const totalBalance = useMemo(
    () => banks.reduce((sum, b) => sum + getBalance(b), 0),
    [banks, getBalance]
  );


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchBanks(firebaseUser.uid);
      } else {
        setUser(null);
        setBanks([]);
        setSelectedBank(null);
        setCategories([]);
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
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data      = await res.json();
      const sanitized = data.map(sanitizeBank);
      setBanks(sanitized);
      setSelectedBank((prev) =>
        prev ? (sanitized.find((b) => b.id === prev.id) ?? null) : null
      );
    } catch (err) {
      console.error("[BankContext] fetchBanks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBank = useCallback(async (name, color) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ firebaseUid: user.uid, name, color }),
    });
    if (!res.ok) throw new Error("No se pudo crear el banco");
    const newBank   = await res.json();
    const sanitized = sanitizeBank(newBank);
    setBanks((prev) => [...prev, sanitized]);
    return sanitized;
  }, [user]);

  const deleteBank = useCallback(async (bankId) => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/banks/${bankId}?uid=${user.uid}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el banco");
    setBanks((prev) => prev.filter((b) => b.id !== bankId));
    setSelectedBank((prev) => (prev?.id === bankId ? null : prev));
  }, [user]);


  const viewTransactions = useCallback(async (bankId) => {
    if (!user) return [];
    try {
      const res = await fetch(
        `${API_URL}/api/banks/${bankId}/transactions?uid=${user.uid}`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const transactions = await res.json();
      return transactions.map((tx) => ({
        id:          tx.id,
        description: tx.reason     || "Sin descripción",
        amount:      Number(tx.amount ?? 0),
        date:        tx.date        || new Date().toISOString(),
        type:        tx.type,
        categoryId:  tx.categoryId  || null,
      }));
    } catch (err) {
      console.error("[BankContext] viewTransactions:", err);
      return [];
    }
  }, [user]);


  const addTransaction = useCallback(
    async (bankId, type, amount, reason, categoryId = null) => {
      if (!user) return;
      const res = await fetch(`${API_URL}/api/banks/${bankId}/transactions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          firebaseUid: user.uid,
          type,
          amount,
          reason,
          categoryId,
        }),
      });
      if (!res.ok) throw new Error("No se pudo agregar la transacción");
      const updatedBank = await res.json();
      const sanitized   = sanitizeBank(updatedBank);
      setBanks((prev) => prev.map((b) => (b.id === bankId ? sanitized : b)));
      setSelectedBank((prev) => (prev?.id === bankId ? sanitized : prev));
      return sanitized;
    },
    [user]
  );


  const editTransaction = useCallback(
    async (bankId, txId, amount, reason) => {
      if (!user) return;
      const res = await fetch(
        `${API_URL}/api/banks/${bankId}/transactions/${txId}`,
        {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ firebaseUid: user.uid, amount, reason }),
        }
      );
      if (!res.ok) throw new Error("No se pudo editar la transacción");
      const updatedBank = await res.json();
      const sanitized   = sanitizeBank(updatedBank);
      setBanks((prev) => prev.map((b) => (b.id === bankId ? sanitized : b)));
      setSelectedBank((prev) => (prev?.id === bankId ? sanitized : prev));
      return sanitized;
    },
    [user]
  );


  const deleteTransaction = useCallback(async (bankId, txId) => {
    if (!user) return;
    const res = await fetch(
      `${API_URL}/api/banks/${bankId}/transactions/${txId}?uid=${user.uid}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("No se pudo eliminar la transacción");
    const updatedBank = await res.json();
    const sanitized   = sanitizeBank(updatedBank);
    setBanks((prev) => prev.map((b) => (b.id === bankId ? sanitized : b)));
    setSelectedBank((prev) => (prev?.id === bankId ? sanitized : prev));
    return sanitized;
  }, [user]);

  const addCategory = useCallback((name, icon, bankId) => {
    const newCat = {
      id:     crypto.randomUUID(),
      name,
      icon,
      bankId: bankId || null,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const logout = useCallback(async () => {
    setBanks([]);
    setUser(null);
    setSelectedBank(null);
    setCategories([]);
    setLoading(false);
    await firebaseSignOut(auth);
  }, []);

  const value = {
    user, banks, loading, error,
    selectedBank, setSelectedBank, 
    totalBalance, getBalance,       
    categories, addCategory,       
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