// Tests for D1 Database Model - Default Account Protection
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { D1Database } from '../cloudflare/models/d1Database';

// Mock D1 Database
class MockD1Database {
  private accounts: any[] = [];
  private holdings: any[] = [];

  constructor() {
    // Initialize with a default account
    this.accounts.push({
      id: 'default-account-id',
      name: 'Default Account',
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
              currency: params[2],
              is_default: params[3] ? 1 : 0,
              is_active: params[4] ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Handle default account logic
            if (params[3]) { // isDefault
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
      currency: 'USD',
      is_default: 1,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  }
}

describe('D1Database - Default Account Protection', () => {
  let mockDb: MockD1Database;
  let d1Database: D1Database;

  beforeEach(() => {
    mockDb = new MockD1Database();
    d1Database = new D1Database(mockDb as any);
  });

  afterEach(() => {
    mockDb.reset();
  });

  describe('deleteAccount', () => {
    it('should prevent deletion of default account', async () => {
      const defaultAccountId = 'default-account-id';
      
      await expect(d1Database.deleteAccount(defaultAccountId))
        .rejects.toThrow('Default account cannot be deleted');
    });

    it('should allow deletion of non-default account', async () => {
      // Create a non-default account first
      const newAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        currency: 'USD',
        isDefault: false,
        isActive: true
      };
      
      await d1Database.createAccount(newAccount);
      
      // Should be able to delete non-default account
      const result = await d1Database.deleteAccount('test-account-id');
      expect(result).toBe(true);
    });

    it('should return false when trying to delete non-existent account', async () => {
      const result = await d1Database.deleteAccount('non-existent-id');
      expect(result).toBe(false);
    });

    it('should maintain default account protection even when account is inactive', async () => {
      // Create an inactive default account
      const inactiveDefaultAccount = {
        id: 'inactive-default-id',
        name: 'Inactive Default',
        currency: 'USD',
        isDefault: true,
        isActive: false
      };
      
      await d1Database.createAccount(inactiveDefaultAccount);
      
      // Should still not be deletable
      await expect(d1Database.deleteAccount('inactive-default-id'))
        .rejects.toThrow('Default account cannot be deleted');
    });
  });

  describe('setDefaultAccount', () => {
    it('should successfully set a new default account', async () => {
      // Create a new account
      const newAccount = {
        id: 'new-default-id',
        name: 'New Default Account',
        currency: 'USD',
        isDefault: false,
        isActive: true
      };
      
      await d1Database.createAccount(newAccount);
      
      // Set it as default
      await d1Database.setDefaultAccount('new-default-id');
      
      // Verify the old default is no longer default
      const oldDefault = await d1Database.getAccountById('default-account-id');
      expect(oldDefault?.isDefault).toBe(false);
      
      // Verify the new account is default
      const newDefault = await d1Database.getAccountById('new-default-id');
      expect(newDefault?.isDefault).toBe(true);
    });

    it('should handle setting default on non-existent account', async () => {
      await expect(d1Database.setDefaultAccount('non-existent-id'))
        .rejects.toThrow('Account not found');
    });
  });

  describe('createAccount', () => {
    it('should handle setting new account as default', async () => {
      const newAccount = {
        id: 'new-default-id',
        name: 'New Default Account',
        currency: 'USD',
        isDefault: true,
        isActive: true
      };
      
      await d1Database.createAccount(newAccount);
      
      // Should have unset the old default
      const accounts = await d1Database.getAccounts();
      const defaultAccounts = accounts.filter(acc => acc.isDefault);
      expect(defaultAccounts.length).toBe(1);
      expect(defaultAccounts[0].id).toBe('new-default-id');
    });

    it('should create non-default account without affecting existing default', async () => {
      const newAccount = {
        id: 'regular-account-id',
        name: 'Regular Account',
        currency: 'USD',
        isDefault: false,
        isActive: true
      };
      
      await d1Database.createAccount(newAccount);
      
      // Original default should still be default
      const defaultAccount = await d1Database.getAccountById('default-account-id');
      expect(defaultAccount?.isDefault).toBe(true);
      
      // New account should not be default
      const newAccountCreated = await d1Database.getAccountById('regular-account-id');
      expect(newAccountCreated?.isDefault).toBe(false);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts in correct order (default first)', async () => {
      // Create additional accounts
      const accounts = [
        { id: 'account-1', name: 'Account 1', currency: 'USD', isDefault: false, isActive: true },
        { id: 'account-2', name: 'Account 2', currency: 'USD', isDefault: false, isActive: true }
      ];
      
      for (const account of accounts) {
        await d1Database.createAccount(account);
      }
      
      const result = await d1Database.getAccounts();
      
      // Default account should be first
      expect(result[0].isDefault).toBe(true);
      expect(result[0].id).toBe('default-account-id');
      
      // Other accounts should follow
      expect(result.length).toBe(3);
    });

    it('should only return active accounts', async () => {
      // Create an inactive account
      const inactiveAccount = {
        id: 'inactive-account-id',
        name: 'Inactive Account',
        currency: 'USD',
        isDefault: false,
        isActive: false
      };
      
      await d1Database.createAccount(inactiveAccount);
      
      const result = await d1Database.getAccounts();
      
      // Should not include inactive accounts
      const inactiveAccounts = result.filter(acc => !acc.isActive);
      expect(inactiveAccounts.length).toBe(0);
      
      // Should include active accounts
      expect(result.length).toBe(1); // Only the default account
    });
  });

  describe('ensureDefaultAccount', () => {
    it('should create default account when none exists', async () => {
      // Remove existing default account
      mockDb.getAccounts().splice(0, 1);
      
      const defaultAccount = await d1Database.ensureDefaultAccount();
      
      expect(defaultAccount).toBeTruthy();
      expect(defaultAccount.name).toBe('Default Account');
      expect(defaultAccount.isDefault).toBe(true);
    });

    it('should return existing default account', async () => {
      const defaultAccount = await d1Database.ensureDefaultAccount();
      
      expect(defaultAccount).toBeTruthy();
      expect(defaultAccount.id).toBe('default-account-id');
      expect(defaultAccount.isDefault).toBe(true);
    });
  });
});