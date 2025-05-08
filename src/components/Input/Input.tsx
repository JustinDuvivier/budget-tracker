import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Input.css';

interface Expense {
  name: string;
  amount: string;
  dueDate: string;
  category: string;
}

interface Debt {
  name: string;
  balance: string;
  apr: string;
  monthlyPayment: string;
}

const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Personal Care',
  'Other'
];

const Input: React.FC = () => {
  const navigate = useNavigate();
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([{ name: '', amount: '', dueDate: '', category: '' }]);
  const [debts, setDebts] = useState<Debt[]>([{ name: '', balance: '', apr: '', monthlyPayment: '' }]);
  const [savingsGoal, setSavingsGoal] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: '', dueDate: '', category: '' }]);
  };

  const addDebt = () => {
    setDebts([...debts, { name: '', balance: '', apr: '', monthlyPayment: '' }]);
  };

  const updateExpense = (index: number, field: keyof Expense, value: string) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const updateDebt = (index: number, field: keyof Debt, value: string) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    setDebts(newDebts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      monthlyIncome: Number(monthlyIncome),
      expenses: expenses.map(exp => ({ ...exp, amount: Number(exp.amount) })),
      debts: debts.map(debt => ({ ...debt, balance: Number(debt.balance), apr: Number(debt.apr), monthlyPayment: Number(debt.monthlyPayment) })),
      savingsGoal: Number(savingsGoal)
    };
    localStorage.setItem('budgetData', JSON.stringify(data));
    localStorage.setItem('userName', userName);
    navigate('/dashboard');
  };

  return (
    <div className="input-container">
      <h2>Enter Your Budget Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label htmlFor="userName" className="input-name-label" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, display: 'block' }}>Name</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Enter your name"
            required
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className="form-section">
          <h3>Monthly Income</h3>
          <input
            type="number"
            value={monthlyIncome}
            onChange={e => setMonthlyIncome(e.target.value)}
            placeholder="$0"
            required
          />
        </div>

        <div className="form-section">
          <h3>Savings Goal</h3>
          <input
            type="number"
            value={savingsGoal}
            onChange={e => setSavingsGoal(e.target.value)}
            placeholder="$0"
            min={0}
            required
          />
        </div>

        <div className="form-section">
          <h3>Expenses</h3>
          {expenses.map((expense, index) => (
            <div key={index} className="expense-item">
              <input
                type="text"
                value={expense.name}
                onChange={(e) => updateExpense(index, 'name', e.target.value)}
                placeholder="Expense name"
                required
              />
              <select
                value={expense.category}
                onChange={(e) => updateExpense(index, 'category', e.target.value)}
                required
                className="category-select"
              >
                <option value="">Category</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={expense.amount}
                onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                placeholder="$0"
                required
              />
              <input
                type="date"
                value={expense.dueDate}
                onChange={(e) => updateExpense(index, 'dueDate', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addExpense} className="add-button">
            + Add another expense
          </button>
        </div>

        <div className="form-section">
          <h3>Debt Information (Optional)</h3>
          {debts.map((debt, index) => (
            <div key={index} className="debt-item">
              <div className="debt-label">
                <label>Debt Name
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => updateDebt(index, 'name', e.target.value)}
                    placeholder="Debt name"
                  />
                </label>
              </div>
              <div className="debt-label">
                <label>Amount
                  <input
                    type="number"
                    value={debt.balance}
                    onChange={(e) => updateDebt(index, 'balance', e.target.value)}
                    placeholder="$0"
                  />
                </label>
              </div>
              <div className="debt-label">
                <label>APR (%)
                  <input
                    type="number"
                    value={debt.apr}
                    onChange={(e) => updateDebt(index, 'apr', e.target.value)}
                    placeholder="0%"
                  />
                </label>
              </div>
              <div className="debt-label">
                <label>Monthly Payment
                  <input
                    type="number"
                    value={debt.monthlyPayment}
                    onChange={(e) => updateDebt(index, 'monthlyPayment', e.target.value)}
                    placeholder="$0"
                  />
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={addDebt} className="add-button">
            + Add another debt
          </button>
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Input; 