import { useBanks } from '../../context/BankContext'
import '../../pages/Dashboard/Dashboard.css'

const fmt = n => '$' + Math.round(n).toLocaleString('es-CO')

const TotalBalanceCard = () => {
  const { totalBalance } = useBanks()

  return (
    <div className="totalBalance">
      <h1>Balance total:</h1>
      <h1>{fmt(totalBalance)}</h1>
    </div>
  )
}

export default TotalBalanceCard