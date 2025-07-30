import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './portfolio.db';

const createTables = () => {
  const db = new sqlite3.Database(dbPath);

  const createHoldingsTable = `
    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('stock', 'crypto')),
      quantity REAL NOT NULL CHECK (quantity > 0),
      cost_basis REAL NOT NULL CHECK (cost_basis > 0),
      current_price REAL,
      last_updated DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPricesTable = `
    CREATE TABLE IF NOT EXISTS prices (
      symbol TEXT PRIMARY KEY,
      price REAL NOT NULL,
      change_24h REAL,
      change_percent_24h REAL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.serialize(() => {
    db.run(createHoldingsTable, (err) => {
      if (err) {
        console.error('Error creating holdings table:', err);
      } else {
        console.log('Holdings table created successfully');
      }
    });

    db.run(createPricesTable, (err) => {
      if (err) {
        console.error('Error creating prices table:', err);
      } else {
        console.log('Prices table created successfully');
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database initialized successfully');
    }
  });
};

if (require.main === module) {
  createTables();
}

export { createTables };