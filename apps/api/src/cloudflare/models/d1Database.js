// Cloudflare D1 Database Model (replaces PostgreSQL)

export class D1Database {
  constructor(db) {
    this.db = db;
  }

  // Initialize database tables
  async initializeTables() {
    const statements = [
      // Accounts table
      `CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        is_default INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Account tags table
      `CREATE TABLE IF NOT EXISTS account_tags (
        account_id TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (account_id, tag_name),
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
      )`,
      
      // Holdings table
      `CREATE TABLE IF NOT EXISTS holdings (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        quantity REAL NOT NULL,
        average_price REAL NOT NULL,
        asset_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
      )`,

      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_account_tags_account_id ON account_tags(account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_account_tags_tag_name ON account_tags(tag_name)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol)`,
      `CREATE INDEX IF NOT EXISTS idx_accounts_default ON accounts(is_default)`
    ];

    try {
      for (const sql of statements) {
        await this.db.prepare(sql).run();
      }
      console.log('✅ D1 Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing D1 tables:', error);
      throw error;
    }
  }

  // Account operations
  async createAccount(account) {
    const sql = `
      INSERT INTO accounts (id, name, currency, is_default, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(
        account.id,
        account.name,
        account.currency || 'USD',
        account.isDefault ? 1 : 0,
        account.isActive ? 1 : 0
      ).run();
      
      return result.success;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async updateAccount(id, account) {
    const sql = `
      UPDATE accounts 
      SET name = ?, 
          currency = ?, 
          is_default = ?, 
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(
        account.name,
        account.currency || 'USD',
        account.isDefault ? 1 : 0,
        account.isActive !== false ? 1 : 0, // Default to active if not specified
        id
      ).run();
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async getAccounts() {
    const sql = `
      SELECT 
        a.id, 
        a.name, 
        a.currency, 
        a.is_default, 
        a.is_active, 
        a.created_at, 
        a.updated_at,
        COALESCE(
          JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'name', at.tag_name,
              'createdAt', at.created_at
            )
          ),
          JSON_ARRAY()
        ) as tags
      FROM accounts a
      LEFT JOIN account_tags at ON a.id = at.account_id
      WHERE a.is_active = 1
      GROUP BY a.id, a.name, a.currency, a.is_default, a.is_active, a.created_at, a.updated_at
      ORDER BY a.is_default DESC, a.name ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map(account => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        isDefault: account.is_default === 1,
        isActive: account.is_active === 1,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
        tags: JSON.parse(account.tags || '[]')
      }));
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  async getAccountById(id) {
    const sql = `
      SELECT 
        a.id, 
        a.name, 
        a.currency, 
        a.is_default, 
        a.is_active, 
        a.created_at, 
        a.updated_at,
        COALESCE(
          JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'name', at.tag_name,
              'createdAt', at.created_at
            )
          ),
          JSON_ARRAY()
        ) as tags
      FROM accounts a
      LEFT JOIN account_tags at ON a.id = at.account_id
      WHERE a.id = ? AND a.is_active = 1
      GROUP BY a.id, a.name, a.currency, a.is_default, a.is_active, a.created_at, a.updated_at
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(id).first();
      
      if (!result) return null;
      
      return {
        id: result.id,
        name: result.name,
        currency: result.currency,
        isDefault: result.is_default === 1,
        isActive: result.is_active === 1,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        tags: JSON.parse(result.tags || '[]')
      };
    } catch (error) {
      console.error('Error getting account by ID:', error);
      throw error;
    }
  }

  async getDefaultAccount() {
    const sql = `
      SELECT id, name, currency, is_default, is_active, created_at, updated_at
      FROM accounts 
      WHERE is_default = 1 AND is_active = 1
      LIMIT 1
    `;
    
    try {
      const result = await this.db.prepare(sql).first();
      
      if (!result) return null;
      
      return {
        id: result.id,
        name: result.name,
        currency: result.currency,
        isDefault: result.is_default === 1,
        isActive: result.is_active === 1,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error('Error getting default account:', error);
      throw error;
    }
  }

  async setDefaultAccount(accountId) {
    try {
      // First, set all accounts to non-default
      await this.db.prepare('UPDATE accounts SET is_default = 0').run();
      
      // Then set the specified account as default
      const result = await this.db.prepare('UPDATE accounts SET is_default = 1 WHERE id = ?').bind(accountId).run();
      
      if (result.changes === 0) {
        throw new Error('Account not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error setting default account:', error);
      throw error;
    }
  }

  // Holdings operations
  async createHolding(holding) {
    const sql = `
      INSERT INTO holdings (id, account_id, symbol, quantity, average_price, asset_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(
        holding.id,
        holding.accountId,
        holding.symbol.toUpperCase(),
        holding.quantity,
        holding.averagePrice,
        holding.assetType
      ).run();
      
      return result.success;
    } catch (error) {
      console.error('Error creating holding:', error);
      throw error;
    }
  }

  async getHoldingsByAccountId(accountId) {
    const sql = `
      SELECT id, account_id, symbol, quantity, average_price, asset_type, created_at, updated_at
      FROM holdings 
      WHERE account_id = ?
      ORDER BY symbol ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(accountId).all();
      return result.results.map(holding => ({
        id: holding.id,
        accountId: holding.account_id,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.average_price,
        assetType: holding.asset_type,
        createdAt: holding.created_at,
        updatedAt: holding.updated_at
      }));
    } catch (error) {
      console.error('Error getting holdings by account ID:', error);
      throw error;
    }
  }

  async getAllHoldings() {
    const sql = `
      SELECT h.id, h.account_id, h.symbol, h.quantity, h.average_price, h.asset_type, 
             h.created_at, h.updated_at, a.name as account_name
      FROM holdings h
      JOIN accounts a ON h.account_id = a.id
      WHERE a.is_active = 1
      ORDER BY a.name ASC, h.symbol ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map(holding => ({
        id: holding.id,
        accountId: holding.account_id,
        accountName: holding.account_name,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.average_price,
        assetType: holding.asset_type,
        createdAt: holding.created_at,
        updatedAt: holding.updated_at
      }));
    } catch (error) {
      console.error('Error getting all holdings:', error);
      throw error;
    }
  }

  async updateHolding(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(updates.quantity);
    }
    if (updates.averagePrice !== undefined) {
      fields.push('average_price = ?');
      values.push(updates.averagePrice);
    }
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE holdings SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      const result = await this.db.prepare(sql).bind(...values).run();
      return result.success;
    } catch (error) {
      console.error('Error updating holding:', error);
      throw error;
    }
  }

  async deleteHolding(id) {
    const sql = `DELETE FROM holdings WHERE id = ?`;
    
    try {
      const result = await this.db.prepare(sql).bind(id).run();
      return result.success;
    } catch (error) {
      console.error('Error deleting holding:', error);
      throw error;
    }
  }

  async deleteAccount(id) {
    // Check if this is a default account - default accounts cannot be deleted
    const account = await this.getAccountById(id);
    if (!account) {
      return false;
    }
    
    if (account.isDefault) {
      throw new Error('Default account cannot be deleted');
    }

    const sql = `DELETE FROM accounts WHERE id = ?`;
    
    try {
      const result = await this.db.prepare(sql).bind(id).run();
      return result.success;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Tag management methods
  async addAccountTag(accountId, tagName) {
    const sql = `
      INSERT INTO account_tags (account_id, tag_name)
      VALUES (?, ?)
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(accountId, tagName.toLowerCase().trim()).run();
      return result.success;
    } catch (error) {
      console.error('Error adding account tag:', error);
      throw error;
    }
  }

  async removeAccountTag(accountId, tagName) {
    const sql = `
      DELETE FROM account_tags 
      WHERE account_id = ? AND tag_name = ?
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(accountId, tagName.toLowerCase().trim()).run();
      return result.success;
    } catch (error) {
      console.error('Error removing account tag:', error);
      throw error;
    }
  }

  async setAccountTags(accountId, tagNames) {
    // First, remove all existing tags
    const deleteSql = `DELETE FROM account_tags WHERE account_id = ?`;
    await this.db.prepare(deleteSql).bind(accountId).run();
    
    // Then add new tags
    if (tagNames.length > 0) {
      for (const tagName of tagNames) {
        const insertSql = `
          INSERT INTO account_tags (account_id, tag_name)
          VALUES (?, ?)
        `;
        await this.db.prepare(insertSql).bind(accountId, tagName.toLowerCase().trim()).run();
      }
    }
  }

  async getAccountTags(accountId) {
    const sql = `
      SELECT tag_name 
      FROM account_tags 
      WHERE account_id = ? 
      ORDER BY tag_name ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(accountId).all();
      return result.results.map(row => row.tag_name);
    } catch (error) {
      console.error('Error getting account tags:', error);
      throw error;
    }
  }

  async getAllTags() {
    const sql = `
      SELECT DISTINCT tag_name 
      FROM account_tags 
      ORDER BY tag_name ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map(row => row.tag_name);
    } catch (error) {
      console.error('Error getting all tags:', error);
      throw error;
    }
  }

  async getAccountsByTags(tagNames) {
    if (tagNames.length === 0) {
      return this.getAccounts();
    }

    const placeholders = tagNames.map(() => '?').join(',');
    const sql = `
      SELECT DISTINCT a.*
      FROM accounts a
      INNER JOIN account_tags at ON a.id = at.account_id
      WHERE at.tag_name IN (${placeholders})
      AND a.is_active = 1
      ORDER BY a.is_default DESC, a.name ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(...tagNames).all();
      return result.results.map(account => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        isDefault: account.is_default === 1,
        isActive: account.is_active === 1,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
    } catch (error) {
      console.error('Error getting accounts by tags:', error);
      throw error;
    }
  }

  // Utility methods
  async ensureDefaultAccount() {
    const accounts = await this.getAccounts();
    const defaultAccount = accounts.find(acc => acc.isDefault);
    
    if (!defaultAccount) {
      const defaultAccountData = {
        id: 'default-account-' + Date.now(),
        name: 'Default Account',
        currency: 'USD',
        isDefault: true,
        isActive: true
      };
      
      await this.createAccount(defaultAccountData);
      console.log('✅ Default account created');
      return defaultAccountData;
    }
    
    return defaultAccount;
  }
}
