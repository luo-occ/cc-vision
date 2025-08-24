// Tests for Accounts Handler - Default Account Protection
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { accountsHandler } from '../handlers/accounts';
import { D1Database } from '../cloudflare/models/d1Database';

// Mock environment
function createMockEnv() {
  const mockDb = new MockD1Database();
  return {
    DB: mockDb
  };
}

// Mock D1 Database (same as used in D1 tests)
class MockD1Database {
  private accounts: any[] = [];

  constructor() {
    // Initialize with a default account
    this.accounts.push({
      id: 'default-account-id',
      name: 'Default Account',
      account_type: 'SECURITIES',
      currency: 'USD',
      is_default: 1,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  prepare(sql: string) {
    return {
      bind: (...params: any[]) => ({
        run: async () => {
          const result = { success: false, changes: 0 };
          
          if (sql.includes('INSERT')) {
            const newAccount = {
              id: params[0],
              name: params[1],
              account_type: params[2],
              currency: params[3],
              is_default: params[4] ? 1 : 0,
              is_active: params[5] ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Handle default account logic
            if (params[4]) { // isDefault
              this.accounts.forEach(acc => acc.is_default = 0);
            }
            
            this.accounts.push(newAccount);
            result.success = true;
            result.changes = 1;
          }
          
          if (sql.includes('UPDATE')) {
            if (sql.includes('is_default = 0')) {
              this.accounts.forEach(acc => acc.is_default = 0);
              result.success = true;
              result.changes = this.accounts.length;
            } else if (sql.includes('is_default = 1 WHERE id =')) {
              const accountId = params[0];
              const account = this.accounts.find(acc => acc.id === accountId);
              if (account) {
                account.is_default = 1;
                result.success = true;
                result.changes = 1;
              }
            }
          }
          
          if (sql.includes('DELETE FROM accounts')) {
            const accountId = params[0];
            const accountIndex = this.accounts.findIndex(acc => acc.id === accountId);
            if (accountIndex !== -1) {
              this.accounts.splice(accountIndex, 1);
              result.success = true;
              result.changes = 1;
            }
          }
          
          return result;
        },
        first: async () => {
          if (sql.includes('WHERE id =')) {
            const accountId = params[0];
            const account = this.accounts.find(acc => acc.id === accountId);
            return account || null;
          }
          return null;
        },
        all: async () => {
          if (sql.includes('FROM accounts')) {
            return {
              results: this.accounts.map(account => ({
                id: account.id,
                name: account.name,
                account_type: account.account_type,
                currency: account.currency,
                is_default: account.is_default,
                is_active: account.is_active,
                created_at: account.created_at,
                updated_at: account.updated_at
              }))
            };
          }
          return { results: [] };
        }
      })
    };
  }

  // Helper to get current state
  getAccounts() {
    return this.accounts;
  }

  // Reset for tests
  reset() {
    this.accounts = [{
      id: 'default-account-id',
      name: 'Default Account',
      account_type: 'SECURITIES',
      currency: 'USD',
      is_default: 1,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  }
}

describe('Accounts Handler - Default Account Protection', () => {
  let mockEnv: any;
  let mockDb: MockD1Database;

  beforeEach(() => {
    mockDb = new MockD1Database();
    mockEnv = { DB: mockDb };
  });

  afterEach(() => {
    mockDb.reset();
  });

  describe('DELETE /api/accounts/:id', () => {
    it('should prevent deletion of default account', async () => {
      const request = new Request('https://example.com/api/accounts/default-account-id', {
        method: 'DELETE'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Default account cannot be deleted');
    });

    it('should allow deletion of non-default account', async () => {
      // Create a non-default account first
      const createRequest = new Request('https://example.com/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Account',
          accountType: 'SECURITIES',
          currency: 'USD',
          isDefault: false,
          isActive: true
        })
      });

      const createResponse = await accountsHandler(createRequest, mockEnv);
      const createData = await createResponse.json();
      const newAccountId = createData.data.id;

      // Now try to delete it
      const deleteRequest = new Request(`https://example.com/api/accounts/${newAccountId}`, {
        method: 'DELETE'
      });

      const deleteResponse = await accountsHandler(deleteRequest, mockEnv);
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
    });

    it('should return 404 for non-existent account', async () => {
      const request = new Request('https://example.com/api/accounts/non-existent-id', {
        method: 'DELETE'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Account not found');
    });
  });

  describe('POST /api/accounts/:id/default', () => {
    it('should successfully set a new default account', async () => {
      // Create a new account
      const createRequest = new Request('https://example.com/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Default Account',
          accountType: 'SECURITIES',
          currency: 'USD',
          isDefault: false,
          isActive: true
        })
      });

      const createResponse = await accountsHandler(createRequest, mockEnv);
      const createData = await createResponse.json();
      const newAccountId = createData.data.id;

      // Set it as default
      const setDefaultRequest = new Request(`https://example.com/api/accounts/${newAccountId}/default`, {
        method: 'POST'
      });

      const setDefaultResponse = await accountsHandler(setDefaultRequest, mockEnv);
      const setDefaultData = await setDefaultResponse.json();

      expect(setDefaultResponse.status).toBe(200);
      expect(setDefaultData.success).toBe(true);
    });

    it('should handle setting default on non-existent account', async () => {
      const request = new Request('https://example.com/api/accounts/non-existent-id/default', {
        method: 'POST'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to set default account');
      expect(data.message).toBe('Account not found');
    });
  });

  describe('GET /api/accounts/default/current', () => {
    it('should return the default account', async () => {
      const request = new Request('https://example.com/api/accounts/default/current', {
        method: 'GET'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('default-account-id');
      expect(data.data.isDefault).toBe(true);
    });

    it('should return 404 when no default account exists', async () => {
      // Remove the default account
      mockDb.getAccounts().splice(0, 1);

      const request = new Request('https://example.com/api/accounts/default/current', {
        method: 'GET'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No default account found');
    });
  });

  describe('GET /api/accounts', () => {
    it('should return all accounts including default', async () => {
      const request = new Request('https://example.com/api/accounts', {
        method: 'GET'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(1);
      expect(data.data[0].id).toBe('default-account-id');
      expect(data.data[0].isDefault).toBe(true);
    });

    it('should return accounts with default account first', async () => {
      // Create additional accounts
      const accounts = [
        { name: 'Account 1', accountType: 'SECURITIES', currency: 'USD', isDefault: false, isActive: true },
        { name: 'Account 2', accountType: 'SECURITIES', currency: 'USD', isDefault: false, isActive: true }
      ];

      for (const account of accounts) {
        const createRequest = new Request('https://example.com/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account)
        });
        await accountsHandler(createRequest, mockEnv);
      }

      const request = new Request('https://example.com/api/accounts', {
        method: 'GET'
      });

      const response = await accountsHandler(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(3);
      
      // Default account should be first
      expect(data.data[0].isDefault).toBe(true);
      expect(data.data[0].id).toBe('default-account-id');
    });
  });
});