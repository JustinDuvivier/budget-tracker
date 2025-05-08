import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Expense {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

interface Debt {
  name: string;
  balance: number;
  apr: number;
  monthlyPayment: number;
}

interface BudgetData {
  monthlyIncome: number;
  expenses: Expense[];
  debts: Debt[];
  savingsGoal?: number;
}

interface DebtModalProps {
  debt: Debt;
  onClose: () => void;
  onUpdate: (updatedDebt: Debt) => void;
}

const DebtModal: React.FC<DebtModalProps> = ({ debt, onClose, onUpdate }) => {
  const [editedDebt, setEditedDebt] = useState<Debt>(debt);

 
  const calculateDebtPayoff = (debt: Debt): string | number => {
    const { balance, monthlyPayment: payment, apr } = debt;
  
    if (payment <= 0)            return 'Invalid payment'; 
    if (balance <= 0)            return 0;                 
    if (payment >= balance)      return 1;                
      if (apr === 0) {
      return Math.ceil(balance / payment);                 
    }
    const monthlyRate = apr / 100 / 12;
      if (payment <= balance * monthlyRate) {
      return 'Payment too low to pay off debt';
    }
    const months =
      Math.log(payment / (payment - balance * monthlyRate)) /
      Math.log(1 + monthlyRate);
  
    return Math.ceil(months);                             
  };

  const payoffTime = calculateDebtPayoff(editedDebt);

  const handleUpdate = () => {
    onUpdate(editedDebt);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit {debt.name}</h3>
        <div className="modal-form">
          <label style={{fontWeight: 500, marginBottom: 4}}>
            Debt Amount
            <input
              type="number"
              value={editedDebt.balance}
              onChange={(e) => setEditedDebt({ ...editedDebt, balance: Number(e.target.value) })}
              placeholder="Balance"
              style={{marginTop: 2}}
            />
          </label>
          <label style={{fontWeight: 500, marginBottom: 4}}>
            APR (%)
            <input
              type="number"
              value={editedDebt.apr}
              onChange={(e) => setEditedDebt({ ...editedDebt, apr: Number(e.target.value) })}
              placeholder="APR (%)"
              style={{marginTop: 2}}
            />
          </label>
          <label style={{fontWeight: 500, marginBottom: 4}}>
            Monthly Payment
            <input
              type="number"
              value={editedDebt.monthlyPayment}
              onChange={(e) => setEditedDebt({ ...editedDebt, monthlyPayment: Number(e.target.value) })}
              placeholder="Monthly Payment"
              style={{marginTop: 2}}
            />
          </label>
        </div>
        <div style={{marginBottom: '1rem', color: '#1976D2', fontWeight: 500}}>
          {payoffTime && typeof payoffTime === 'number' ? (
            <>Estimated Payoff: {payoffTime} months</>
          ) : (
            <>{payoffTime}</>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={handleUpdate} className="update-button">Calculate</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const data = localStorage.getItem('budgetData');
    if (data) {
      setBudgetData(JSON.parse(data));
    }
  }, []);

  if (!budgetData) {
    return <div>Loading...</div>;
  }

  const totalExpenses = budgetData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebtPayments = budgetData.debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const totalBudget = totalExpenses + totalDebtPayments;
  const remainingBalance = budgetData.monthlyIncome - totalBudget;
  const budgetPercentage = (totalBudget / budgetData.monthlyIncome) * 100;

  // Calculate category totals
  const categoryTotals = budgetData.expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: [...Object.keys(categoryTotals), 'Remaining'],
    datasets: [
      {
        data: [...Object.values(categoryTotals), remainingBalance],
        backgroundColor: [
          '#FF6384', // Housing
          '#36A2EB', // Transportation
          '#FFCE56', // Food
          '#4BC0C0', // Utilities
          '#9966FF', // Entertainment
          '#FF9F40', // Healthcare
          '#FF6384', // Shopping
          '#36A2EB', // Education
          '#FFCE56', // Personal Care
          '#4BC0C0', // Other
          '#9966FF', // Remaining
        ],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 20,
          padding: 16,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const upcomingBills = [...budgetData.expenses]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .filter(expense => {
      const dueDate = new Date(expense.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0;
    });

  const handleDebtUpdate = (updatedDebt: Debt) => {
    if (!budgetData) return;
    
    const updatedDebts = budgetData.debts.map(debt => 
      debt.name === updatedDebt.name ? updatedDebt : debt
    );
    
    const newBudgetData = {
      ...budgetData,
      debts: updatedDebts
    };
    
    setBudgetData(newBudgetData);
    localStorage.setItem('budgetData', JSON.stringify(newBudgetData));
  };

  
  const renderCompactCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const bills = budgetData.expenses.filter(expense => {
        const expenseDate = new Date(expense.dueDate);
        return (
          expenseDate.getDate() === day &&
          expenseDate.getMonth() === currentMonth.getMonth() &&
          expenseDate.getFullYear() === currentMonth.getFullYear()
        );
      });
      days.push(
        <div key={day} className="compact-calendar-day">
          <span className="compact-day-number">{day}</span>
          {bills.length > 0 && (
            <span className="bill-dot" title={bills.map(b => `${b.name}: $${b.amount}`).join(', ')}></span>
          )}
        </div>
      );
    }
    return days;
  };

  // Savings Goal logic
  const savingsGoal = budgetData.savingsGoal || 0;
  const savingsProgress = savingsGoal > 0 ? Math.min(remainingBalance / savingsGoal, 1) : 0;
  const savingsPercent = savingsGoal > 0 ? Math.round((remainingBalance / savingsGoal) * 100) : 0;

  // Bill count for notes
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const billsThisMonth = budgetData.expenses.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    return (
      expenseDate.getMonth() === month &&
      expenseDate.getFullYear() === year
    );
  });
  const billsThisWeek = billsThisMonth.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    const diffTime = expenseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  //Budget feedback note
  let budgetNote = '';
  if (totalBudget < budgetData.monthlyIncome) {
    budgetNote = 'You are doing great! You are spending less than you make.';
  } else if (totalBudget === budgetData.monthlyIncome) {
    budgetNote = 'You are spending exactly what you make. Consider saving a bit more!';
  } else {
    budgetNote = 'Caution: You are spending more than you make this month.';
  }

  
  return (
    <div className="dashboard-card-grid">
      <div className="dashboard-card">
        <h3>Budget Overview</h3>
        <div className="budget-overview">
          <div className="budget-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  background: totalBudget > budgetData.monthlyIncome ? '#e53935' : '#4CAF50'
                }}
              ></div>
            </div>
            <div className="budget-stats">
              <div className="stat">
                <span className="stat-label">Monthly Income</span>
                <span className="stat-value">${budgetData.monthlyIncome}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">${totalBudget}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">${remainingBalance}</span>
              </div>
            </div>
          </div>
          <div className="budget-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Expenses</span>
              <span className="breakdown-value">${totalExpenses}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Debt Payments</span>
              <span className="breakdown-value">${totalDebtPayments}</span>
            </div>
          </div>
          <div className="budget-note">{budgetNote}</div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Spending by Category</h3>
        <div className="chart-container" style={{height: '180px'}}>
          <Pie data={chartData} options={chartOptions} />
        </div>
        <div className="category-breakdown">
          <div className="category-list">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <span className="category-amount">${amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Debt Payoff Calculator</h3>
        <div className="debts-list">
          {budgetData.debts.map((debt, index) => (
            <button
              key={index}
              className="debt-list-item"
              onClick={() => setSelectedDebt(debt)}
              title="Click to edit debt details"
              style={{
                width: '100%',
                textAlign: 'left',
                background: '#f7f8fa',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                marginBottom: '0.3rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {debt.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Monthly Bill Calendar</h3>
        <div className="compact-calendar-grid">
          {renderCompactCalendar()}
        </div>
        <div className="calendar-notes">
          <span>📅 You have {billsThisMonth.length} bill{billsThisMonth.length !== 1 ? 's' : ''} this month, {billsThisWeek.length} this week.</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Upcoming Bills</h3>
        <div className="bills-list">
          {upcomingBills.slice(0, 5).map((bill, index) => {
            const dueDate = new Date(bill.dueDate);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return (
              <div 
                key={index} 
                className={`bill-item ${diffDays <= 7 ? 'due-soon' : ''}`}
              >
                <span>{bill.name}</span>
                <span className="bill-category">{bill.category}</span>
                <span>${bill.amount}</span>
                <span>Due in {diffDays} days</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Savings Goal</h3>
        <div className="savings-goal-progress">
          <div className="savings-progress-bar">
            <div
              className="savings-progress-fill"
              style={{
                width: `${
                  budgetData.savingsGoal
                    ? Math.min(
                        ((budgetData.monthlyIncome - totalBudget) / budgetData.savingsGoal) * 100,
                        100
                      )
                    : 0
                }%`
              }}
            ></div>
          </div>
          <div className="savings-goal-stats">
            <div className="savings-goal-amount">
              If budget is followed, you will save <b>${remainingBalance}</b> this month.
            </div>
            <div className="savings-goal-status">
              <b>${remainingBalance}</b> of <b>${budgetData.savingsGoal || 0}</b> (
              {budgetData.savingsGoal
                ? Math.min(
                    Math.round(
                      ((budgetData.monthlyIncome - totalBudget) / budgetData.savingsGoal) * 100
                    ),
                    100
                  )
                : 0}
              % toward your goal)
            </div>
          </div>
        </div>
      </div>

      {selectedDebt && (
        <DebtModal
          debt={selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onUpdate={handleDebtUpdate}
        />
      )}
    </div>
  );
};

export default Dashboard;