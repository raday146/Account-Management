import { useState } from 'react';
import './App.css';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { BalancePage } from './pages/BalancePage';
import { BlockAccountPage } from './pages/BlockAccountPage';
import { StatementPage } from './pages/StatementPage';

type Page = 'create' | 'deposit' | 'withdraw' | 'balance' | 'block' | 'statement';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('balance');

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <CreateAccountPage />;
      case 'deposit':
        return <DepositPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'balance':
        return <BalancePage />;
      case 'block':
        return <BlockAccountPage />;
      case 'statement':
        return <StatementPage />;
      default:
        return <BalancePage />;
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Account Management System</h1>
        <nav className="nav">
          <button
            className={`nav-button ${currentPage === 'create' ? 'active' : ''}`}
            onClick={() => setCurrentPage('create')}
          >
            Create Account
          </button>
          <button
            className={`nav-button ${currentPage === 'deposit' ? 'active' : ''}`}
            onClick={() => setCurrentPage('deposit')}
          >
            Deposit
          </button>
          <button
            className={`nav-button ${currentPage === 'withdraw' ? 'active' : ''}`}
            onClick={() => setCurrentPage('withdraw')}
          >
            Withdraw
          </button>
          <button
            className={`nav-button ${currentPage === 'balance' ? 'active' : ''}`}
            onClick={() => setCurrentPage('balance')}
          >
            Balance
          </button>
          <button
            className={`nav-button ${currentPage === 'block' ? 'active' : ''}`}
            onClick={() => setCurrentPage('block')}
          >
            Block Account
          </button>
          <button
            className={`nav-button ${currentPage === 'statement' ? 'active' : ''}`}
            onClick={() => setCurrentPage('statement')}
          >
            Statement
          </button>
        </nav>
      </header>

      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
