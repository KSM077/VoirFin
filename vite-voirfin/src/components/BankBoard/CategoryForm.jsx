import { useState } from 'react'
import { useBanks } from '../../context/BankContext'

const CategoryForm = ({ onBack }) => {
    const { banks, addCategory } = useBanks()
    const [name, setName] = useState('')
    const [selectedBank, setSelectedBank] = useState('')
    const [selectedIcon, setSelectedIcon] = useState('📁')

    const icons = ['🏠', '🚗', '🍔', '👕', '🎬', '🛒', '💡', '🏥']

    const handleSave = () => {
        if (!name) return
        addCategory(name, selectedIcon, selectedBank)
        onBack()
    }

    return (
        <div className="modal-formu" style={{ flexDirection: 'column', padding: '30px' }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <div className="form-group">
                        <label>Nombre de categoria</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Cuenta asociada</label>
                        <select className="bank-select" style={{ width: '450px' }} onChange={e => setSelectedBank(e.target.value)}>
                            <option value="">Seleccionar banco...</option>
                            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginLeft: '0px' }}>
                    <label>Imagen</label>
                    <div className="color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', top: '-100px' }}>
                        {icons.map(icon => (
                            <button key={icon} onClick={() => setSelectedIcon(icon)} style={{ fontSize: '1.5rem', background: selectedIcon === icon ? '#ddd' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-actions" style={{ position: 'static', marginTop: '40px', width: '100%' }}>
                <button className="btn-confirm" style={{ marginTop: '-135px' }} onClick={handleSave}>Guardar Categoría</button>
                <button className="btn-remove" onClick={onBack}>Cancelar</button>
            </div>
        </div>
    )
}

export default CategoryForm;