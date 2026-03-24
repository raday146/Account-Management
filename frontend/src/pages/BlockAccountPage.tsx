import { useState, FormEvent } from 'react';
import { Account, accountService } from '../services/accountService';

export function BlockAccountPage() {
  const [accountId, setAccountId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [result, setResult] = useState<Account | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const account = await accountService.blockAccount(parseInt(accountId));
      setSuccess('Account blocked successfully!');
      setResult(account);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to block account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Block Account</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

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

        <button type="submit" className="button button-danger" disabled={loading}>
          {loading ? 'Blocking...' : 'Block Account'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>Account Blocked</h3>
          <p><strong>Account ID:</strong> {result.accountId}</p>
          <p><strong>Status:</strong> {result.activeFlag ? 'Active' : 'Blocked'}</p>
        </div>
      )}
    </div>
  );
}
