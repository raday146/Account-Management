import { useState, FormEvent } from 'react';
import { Account, accountService } from '../services/accountService';

export function DepositPage() {
  const [accountId, setAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
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
      const account = await accountService.deposit(parseInt(accountId), {
        value: parseFloat(amount),
      });
      setSuccess('Deposit successful!');
      setResult(account);
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Deposit Money</h2>

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

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>Deposit Successful</h3>
          <p><strong>Account ID:</strong> {result.accountId}</p>
          <p><strong>New Balance:</strong> ${result.balance}</p>
        </div>
      )}
    </div>
  );
}
