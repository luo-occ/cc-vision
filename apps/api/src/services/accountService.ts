import { Account, NewAccount, AccountUpdate } from '@portfolio/shared';
import AccountsModel from '../models/accounts';

class AccountService {
  private accountsModel: AccountsModel;

  constructor(accountsModel: AccountsModel) {
    this.accountsModel = accountsModel;
  }

  async createAccount(accountData: NewAccount): Promise<Account> {
    return await this.accountsModel.create(accountData);
  }

  async getAccounts(isActive?: boolean): Promise<Account[]> {
    return await this.accountsModel.findAll(isActive);
  }

  async getAccount(id: string): Promise<Account | null> {
    return await this.accountsModel.findById(id);
  }

  async updateAccount(id: string, updates: AccountUpdate): Promise<Account | null> {
    const existing = await this.accountsModel.findById(id);
    if (!existing) return null;

    return await this.accountsModel.update(id, updates);
  }

  async deleteAccount(id: string): Promise<boolean> {
    return await this.accountsModel.delete(id);
  }

  async getDefaultAccount(): Promise<Account | null> {
    return await this.accountsModel.findDefault();
  }

  async setDefaultAccount(id: string): Promise<void> {
    await this.accountsModel.setDefault(id);
  }

  async getActiveAccounts(): Promise<Account[]> {
    return await this.accountsModel.findAll(true);
  }

  // Ensure at least one account exists, create default if none
  async ensureDefaultAccount(): Promise<Account> {
    const defaultAccount = await this.getDefaultAccount();
    if (defaultAccount) {
      return defaultAccount;
    }

    // Create default account
    const newAccount: NewAccount = {
      name: 'Default Account',
      accountType: 'SECURITIES',
      currency: 'USD',
      isDefault: true,
      isActive: true
    };

    return await this.createAccount(newAccount);
  }
}

export default AccountService;