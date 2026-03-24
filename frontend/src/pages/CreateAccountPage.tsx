import { useState, useEffect, FormEvent } from 'react';
import { Account, accountService, Person } from '../services/accountService';
import { AccountType } from '../types/core';


const ACCOUNT_TYPE_MAP: Record<AccountType, number> = {
  checking: 1,
  savings: 2,
};

const ACCOUNT_TYPE_LABELS: Record<number, string> = {
  1: 'Checking',
  2: 'Savings',
};

export function CreateAccountPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<string>('1000');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPersons, setLoadingPersons] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [result, setResult] = useState<Account | null>(null);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const fetchedPersons = await accountService.getPersons();
        setPersons(fetchedPersons);
        if (fetchedPersons.length > 0) {
          setSelectedPersonId(fetchedPersons[0].personId);
        } else {
          setError('No persons found. Please run the seed script first.');
        }
      } catch (error) {
        setError('Failed to load person data. Please run the seed script first.');
      } finally {
        setLoadingPersons(false);
      }
    };
    fetchPersons();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonId) {
      setError('No person selected.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const account = await accountService.createAccount({
        personId: selectedPersonId,
        dailyWithdrawalLimit: parseFloat(dailyLimit),
        accountType: ACCOUNT_TYPE_MAP[accountType],
      });
      setSuccess('Account created successfully!');
      setResult(account);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPersons) {
    return (
      <div className="page">
        <h2>Create Account</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Create Account</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="form" onSubmit={handleSubmit}>
        {persons.length > 1 && (
          <div className="form-group">
            <label htmlFor="person">Select Person</label>
            <select
              id="person"
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(parseInt(e.target.value))}
              required
            >
              {persons.map((person) => (
                <option key={person.personId} value={person.personId}>
                  {person.name} - {person.document}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="dailyLimit">Daily Withdrawal Limit ($)</label>
          <input
            id="dailyLimit"
            type="number"
            step="0.01"
            min="0"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="accountType">Account Type</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>

        <button type="submit" className="button" disabled={loading || !selectedPersonId}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h3>Account Created</h3>
          <p><strong>Account ID:</strong> {result.accountId}</p>
          <p><strong>Balance:</strong> ${result.balance}</p>
          <p><strong>Daily Limit:</strong> ${result.dailyWithdrawalLimit}</p>
          <p><strong>Type:</strong> {ACCOUNT_TYPE_LABELS[result.accountType as keyof typeof ACCOUNT_TYPE_LABELS] || result.accountType}</p>
          <p><strong>Status:</strong> {result.activeFlag ? 'Active' : 'Blocked'}</p>
        </div>
      )}
    </div>
  );
}
