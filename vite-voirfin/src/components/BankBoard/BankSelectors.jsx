import { useBanks } from '../../context/BankContext'

const BankSelector = ({ bank }) => {
  const { selectedBank, setSelectedBank } = useBanks()
  const isActive = selectedBank?.id === bank.id

  return (
    <div className="chips-container">
        <button onClick={() => setSelectedBank(isActive ? null : bank)} style={{ backgroundColor: bank.color }} className={`bank-chip ${isActive ? 'active' : ''}`}>
            {bank.name}
        </button>
    </div>
  )
}

export default BankSelector;