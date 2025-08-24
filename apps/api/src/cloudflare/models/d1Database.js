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
        account_type TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        is_default INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      INSERT INTO accounts (id, name, account_type, currency, is_default, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(
        account.id,
        account.name,
        account.accountType,
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

  async getAccounts() {
    const sql = `
      SELECT id, name, account_type, currency, is_default, is_active, created_at, updated_at
      FROM accounts 
      WHERE is_active = 1
      ORDER BY is_default DESC, name ASC
    `;
    
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map(account => ({
        id: account.id,
        name: account.name,
        accountType: account.account_type,
        currency: account.currency,
        isDefault: account.is_default === 1,
        isActive: account.is_active === 1,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  async getAccountById(id) {
    const sql = `
      SELECT id, name, account_type, currency, is_default, is_active, created_at, updated_at
      FROM accounts 
      WHERE id = ? AND is_active = 1
    `;
    
    try {
      const result = await this.db.prepare(sql).bind(id).first();
      
      if (!result) return null;
      
      return {
        id: result.id,
        name: result.name,
        accountType: result.account_type,
        currency: result.currency,
        isDefault: result.is_default === 1,
        isActive: result.is_active === 1,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error('Error getting account by ID:', error);
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

  // Utility methods
  async ensureDefaultAccount() {
    const accounts = await this.getAccounts();
    const defaultAccount = accounts.find(acc => acc.isDefault);
    
    if (!defaultAccount) {
      const defaultAccountData = {
        id: 'default-account-' + Date.now(),
        name: 'Default Account',
        accountType: 'SECURITIES',
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
