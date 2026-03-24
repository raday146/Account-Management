import { useState, FormEvent } from 'react';
import { accountService, Statement } from '../services/accountService';

export function StatementPage() {
  const [accountId, setAccountId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<Statement | null>(null);
  const [showDateWarning, setShowDateWarning] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!fromDate || !toDate) {
      setShowDateWarning(true);
      setResult(null);
      setError('');
      return;
    }

    setShowDateWarning(false);
    setCurrentPage(1);
    await fetchStatement(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    if (result) {
      setCurrentPage(1);
      fetchStatement(1, newLimit);
    }
  };

  const fetchStatement = async (page: number, pageLimit?: number) => {
    setLoading(true);
    setError('');

    try {
      const statement = await accountService.getStatement(
        parseInt(accountId),
        fromDate,
        toDate,
        page,
        pageLimit || limit,
        typeFilter === 'all' ? undefined : typeFilter,
      );
      setResult(statement);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (result && currentPage * limit < result.total) {
      fetchStatement(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchStatement(currentPage - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    return num >= 0 ? `+$${value}` : `-$${Math.abs(num).toFixed(2)}`;
  };

  const getTransactionType = (value: string) => {
    return parseFloat(value) >= 0 ? 'Deposit' : 'Withdrawal';
  };

  const startIndex = result ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = result ? Math.min(currentPage * limit, result.total) : 0;

  return (
    <div className="page">
      <h2>Account Statement</h2>

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

        <div className="filter-group">
          <div className="form-group">
            <label htmlFor="fromDate">From Date *</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="toDate">To Date *</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="typeFilter">Type</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'deposit' | 'withdrawal')}
            >
              <option value="all">All</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Loading...' : 'Get Statement'}
        </button>
      </form>

      {showDateWarning && (
        <div className="date-warning">
          <p>Please select a date range to view transactions</p>
        </div>
      )}

      {result && (
        <div className="statement-results">
          <div className="result-card-compact">
            <div className="statement-header">
              <div>
                <strong>Account ID:</strong> {result.accountId} | <strong>Balance:</strong> ${result.balance}
              </div>
              <div className="statement-controls">
                <span className="statement-count">
                  {result.total > 0
                    ? `Showing ${startIndex}-${endIndex} of ${result.total} transactions`
                    : 'No transactions'}
                </span>
                <select
                  className="page-size-select"
                  value={limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                </select>
              </div>
            </div>
          </div>

          {result.transactions.length > 0 ? (
            <>
              <div className="transactions-table">
                <table className="table table-compact">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.transactions.map((tx) => {
                      const isPositive = parseFloat(tx.value) >= 0;
                      return (
                        <tr key={tx.transactionId}>
                          <td>{formatDate(tx.transactionDate)}</td>
                          <td>{getTransactionType(tx.value)}</td>
                          <td className={isPositive ? 'transaction-positive' : 'transaction-negative'}>
                            {formatValue(tx.value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {result.total > limit && (
                <div className="pagination">
                  <button
                    className="button button-secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {Math.ceil(result.total / limit)}
                  </span>
                  <button
                    className="button button-secondary"
                    onClick={handleNextPage}
                    disabled={currentPage * limit >= result.total || loading}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-compact">
              <p>No transactions found for this period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
