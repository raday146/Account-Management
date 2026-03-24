import { useState, FormEvent } from 'react';
import { accountService } from '../services/accountService';

export function BalancePage() {
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const balance = await accountService.getBalance(parseInt(accountId));
      setResult(balance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Check Balance</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="accountId">Account ID</label>
          <input
            id="accountId"
            type="number"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="e.g., 1"
            required
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Loading...' : 'Get Balance'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>Account Balance</h3>
          <div className="balance-display">${result.balance}</div>
          <p><strong>Account ID:</strong> {result.accountId}</p>
          <p><strong>Status:</strong> {result.activeFlag ? 'Active' : 'Blocked'}</p>
        </div>
      )}
    </div>
  );
}
