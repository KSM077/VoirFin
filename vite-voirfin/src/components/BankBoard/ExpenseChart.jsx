import { VictoryPie, VictoryLabel } from 'victory'
import { useBanks } from '../../context/BankContext'
import { BsPieChartFill } from 'react-icons/bs'

const ExpenseChart = () => {
    const { banks } = useBanks();

    const totals = banks.reduce((acc, bank) => {
        acc.income += (bank.income || 0);
        acc.expense += Math.abs(bank.expense || 0);

        const loanValue = bank.loan || 0;
        if (loanValue >= 0) {
            acc.loanReceived += loanValue;
        } else {
            acc.loanGiven += Math.abs(loanValue);
        }
        return acc;
    }, { income: 0, expense: 0, loanReceived: 0, loanGiven: 0 });

    const { income, expense, loanReceived, loanGiven } = totals;

    const totalFlow = income + expense + loanReceived + loanGiven;

    const incomePercent = totalFlow > 0 ? Math.round((income / totalFlow) * 100) : 0;
    const expensePercent = totalFlow > 0 ? Math.round((expense / totalFlow) * 100) : 0;
    const loanRecPercent = totalFlow > 0 ? Math.round((loanReceived / totalFlow) * 100) : 0;
    const loanGivePercent = totalFlow > 0 ? Math.round((loanGiven / totalFlow) * 100) : 0;

    if (totalFlow === 0) {
        return (
                <div className='piechart'>
                    <BsPieChartFill />
                    <h1>No hay datos</h1>
                </div>
        );
    }


    const chartData = [
        { x: "Ingresos", y: incomePercent, color: "#2ecc71" },
        { x: "Gastos", y: expensePercent, color: "#e74c3c" },
        { x: "Deuda (+)", y: loanRecPercent, color: "#3498db" },
        { x: "Prestado (-)", y: loanGivePercent, color: "#f1c40f" }
    ].filter(d => d.y > 0);

    return (
        <div className="bg-zinc-950 p-4 rounded-lg">
            <VictoryPie
                radius={80}
                colorScale={chartData.map(d => d.color)}
                padding={{ top: 20, bottom: 150, left: 50, right: 50 }}
                data={chartData}
                animate={{ duration: 2000 }}
                labels={({ datum }) => `${datum.x}\n${datum.y}%`}
                labelRadius={80}
                labelComponent={
                    <VictoryLabel
                        style={{
                            fill: "black",
                            fontSize: 12,
                            fontWeight: "bold"
                        }}
                    />
                }
            />
        </div>
    );
}

export default ExpenseChart;