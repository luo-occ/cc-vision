import { Account, NewAccount, AccountUpdate } from '../types/shared';
import Database from './database';
import { v4 as uuidv4 } from 'uuid';

class AccountsModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(accountData: NewAccount): Promise<Account> {
    const id = accountData.id || uuidv4();
    const now = new Date().toISOString();

    // Validate required fields
    if (!accountData.name || accountData.name.trim() === '') {
      throw new Error('Account name is required');
    }
    if (!accountData.currency || accountData.currency.trim() === '') {
      throw new Error('Currency is required');
    }

    // If this account is set as default, unset existing defaults first
    if (accountData.isDefault) {
      await this.db.run('UPDATE accounts SET is_default = false WHERE is_default = true');
    }

    const sql = `
      INSERT INTO accounts (id, name, account_type, group_name, currency, is_default, is_active, platform_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await this.db.run(sql, [
      id,
      accountData.name,
      accountData.accountType || 'SECURITIES',
      accountData.group,
      accountData.currency,
      accountData.isDefault ? true : false,
      accountData.isActive ? true : false,
      accountData.platformId,
      now,
      now
    ]);

    return this.findById(id) as Promise<Account>;
  }

  async findAll(isActive?: boolean): Promise<Account[]> {
    let sql = `
      SELECT 
        id,
        name,
        account_type as accountType,
        group_name as "group",
        currency,
        is_default as isDefault,
        is_active as isActive,
        platform_id as platformId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM accounts
    `;
    
    const params: any[] = [];
    
    if (isActive !== undefined) {
      sql += ' WHERE is_active = $1';
      params.push(isActive ? true : false);
    }
    
    sql += ' ORDER BY is_active DESC, name ASC';

    const rows = await this.db.all(sql, params);
    return rows.map(this.mapRowToAccount);
  }

  async findById(id: string): Promise<Account | null> {
    const sql = `
      SELECT 
        id,
        name,
        account_type as accountType,
        group_name as "group",
        currency,
        is_default as isDefault,
        is_active as isActive,
        platform_id as platformId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM accounts
      WHERE id = $1
    `;

    const row = await this.db.get(sql, [id]);
    return row ? this.mapRowToAccount(row) : null;
  }

  async update(id: string, updates: AccountUpdate): Promise<Account | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Validate required fields
    if (!updates.name || updates.name.trim() === '') {
      throw new Error('Account name is required');
    }

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fieldsToUpdate.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.accountType !== undefined) {
      fieldsToUpdate.push(`account_type = $${paramIndex++}`);
      values.push(updates.accountType);
    }
    if (updates.group !== undefined) {
      fieldsToUpdate.push(`group_name = $${paramIndex++}`);
      values.push(updates.group);
    }
    if (updates.isDefault !== undefined) {
      // If setting this account as default, unset existing defaults first
      if (updates.isDefault) {
        await this.db.run('UPDATE accounts SET is_default = false WHERE is_default = true');
      }
      fieldsToUpdate.push(`is_default = $${paramIndex++}`);
      values.push(updates.isDefault ? true : false);
    }
    if (updates.isActive !== undefined) {
      fieldsToUpdate.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive ? true : false);
    }
    if (updates.platformId !== undefined) {
      fieldsToUpdate.push(`platform_id = $${paramIndex++}`);
      values.push(updates.platformId);
    }

    if (fieldsToUpdate.length === 0) return existing;

    fieldsToUpdate.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE accounts SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.run(sql, values);

    return this.findById(id) as Promise<Account>;
  }

  async delete(id: string): Promise<boolean> {
    // Check if this is a default account - default accounts cannot be deleted
    const account = await this.findById(id);
    if (!account) {
      return false;
    }
    
    if (account.isDefault) {
      throw new Error('Default account cannot be deleted');
    }

    const sql = 'DELETE FROM accounts WHERE id = $1';
    const result = await this.db.run(sql, [id]);
    return result.rowCount > 0;
  }

  async findDefault(): Promise<Account | null> {
    const sql = `
      SELECT 
        id,
        name,
        account_type as accountType,
        group_name as "group",
        currency,
        is_default as isDefault,
        is_active as isActive,
        platform_id as platformId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM accounts
      WHERE is_default = true AND is_active = true
      LIMIT 1
    `;

    const row = await this.db.get(sql);
    return row ? this.mapRowToAccount(row) : null;
  }

  async setDefault(id: string): Promise<void> {
    // First, unset all default accounts
    await this.db.run('UPDATE accounts SET is_default = false WHERE is_default = true');
    
    // Then set the new default
    await this.db.run('UPDATE accounts SET is_default = true WHERE id = $1', [id]);
  }

  private mapRowToAccount(row: any): Account {
    return {
      id: row.id,
      name: row.name,
      accountType: row.accountType,
      group: row.group,
      currency: row.currency,
      isDefault: Boolean(row.isDefault),
      isActive: Boolean(row.isActive),
      platformId: row.platformId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}

export default AccountsModel;