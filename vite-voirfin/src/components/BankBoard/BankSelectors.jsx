import { useBanks } from '../../context/BankContext'

const BankSelector = ({ bank }) => {
  const { selectedBank, selectBankById } = useBanks()
  const isActive = selectedBank?.id === bank.id

  return (
    <div className="chips-container">
        <button onClick={() => selectBankById(isActive ? null : bank.id)} style={{ backgroundColor: bank.color }} className={`bank-chip ${isActive ? 'active' : ''}`}>
            {bank.name}
        </button>
    </div>
  )
}

export default BankSelector;