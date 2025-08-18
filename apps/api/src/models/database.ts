import { Pool, PoolClient } from 'pg';

class Database {
  private pool: Pool;
  private client: PoolClient | null = null;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getClient(): Promise<PoolClient> {
    if (!this.client) {
      this.client = await this.pool.connect();
    }
    return this.client;
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(sql, params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(sql, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const client = await this.getClient();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    await this.pool.end();
  }

  async initializeTables(): Promise<void> {
    const client = await this.getClient();
    try {
      // Create accounts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) DEFAULT 'brokerage',
          currency VARCHAR(3) DEFAULT 'USD',
          balance DECIMAL(15,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create holdings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS holdings (
          id SERIAL PRIMARY KEY,
          account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
          symbol VARCHAR(50) NOT NULL,
          name VARCHAR(255),
          type VARCHAR(50) DEFAULT 'stock',
          quantity DECIMAL(15,6) NOT NULL,
          avg_price DECIMAL(15,6),
          current_price DECIMAL(15,6),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create price history table
      await client.query(`
        CREATE TABLE IF NOT EXISTS price_history (
          id SERIAL PRIMARY KEY,
          symbol VARCHAR(50) NOT NULL,
          price DECIMAL(15,6) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          source VARCHAR(50) DEFAULT 'yahoo'
        );
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }
}

export default Database;