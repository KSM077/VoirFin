import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from "../components/Firebase/FirebaseService";
import { onAuthStateChanged } from "firebase/auth"

const BankContext = createContext()

export const BankProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [categories, setCategories] = useState([
        { id: '1', name: 'Hogar', icon: '🏠', bankId: null },
        { id: '2', name: 'Comida', icon: '🍔', bankId: null }
    ]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const userUid = currentUser.uid;
                const savedBanks = localStorage.getItem(`voirfin_banks_${userUid}`);
                const savedCategories = localStorage.getItem(`voirfin_categories_${userUid}`);

                setBanks(savedBanks ? JSON.parse(savedBanks) : []);
                setCategories(savedCategories ? JSON.parse(savedCategories) : [
                    { id: '1', name: 'Hogar', icon: '🏠', bankId: null },
                    { id: '2', name: 'Comida', icon: '🍔', bankId: null }
                ]);
                setUser(currentUser);
            } else {
                setBanks([]);
                setCategories([]);
                setSelectedBank(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`voirfin_banks_${user.uid}`, JSON.stringify(banks));
        }
    }, [banks, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`voirfin_categories_${user.uid}`, JSON.stringify(categories));
        }
    }, [categories, user]);


    const getBalance = (bank) => bank.income - bank.expense + bank.loan
    const totalBalance = banks.reduce((sum, b) => sum + getBalance(b), 0)

    const getTotalCategorized = () => {
        return banks.reduce((acc, bank) => {
            const catSum = bank.transactions
                .filter(t => t.type === 'expense' && t.categoryId)
                .reduce((s, t) => s + t.amount, 0)
            return acc + catSum
        }, 0)
    }

    const freeBalance = totalBalance - getTotalCategorized()


    const addCategory = (name, icon, bankId) => {
        const newCat = { id: crypto.randomUUID(), name, icon, bankId }
        setCategories(prev => [...prev, newCat])
    }

    const addBank = (name, color) => {
        const newBank = {
            id: crypto.randomUUID(),
            name,
            color,
            income: 0,
            expense: 0,
            loan: 0,
            transactions: []
        }
        setBanks(prev => [...prev, newBank])
    }

    const deleteBank = (bankId) => {
        setBanks(prev => prev.filter(bank => bank.id !== bankId))
        if (selectedBank && selectedBank.id === bankId) {
            setSelectedBank(null)
        }
    }

    const addTransaction = (bankId, type, amount, reason, categoryId = null) => {
        const parsed = parseFloat(amount)
        if (isNaN(parsed)) return

        const newTransaction = {
            id: crypto.randomUUID(),
            type,
            amount: parsed,
            reason: reason || 'Sin descripción',
            categoryId, 
            date: new Date().toISOString()
        }

        setBanks(prev => prev.map(b => {
            if (b.id !== bankId) return b
            return {
                ...b,
                [type]: b[type] + parsed,
                transactions: [newTransaction, ...b.transactions]
            }
        }))
    }

    const deleteTransaction = (bankId, transactionId) => {
        setBanks(prev => prev.map(b => {
            if (b.id !== bankId) return b
            const transaction = b.transactions.find(t => t.id === transactionId)
            if (!transaction) return b
            return {
                ...b,
                [transaction.type]: Math.max(0, b[transaction.type] - transaction.amount),
                transactions: b.transactions.filter(t => t.id !== transactionId)
            }
        }))
    }

    const editTransaction = (bankId, transactionId, newAmount, newReason) => {
        const parsedNew = parseFloat(newAmount)
        if (isNaN(parsedNew)) return
        setBanks(prev => prev.map(b => {
            if (b.id !== bankId) return b
            const transactions = b.transactions.map(t => {
                if (t.id !== transactionId) return t
                const diff = parsedNew - t.amount
                b[t.type] = Math.max(0, b[t.type] + diff)
                return { ...t, amount: parsedNew, reason: newReason }
            })
            return { ...b, transactions }
        }))
    }


    if (loading) return null;

    return (
        <BankContext.Provider value={{
            banks, selectedBank, setSelectedBank,
            categories, addCategory, 
            addBank, addTransaction, deleteBank, deleteTransaction, editTransaction,
            getBalance, totalBalance, freeBalance 
        }}>
            {children}
        </BankContext.Provider>
    )
}

export const useBanks = () => useContext(BankContext)