import { Holding, CreateHoldingRequest, UpdateHoldingRequest } from '../types/shared';
import Database from './database';
import { v4 as uuidv4 } from 'uuid';

class HoldingsModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(holdingData: CreateHoldingRequest): Promise<Holding> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO holdings (id, account_id, symbol, name, type, quantity, cost_basis, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.db.run(sql, [
      id,
      holdingData.accountId,
      holdingData.symbol.toUpperCase(),
      holdingData.name,
      holdingData.type,
      holdingData.quantity,
      holdingData.costBasis,
      now,
      now
    ]);

    return this.findById(id) as Promise<Holding>;
  }

  async findAll(accountId?: string): Promise<Holding[]> {
    let sql = `
      SELECT 
        id,
        account_id as accountId,
        symbol,
        name,
        type,
        quantity,
        cost_basis as costBasis,
        current_price as currentPrice,
        last_updated as lastUpdated,
        created_at as createdAt,
        updated_at as updatedAt
      FROM holdings
    `;
    
    const params: any[] = [];
    
    if (accountId) {
      sql += ' WHERE account_id = $1';
      params.push(accountId);
    }
    
    sql += ' ORDER BY created_at DESC';

    const rows = await this.db.all(sql, params);
    return rows.map(this.mapRowToHolding);
  }

  async findById(id: string): Promise<Holding | null> {
    const sql = `
      SELECT 
        id,
        account_id as accountId,
        symbol,
        name,
        type,
        quantity,
        cost_basis as costBasis,
        current_price as currentPrice,
        last_updated as lastUpdated,
        created_at as createdAt,
        updated_at as updatedAt
      FROM holdings
      WHERE id = $1
    `;

    const row = await this.db.get(sql, [id]);
    return row ? this.mapRowToHolding(row) : null;
  }

  async update(id: string, updates: UpdateHoldingRequest): Promise<Holding | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (updates.quantity !== undefined) {
      fieldsToUpdate.push(`quantity = $${values.length + 1}`);
      values.push(updates.quantity);
    }

    if (updates.costBasis !== undefined) {
      fieldsToUpdate.push(`cost_basis = $${values.length + 1}`);
      values.push(updates.costBasis);
    }

    if (fieldsToUpdate.length === 0) return existing;

    fieldsToUpdate.push(`updated_at = $${values.length + 1}`);
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE holdings SET ${fieldsToUpdate.join(', ')} WHERE id = $${values.length + 1}`;
    await this.db.run(sql, values);

    return this.findById(id) as Promise<Holding>;
  }

  async updatePrice(symbol: string, price: number): Promise<void> {
    const sql = `
      UPDATE holdings 
      SET current_price = $1, last_updated = $2
      WHERE symbol = $3
    `;

    await this.db.run(sql, [price, new Date().toISOString(), symbol.toUpperCase()]);
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM holdings WHERE id = $1';
    const result = await this.db.run(sql, [id]);
    return result.changes > 0;
  }

  private mapRowToHolding(row: any): Holding {
    return {
      id: row.id,
      accountId: row.accountId,
      symbol: row.symbol,
      name: row.name,
      type: row.type,
      quantity: row.quantity,
      costBasis: row.costBasis,
      currentPrice: row.currentPrice,
      lastUpdated: row.lastUpdated ? new Date(row.lastUpdated) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}

export default HoldingsModel;