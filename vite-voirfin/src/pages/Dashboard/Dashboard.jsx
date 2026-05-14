import { useState } from 'react'
import TotalBalanceCard from '../../components/BankBoard/TotalBalanceCard'
import BankSelector from '../../components/BankBoard/BankSelectors'
import DetailPanel from '../../components/BankBoard/DetailsPanel'
import BackgroundChart from '../../components/BankBoard/BackgroundChart'
import AddBankModal from '../../components/BankBoard/AddBankModal'
import CategoryForm from '../../components/BankBoard/CategoryForm'
import CategoryPanel from '../../components/BankBoard/CategoryPanel'
import ExpenseChart from '../../components/BankBoard/ExpenseChart'
import { useBanks } from '../../context/BankContext'
import './Dashboard.css'

const Dashboard = () => {
    const { banks, selectedBank, deleteBank } = useBanks()
    const [showModal, setShowModal] = useState(false)
    const [view, setView] = useState('main'); 

    const handleDelete = () => {
        if (!selectedBank) {
            alert("Por favor selecciona un banco primero para eliminarlo.");
            return;
        }
        if (window.confirm(`¿Estás seguro de eliminar ${selectedBank.name}?`)) {
            deleteBank(selectedBank.id);
        }
    }

   return (
        <div className="main-container">
            <div className="dash-container">
                <div className="total-balance">
                    <TotalBalanceCard />
                </div>

                <div className="bank-cards">
                    {banks.map(bank => (
                        <BankSelector key={bank.id} bank={bank} />
                    ))}
                    
                    <button className="bank-chip category-chip" onClick={() => setView('categories')}>
                        📁 Categorías
                    </button>

                    <button className="add-bank-btn" onClick={() => setShowModal(!showModal)}>
                        + Agregar entidad
                    </button> 
                    
                    <button className="delete-bank-btn" onClick={handleDelete}>
                        🗑️ Eliminar cuenta
                    </button>
                </div>

                {view === 'categories' ? (
                    <CategoryPanel 
                        onAddClick={() => setView('add-category')} 
                        onClose={() => setView('main')} 
                    />
                ) : view === 'add-category' ? (
                    <CategoryForm onBack={() => setView('categories')} />
                ) : (
                    <DetailPanel />
                )}
            </div>

                <ExpenseChart />

            {showModal && <AddBankModal onClose={() => setShowModal(false)} />}
        </div>
    )
}

export default Dashboard;