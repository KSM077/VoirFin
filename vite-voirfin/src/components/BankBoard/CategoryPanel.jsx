import { useBanks } from '../../context/BankContext'

const CategoryPanel = ({ onAddClick, onClose }) => {
    const { categories, banks, totalBalance } = useBanks()
    
    
    const getCategoryTotal = (catId) => {
        return banks.reduce((acc, bank) => {
            const sum = bank.transactions
                .filter(t => t.categoryId === catId)
                .reduce((s, t) => s + t.amount, 0)
            return acc + sum
        }, 0)
    }

    const totalSpent = categories.reduce((acc, cat) => acc + getCategoryTotal(cat.id), 0)
    const freeBalance = totalBalance - totalSpent

    return (
        <div className="modal-category" style={{flexDirection: 'column', height: 'auto'}}>
            <button className="btn-close" onClick={onClose} style={{alignSelf: 'flex-end'}}>✕</button>
            
            <h2 style={{textAlign: 'center', fontSize: '1.2rem'}}>Lista de categorías en las que realizaste tus gastos</h2>
            
            <div className="panel-body" style={{margin: '20px 0'}}>
                {categories.map(cat => (
                    <div key={cat.id} className="entry-block" style={{background: 'white', marginBottom: '10px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <span style={{fontSize: '1.5rem'}}>{cat.icon}</span>
                            <span className="entry-label">{cat.name}</span>
                        </div>
                        <span className="entry-amount">${getCategoryTotal(cat.id).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div className="totalBalance" style={{height: '80px', width: '100%', marginTop: '10px', background: '#e8f5e9'}}>
                <span className="entry-label">SALDO LIBRE:</span>
                <span className="entry-amount" style={{color: '#2e7d32'}}>${freeBalance.toLocaleString()}</span>
            </div>

            <button className="btn-add-category" style={{marginTop: '20px', width: '100%'}} onClick={onAddClick}>
                Agregar nueva categoria
            </button>
        </div>
    )
}

export default CategoryPanel;