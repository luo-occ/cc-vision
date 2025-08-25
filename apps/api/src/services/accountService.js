// Account Service - Business logic for account management
// Tags are treated as account attributes, not separate entities

export class AccountService {
  constructor(database) {
    this.database = database;
  }

  // Create account with tags
  async createAccount(accountData) {
    try {
      // Validate required fields
      if (!accountData.name) {
        throw new Error('Missing required field: name');
      }

      // Generate ID if not provided
      if (!accountData.id) {
        accountData.id = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Set defaults
      accountData.currency = accountData.currency || 'USD';
      accountData.isDefault = accountData.isDefault || false;
      accountData.isActive = accountData.isActive !== false; // Default to true

      // Create the account
      const success = await this.database.createAccount(accountData);
      if (!success) {
        throw new Error('Failed to create account');
      }

      // Add tags if provided
      if (accountData.tags && Array.isArray(accountData.tags)) {
        await this.database.setAccountTags(accountData.id, accountData.tags);
      }

      // Return the created account with tags
      return await this.database.getAccountById(accountData.id);
    } catch (error) {
      console.error('AccountService.createAccount error:', error);
      throw error;
    }
  }

  // Update account including tags
  async updateAccount(id, accountData) {
    try {
      // Validate required fields
      if (!accountData.name) {
        throw new Error('Missing required field: name');
      }

      // Update basic account info
      const success = await this.database.updateAccount(id, accountData);
      if (!success) {
        throw new Error('Account not found');
      }

      // Update tags if provided
      if (accountData.tags !== undefined) {
        if (Array.isArray(accountData.tags)) {
          await this.database.setAccountTags(id, accountData.tags);
        } else {
          throw new Error('Tags must be an array');
        }
      }

      // Return the updated account with tags
      return await this.database.getAccountById(id);
    } catch (error) {
      console.error('AccountService.updateAccount error:', error);
      throw error;
    }
  }

  // Get all accounts with their tags
  async getAccounts() {
    try {
      return await this.database.getAccounts();
    } catch (error) {
      console.error('AccountService.getAccounts error:', error);
      throw error;
    }
  }

  // Get account by ID with tags
  async getAccountById(id) {
    try {
      const account = await this.database.getAccountById(id);
      if (!account) {
        throw new Error('Account not found');
      }
      return account;
    } catch (error) {
      console.error('AccountService.getAccountById error:', error);
      throw error;
    }
  }

  // Delete account
  async deleteAccount(id) {
    try {
      const success = await this.database.deleteAccount(id);
      if (!success) {
        throw new Error('Account not found');
      }
      return true;
    } catch (error) {
      console.error('AccountService.deleteAccount error:', error);
      throw error;
    }
  }

  // Get default account
  async getDefaultAccount() {
    try {
      const account = await this.database.getDefaultAccount();
      if (!account) {
        throw new Error('No default account found');
      }
      return account;
    } catch (error) {
      console.error('AccountService.getDefaultAccount error:', error);
      throw error;
    }
  }

  // Set default account
  async setDefaultAccount(id) {
    try {
      await this.database.setDefaultAccount(id);
      return true;
    } catch (error) {
      console.error('AccountService.setDefaultAccount error:', error);
      throw error;
    }
  }

  // Get all unique tags across all accounts
  async getAllTags() {
    try {
      return await this.database.getAllTags();
    } catch (error) {
      console.error('AccountService.getAllTags error:', error);
      throw error;
    }
  }

  // Get accounts by tags
  async getAccountsByTags(tagNames) {
    try {
      if (!Array.isArray(tagNames) || tagNames.length === 0) {
        throw new Error('Tag names must be a non-empty array');
      }
      return await this.database.getAccountsByTags(tagNames);
    } catch (error) {
      console.error('AccountService.getAccountsByTags error:', error);
      throw error;
    }
  }
}