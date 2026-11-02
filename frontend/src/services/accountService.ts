import type { TransactionType } from '../types/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateAccountRequest {
  personId: number;
  dailyWithdrawalLimit: number;
  accountType: number;
}

export interface DepositRequest {
  value: number;
}

export interface WithdrawRequest {
  value: number;
}

export interface Account {
  accountId: number;
  balance: string;
  activeFlag: boolean;
  dailyWithdrawalLimit?: string;
  accountType?: number;
  personId?: number;
  createDate?: string;
}


export interface Transaction {
  transactionId: number;
  accountId: number;
  value: string;
  transactionDate: string;
}

export interface Statement {
  accountId: number;
  balance: string;
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface Person {
  personId: number;
  name: string;
  document: string;
  birthDate: string;
}

export const accountService = {
  async getPersons(): Promise<Person[]> {
    const response = await fetch(`${API_URL}/persons`);
    if (!response.ok) {
      throw new Error('Failed to fetch persons');
    }
    const result = await response.json();
    return result.data || result;
  },

  async createAccount(data: CreateAccountRequest): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create account');
    }
    const result = await response.json();
    return result.data;
  },

  async deposit(accountId: number, data: DepositRequest): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts/${accountId}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deposit');
    }
    const result = await response.json();
    return result.data;
  },

  async withdraw(accountId: number, data: WithdrawRequest): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts/${accountId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to withdraw');
    }
    const result = await response.json();
    return result.data;
  },

  async getBalance(accountId: number): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts/${accountId}/balance`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get balance');
    }
    const result = await response.json();
    return result.data;
  },

  async blockAccount(accountId: number): Promise<Account> {
    const response = await fetch(`${API_URL}/accounts/${accountId}/block`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to block account');
    }
    const result = await response.json();
    return result.data;
  },

  async getStatement(
    accountId: number,
    from?: string,
    to?: string,
    page?: number,
    limit?: number,
    type?: TransactionType,
  ): Promise<Statement> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (type) params.append('type', type);

    const url = `${API_URL}/accounts/${accountId}/statement${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get statement');
    }
    const result = await response.json();
    return result.data;
  },
};
