// Tests for PostgreSQL Accounts Model
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AccountsModel from '../models/accounts';
import Database from '../models/database';
import { v4 as uuidv4 } from 'uuid';

// Mock Database class
class MockDatabase {
  private accounts: any[] = [];
  private runResults: any = { rowCount: 0 };
  private getResults: any = null;
  private allResults: any[] = [];

  constructor() {
    // Initialize with a default account
    this.accounts.push({
      id: 'default-account-id',
      name: 'Default Account',
      account_type: 'SECURITIES',
      currency: 'USD',
      is_default: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  async run(sql: string, params?: any[]) {
    this.runResults.rowCount = 0;
    
    if (sql.includes('INSERT')) {
      const newAccount = {
        id: params[0] || uuidv4(),
        name: params[1],
        account_type: params[2] || 'SECURITIES',
        group_name: params[3],
        currency: params[4],
        is_default: params[5],
        is_active: params[6],
        platform_id: params[7],
        created_at: params[8],
        updated_at: params[9]
      };
      
      // Handle default account logic
      if (params[5]) { // isDefault
        this.accounts.forEach(acc => acc.is_default = false);
      }
      
      this.accounts.push(newAccount);
      this.runResults.rowCount = 1;
    }
    
    if (sql.includes('UPDATE')) {
      if (sql.includes('is_default = false')) {
        this.accounts.forEach(acc => acc.is_default = false);
        this.runResults.rowCount = this.accounts.length;
      } else if (sql.includes('WHERE id =')) {
        const accountId = params[params.length - 1];
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account) {
          this.runResults.rowCount = 1;
        }
      }
    }
    
    if (sql.includes('DELETE')) {
      const accountId = params[0];
      const accountIndex = this.accounts.findIndex(acc => acc.id === accountId);
      if (accountIndex !== -1) {
        this.accounts.splice(accountIndex, 1);
        this.runResults.rowCount = 1;
      }
    }
    
    return this.runResults;
  }

  async get(sql: string, params?: any[]) {
    if (sql.includes('WHERE id =')) {
      const accountId = params[0];
      const account = this.accounts.find(acc => acc.id === accountId);
      if (account) {
        this.getResults = {
          id: account.id,
          name: account.name,
          account_type: account.account_type,
          group_name: account.group_name,
          currency: account.currency,
          is_default: account.is_default,
          is_active: account.is_active,
          platform_id: account.platform_id,
          created_at: account.created_at,
          updated_at: account.updated_at
        };
      } else {
        this.getResults = null;
      }
    }
    
    if (sql.includes('WHERE is_default = true')) {
      const defaultAccount = this.accounts.find(acc => acc.is_default && acc.is_active);
      if (defaultAccount) {
        this.getResults = {
          id: defaultAccount.id,
          name: defaultAccount.name,
          account_type: defaultAccount.account_type,
          group_name: defaultAccount.group_name,
          currency: defaultAccount.currency,
          is_default: defaultAccount.is_default,
          is_active: defaultAccount.is_active,
          platform_id: defaultAccount.platform_id,
          created_at: defaultAccount.created_at,
          updated_at: defaultAccount.updated_at
        };
      } else {
        this.getResults = null;
      }
    }
    
    return this.getResults;
  }

  async all(sql: string, params?: any[]) {
    if (sql.includes('FROM accounts')) {
      this.allResults = this.accounts.map(account => ({
        id: account.id,
        name: account.name,
        accountType: account.account_type,
        "group": account.group_name,
        currency: account.currency,
        isDefault: account.is_default,
        isActive: account.is_active,
        platformId: account.platform_id,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
    }
    return this.allResults;
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
      is_default: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  }
}

describe('AccountsModel - Default Account Protection', () => {
  let mockDb: MockDatabase;
  let accountsModel: AccountsModel;

  beforeEach(() => {
    mockDb = new MockDatabase();
    accountsModel = new AccountsModel(mockDb as any);
  });

  afterEach(() => {
    mockDb.reset();
  });

  describe('delete', () => {
    it('should prevent deletion of default account', async () => {
      const defaultAccountId = 'default-account-id';
      
      await expect(accountsModel.delete(defaultAccountId))
        .rejects.toThrow('Default account cannot be deleted');
    });

    it('should allow deletion of non-default account', async () => {
      // Create a non-default account first
      const newAccount = {
        name: 'Test Account',
        accountType: 'SECURITIES',
        currency: 'USD',
        isDefault: false,
        isActive: true
      };
      
      const createdAccount = await accountsModel.create(newAccount);
      
      // Should be able to delete non-default account
      const result = await accountsModel.delete(createdAccount.id);
      expect(result).toBe(true);
    });

    it('should return false when trying to delete non-existent account', async () => {
      const result = await accountsModel.delete('non-existent-id');
      expect(result).toBe(false);
    });

    it('should maintain default account protection even when account is inactive', async () => {
      // Make default account inactive
      await accountsModel.update('default-account-id', { isActive: false });
      
      // Should still not be deletable
      await expect(accountsModel.delete('default-account-id'))
        .rejects.toThrow('Default account cannot be deleted');
    });
  });

  describe('update', () => {
    it('should allow updating other properties of default account', async () => {
      const updatedAccount = await accountsModel.update('default-account-id', { 
        name: 'Updated Default Account Name' 
      });
      
      expect(updatedAccount).toBeTruthy();
      expect(updatedAccount?.name).toBe('Updated Default Account Name');
      expect(updatedAccount?.isDefault).toBe(true);
    });

    it('should handle changing default account', async () => {
      // Create a new account
      const newAccount = {
        name: 'New Default Account',
        accountType: 'SECURITIES',
        currency: 'USD',
        isDefault: true,
        isActive: true
      };
      
      const createdAccount = await accountsModel.create(newAccount);
      
      // The old default should no longer be default
      const oldDefault = await accountsModel.findById('default-account-id');
      expect(oldDefault?.isDefault).toBe(false);
      
      // The new account should be default
      const newDefault = await accountsModel.findById(createdAccount.id);
      expect(newDefault?.isDefault).toBe(true);
    });
  });

  describe('create', () => {
    it('should handle setting new account as default', async () => {
      const newAccount = {
        name: 'New Default Account',
        accountType: 'SECURITIES',
        currency: 'USD',
        isDefault: true,
        isActive: true
      };
      
      const createdAccount = await accountsModel.create(newAccount);
      
      // Should have unset the old default
      const accounts = await accountsModel.findAll();
      const defaultAccounts = accounts.filter(acc => acc.isDefault);
      expect(defaultAccounts.length).toBe(1);
      expect(defaultAccounts[0].id).toBe(createdAccount.id);
    });
  });

  describe('findDefault', () => {
    it('should find the default account', async () => {
      const defaultAccount = await accountsModel.findDefault();
      
      expect(defaultAccount).toBeTruthy();
      expect(defaultAccount?.id).toBe('default-account-id');
      expect(defaultAccount?.isDefault).toBe(true);
      expect(defaultAccount?.isActive).toBe(true);
    });

    it('should return null when no default account exists', async () => {
      // Delete the default account directly from mock
      mockDb.getAccounts().splice(0, 1);
      
      const defaultAccount = await accountsModel.findDefault();
      expect(defaultAccount).toBeNull();
    });
  });
});