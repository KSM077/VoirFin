import { createContext, useContext, useState, useEffect } from 'react'
import { auth, API_URL } from '../components/Firebase/FirebaseService'
import { onAuthStateChanged } from 'firebase/auth'

const BankContext = createContext()

export const BankProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)

    // Categorías siguen siendo locales (no requieren sync de DB)
    const [categories, setCategories] = useState([
        { id: '1', name: 'Hogar', icon: '🏠', bankId: null },
        { id: '2', name: 'Comida', icon: '🍔', bankId: null }
    ])

    // ── Hydration: carga bancos desde el backend al autenticarse ──────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                try {
                    const res = await fetch(
                        `${API_URL}/api/banks?uid=${currentUser.uid}`
                    )
                    if (res.ok) {
                        const data = await res.json()
                        // Normaliza la forma del JSON del backend al shape del frontend
                        setBanks(data.map(normalizeBankFromServer))
                    }
                } catch (err) {
                    console.error('[VoirFin] Error cargando bancos:', err)
                }
            } else {
                // Limpieza total al cerrar sesión
                setUser(null)
                setBanks([])
                setSelectedBank(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // ── Helpers de normalización ──────────────────────────────────────────────
    // Convierte la respuesta del backend al formato que usa el frontend
    const normalizeBankFromServer = (bank) => ({
        id: bank.id,
        name: bank.name,
        color: bank.color,
        income: bank.income ?? 0,
        expense: bank.expense ?? 0,
        loan: bank.loan ?? 0,
        transactions: (bank.transactions ?? []).map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            reason: t.reason,
            categoryId: t.categoryId,
            date: t.date
        }))
    })

    // ── Calculos derivados (sin cambios) ──────────────────────────────────────
    const getBalance = (bank) => bank.income - bank.expense + bank.loan
    const totalBalance = banks.reduce((sum, b) => sum + getBalance(b), 0)

    const getTotalCategorized = () =>
        banks.reduce((acc, bank) => {
            const catSum = bank.transactions
                .filter(t => t.type === 'expense' && t.categoryId)
                .reduce((s, t) => s + t.amount, 0)
            return acc + catSum
        }, 0)

    const freeBalance = totalBalance - getTotalCategorized()

    // ── Categorías (locales, sin cambio de flujo) ─────────────────────────────
    const addCategory = (name, icon, bankId) => {
        const newCat = { id: crypto.randomUUID(), name, icon, bankId }
        setCategories(prev => [...prev, newCat])
    }

    // ── Bank CRUD ─────────────────────────────────────────────────────────────
    const addBank = async (name, color) => {
        try {
            const res = await fetch(`${API_URL}/api/banks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseUid: user.uid, name, color })
            })
            if (res.ok) {
                const newBank = normalizeBankFromServer(await res.json())
                setBanks(prev => [...prev, newBank])
            }
        } catch (err) {
            console.error('[VoirFin] Error creando banco:', err)
        }
    }

    const deleteBank = async (bankId) => {
        try {
            const res = await fetch(
                `${API_URL}/api/banks/${bankId}?uid=${user.uid}`,
                { method: 'DELETE' }
            )
            if (res.ok || res.status === 204) {
                setBanks(prev => prev.filter(b => b.id !== bankId))
                if (selectedBank?.id === bankId) setSelectedBank(null)
            }
        } catch (err) {
            console.error('[VoirFin] Error eliminando banco:', err)
        }
    }

    // ── Transaction CRUD ──────────────────────────────────────────────────────
    const addTransaction = async (bankId, type, amount, reason, categoryId = null) => {
        const parsed = parseFloat(amount)
        if (isNaN(parsed)) return

        try {
            const res = await fetch(`${API_URL}/api/banks/${bankId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    type,
                    amount: parsed,
                    reason: reason || 'Sin descripción',
                    categoryId
                })
            })
            if (res.ok) {
                const updatedBank = normalizeBankFromServer(await res.json())
                setBanks(prev => prev.map(b => b.id === bankId ? updatedBank : b))
                // Sincroniza el banco seleccionado si está activo
                if (selectedBank?.id === bankId) setSelectedBank(updatedBank)
            }
        } catch (err) {
            console.error('[VoirFin] Error añadiendo transacción:', err)
        }
    }

    const deleteTransaction = async (bankId, transactionId) => {
        try {
            const res = await fetch(
                `${API_URL}/api/banks/${bankId}/transactions/${transactionId}?uid=${user.uid}`,
                { method: 'DELETE' }
            )
            if (res.ok) {
                const updatedBank = normalizeBankFromServer(await res.json())
                setBanks(prev => prev.map(b => b.id === bankId ? updatedBank : b))
                if (selectedBank?.id === bankId) setSelectedBank(updatedBank)
            }
        } catch (err) {
            console.error('[VoirFin] Error eliminando transacción:', err)
        }
    }

    const editTransaction = async (bankId, transactionId, newAmount, newReason) => {
        const parsedNew = parseFloat(newAmount)
        if (isNaN(parsedNew)) return

        try {
            const res = await fetch(
                `${API_URL}/api/banks/${bankId}/transactions/${transactionId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firebaseUid: user.uid,
                        amount: parsedNew,
                        reason: newReason
                    })
                }
            )
            if (res.ok) {
                const updatedBank = normalizeBankFromServer(await res.json())
                setBanks(prev => prev.map(b => b.id === bankId ? updatedBank : b))
                if (selectedBank?.id === bankId) setSelectedBank(updatedBank)
            }
        } catch (err) {
            console.error('[VoirFin] Error editando transacción:', err)
        }
    }

    if (loading) return null

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