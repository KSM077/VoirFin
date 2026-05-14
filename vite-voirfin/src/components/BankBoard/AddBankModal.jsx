import { useState } from 'react'
import { useBanks } from '../../context/BankContext'
import { COLOMBIAN_BANKS } from '../../constants/Banks'
import '../../pages/Dashboard/Dashboard.css'

const AddBankModal = ({ onClose }) => {
    const { addBank } = useBanks()
    
    const [selectedBankIndex, setSelectedBankIndex] = useState(0)

    const handleCreate = () => {
        const bank = COLOMBIAN_BANKS[selectedBankIndex]
        addBank(bank.name, bank.color)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h3>Nueva entidad</h3>
                <div className="modal-form">
                    <label>Selecciona tu entidad financiera:</label>
                    
                    <select className="bank-select"value={selectedBankIndex}onChange={(e) => setSelectedBankIndex(e.target.value)}>
                        {COLOMBIAN_BANKS.map((bank, index) => (
                            <option key={bank.name} value={index}>
                                {bank.name}
                            </option>
                        ))}
                    </select>

                    <div className="bank-preview-container">
                        <span>Vista previa:</span>
                        <div className="bank-chip preview" style={{backgroundColor: COLOMBIAN_BANKS[selectedBankIndex].color, color: COLOMBIAN_BANKS[selectedBankIndex].textColor, marginTop: '10px'}}>
                            {COLOMBIAN_BANKS[selectedBankIndex].name}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button className="btn-create" onClick={handleCreate}>Agregar Entidad</button>
                </div>
            </div>
        </div>
    )
}

export default AddBankModal;