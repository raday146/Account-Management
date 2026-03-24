import { useState } from 'react';
import './App.css';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { BalancePage } from './pages/BalancePage';
import { BlockAccountPage } from './pages/BlockAccountPage';
import { StatementPage } from './pages/StatementPage';
import { Page } from './types/core';

interface PageConfig {
  id: Page;
  label: string;
  component: React.ComponentType;
}

const PAGES: PageConfig[] = [
  { id: 'create', label: 'Create Account', component: CreateAccountPage },
  { id: 'deposit', label: 'Deposit', component: DepositPage },
  { id: 'withdraw', label: 'Withdraw', component: WithdrawPage },
  { id: 'balance', label: 'Balance', component: BalancePage },
  { id: 'block', label: 'Block Account', component: BlockAccountPage },
  { id: 'statement', label: 'Statement', component: StatementPage },
];

const DEFAULT_PAGE: Page = 'balance';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(DEFAULT_PAGE);

  const CurrentPageComponent = PAGES.find(page => page.id === currentPage)?.component || BalancePage;

  return (
    <div className="container">
      <header className="header">
        <h1>Account Management System</h1>
        <nav className="nav">
          {PAGES.map(page => (
            <button
              key={page.id}
              className={`nav-button ${currentPage === page.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(page.id)}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <CurrentPageComponent />
      </main>
    </div>
  );
}

export default App;
