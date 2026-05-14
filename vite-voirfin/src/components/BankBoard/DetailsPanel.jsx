import { useState } from 'react'
import { useBanks } from '../../context/BankContext'
import '../../pages/Dashboard/Dashboard.css'

const fmt = n => '$' + Math.round(n).toLocaleString('es-CO')

// Mapeo para mostrar los nombres en español en la interfaz
const typeLabels = {
  income: 'ingreso',
  expense: 'gasto',
  loan: 'prestamo'
}

const TransactionForm = ({ type, bankId, onCancel, editData = null }) => {
  const { addTransaction, editTransaction } = useBanks()
  const [amount, setAmount] = useState(editData ? Math.abs(editData.amount) : '')
  const [reason, setReason] = useState(editData ? editData.reason : '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount) return
    
    if (editData) {
      editTransaction(bankId, editData.id, amount, reason)
    } else {
      addTransaction(bankId, type, amount, reason)
    }
    onCancel()
  }

  return (
    <div className="transaction-form-container" onClick={e => e.stopPropagation()}>
      {/* Aquí se traduce el título del formulario */}
      <h4>{editData ? 'Editar' : 'Registrar'} {typeLabels[type].toUpperCase()}</h4>
      <div className="form-group">
        <input type="number" placeholder="Monto ($)" value={amount} onChange={e => setAmount(e.target.value)}autoFocus/>
        <input type="text" placeholder="Descripción (ej: Pago de nómina...)" value={reason} onChange={e => setReason(e.target.value)}/>
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button className="btn-confirm" onClick={handleSubmit}>
          {editData ? 'Guardar' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}

const TransactionList = ({ type, bank, onClose }) => {
  const { deleteTransaction } = useBanks()
  const [editingItem, setEditingItem] = useState(null)

  const filteredList = bank.transactions?.filter(t => t.type === type) || []

  if (editingItem) {
    return (
      <TransactionForm 
        type={type}
        bankId={bank.id}
        editData={editingItem}
        onCancel={() => setEditingItem(null)}
      />
    )
  }

  return (
    <div className="panel-body">
      <div className="panel-header">
        {/* Aquí se traduce el título del Historial */}
        <h4 style={{fontSize: '20px'}}>HISTORIAL: {typeLabels[type].toUpperCase()}</h4>
      </div>
      
      {filteredList.length === 0 ? (
        <p style={{textAlign: 'center', padding: '20px'}}>No hay registros todavía.</p>
      ) : (
        filteredList.map(item => (
          <div key={item.id} className="entry-block">
            <div className="entry-info">
              <span className="entry-amount">{fmt(item.amount)}</span>
              <span className="entry-label">{item.reason}</span>
              <small style={{opacity: 0.6}}>{new Date(item.date).toLocaleDateString()}</small>
            </div>
            <div className="entry-controls">
                <button className="btn-view" onClick={() => setEditingItem(item)}>✏️</button>
                <button className="btn-remove" style={{minWidth: '40px', padding: '5px 10px'}}onClick={() => window.confirm('¿Eliminar registro?') && deleteTransaction(bank.id, item.id)}>
                  🗑️
                </button>
            </div>
          </div>
        ))
      )}
      <button className="btn-return" style={{marginTop: '10px'}} onClick={onClose}>Volver</button>
    </div>
  )
}

const DetailPanel = () => {
  const { selectedBank, getBalance } = useBanks()
  const [activeAction, setActiveAction] = useState(null)
  const [viewDetails, setViewDetails] = useState(null)

  if (!selectedBank) return null

  return (
    <div className="detail-panel">
      <div className="panel-header">
        <h3>{selectedBank.name}:</h3>
        <span style={{marginLeft: 'auto', fontWeight: 'bold'}}>{fmt(getBalance(selectedBank))}</span>
      </div>

      <div className="panel-body">
        <div className="entry-block">
          <div className="entry-info">
            <span className="entry-label">INGRESOS</span>
            <span className="entry-amount">{fmt(selectedBank.income)}</span>
          </div>
          <button className="btn-view" onClick={() => setViewDetails('income')}>👁️</button>
        </div>

        <div className="entry-block">
          <div className="entry-info">
            <span className="entry-label">GASTOS</span>
            <span className="entry-amount">{fmt(selectedBank.expense)}</span>
          </div>
          <button className="btn-view" onClick={() => setViewDetails('expense')}>👁️</button>
        </div>

        <div className="entry-block">
          <div className="entry-info">
            <span className="entry-label">PRÉSTAMOS</span>
            <span className="entry-amount">{fmt(selectedBank.loan)}</span>
          </div>
          <button className="btn-view" onClick={() => setViewDetails('loan')}>👁️</button>
        </div>
      </div>


      <div style={{marginTop: '20px'}}>
        {viewDetails ? (
          <TransactionList 
            type={viewDetails} 
            bank={selectedBank} 
            onClose={() => setViewDetails(null)} 
          />
        ) : activeAction ? (
          <TransactionForm 
            type={activeAction} 
            bankId={selectedBank.id} 
            onCancel={() => setActiveAction(null)} 
          />
        ) : (
          <div className="action-buttons-grid">
            <button className="action-btn income" onClick={() => setActiveAction('income')}>
                <span>+</span> Registrar Ingreso
            </button>
            <button className="action-btn expense" onClick={() => setActiveAction('expense')}>
                <span>-</span> Registrar Gasto
            </button>
            <button className="action-btn loan" onClick={() => setActiveAction('loan')}>
                <span>🤝</span> Registrar Préstamo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailPanel;