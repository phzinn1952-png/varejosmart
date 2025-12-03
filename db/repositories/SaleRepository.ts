import Database from 'better-sqlite3';
import { getDatabase } from '../database.js';

export interface SaleRow {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method: string;
  timestamp: string;
  synced: number;
  created_at: string;
}

export interface SaleItemRow {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface SaleWithItems extends SaleRow {
  items: SaleItemRow[];
}

export class SaleRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAllByTenant(tenantId: string, limit?: number): SaleRow[] {
    const sql = `
      SELECT * FROM sales
      WHERE tenant_id = ?
      ORDER BY timestamp DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    const stmt = this.db.prepare(sql);
    return stmt.all(tenantId) as SaleRow[];
  }

  findById(id: string): SaleWithItems | undefined {
    const saleStmt = this.db.prepare('SELECT * FROM sales WHERE id = ?');
    const sale = saleStmt.get(id) as SaleRow | undefined;

    if (!sale) return undefined;

    const itemsStmt = this.db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
    const items = itemsStmt.all(id) as SaleItemRow[];

    return { ...sale, items };
  }

  create(
    sale: Omit<SaleRow, 'created_at'>,
    items: Omit<SaleItemRow, 'created_at'>[]
  ): SaleWithItems {
    const transaction = this.db.transaction(() => {
      // Insert sale
      const saleStmt = this.db.prepare(`
        INSERT INTO sales (
          id, tenant_id, customer_id, total_amount, discount,
          final_amount, payment_method, timestamp, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      saleStmt.run(
        sale.id,
        sale.tenant_id,
        sale.customer_id,
        sale.total_amount,
        sale.discount,
        sale.final_amount,
        sale.payment_method,
        sale.timestamp,
        sale.synced
      );

      // Insert sale items
      const itemStmt = this.db.prepare(`
        INSERT INTO sale_items (
          id, sale_id, product_id, product_name,
          quantity, unit_price, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        itemStmt.run(
          item.id,
          item.sale_id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.total
        );

        // Update product stock
        const updateStockStmt = this.db.prepare(`
          UPDATE products
          SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        updateStockStmt.run(item.quantity, item.product_id);
      }
    });

    transaction();
    return this.findById(sale.id)!;
  }

  getTotalSalesByTenant(tenantId: string, startDate?: string, endDate?: string): number {
    let sql = `
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM sales
      WHERE tenant_id = ?
    `;
    const params: any[] = [tenantId];

    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }

    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params) as { total: number };
    return result.total;
  }

  getSalesCountByTenant(tenantId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM sales WHERE tenant_id = ?
    `);
    const result = stmt.get(tenantId) as { count: number };
    return result.count;
  }

  getTopProducts(tenantId: string, limit: number = 5): Array<{ name: string; quantity: number }> {
    const stmt = this.db.prepare(`
      SELECT
        si.product_name as name,
        SUM(si.quantity) as quantity
      FROM sale_items si
      INNER JOIN sales s ON si.sale_id = s.id
      WHERE s.tenant_id = ?
      GROUP BY si.product_name
      ORDER BY quantity DESC
      LIMIT ?
    `);
    return stmt.all(tenantId, limit) as Array<{ name: string; quantity: number }>;
  }

  delete(id: string): boolean {
    const transaction = this.db.transaction(() => {
      // Delete sale items first (due to foreign key)
      const deleteItemsStmt = this.db.prepare('DELETE FROM sale_items WHERE sale_id = ?');
      deleteItemsStmt.run(id);

      // Delete sale
      const deleteSaleStmt = this.db.prepare('DELETE FROM sales WHERE id = ?');
      return deleteSaleStmt.run(id);
    });

    const result = transaction();
    return result.changes > 0;
  }
}
