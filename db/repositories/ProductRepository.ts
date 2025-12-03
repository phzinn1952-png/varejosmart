import Database from 'better-sqlite3';
import { getDatabase } from '../database.js';

export interface ProductRow {
  id: string;
  tenant_id: string;
  code: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category: string;
  unit: 'UN' | 'KG' | 'LT' | 'MT';
  cost_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  image: string | null;
  status: 'ATIVO' | 'INATIVO';
  created_at: string;
  updated_at: string;
}

export class ProductRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAllByTenant(tenantId: string): ProductRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM products
      WHERE tenant_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(tenantId) as ProductRow[];
  }

  findById(id: string): ProductRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM products WHERE id = ?
    `);
    return stmt.get(id) as ProductRow | undefined;
  }

  findByBarcode(tenantId: string, barcode: string): ProductRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM products
      WHERE tenant_id = ? AND barcode = ?
    `);
    return stmt.get(tenantId, barcode) as ProductRow | undefined;
  }

  findByCode(tenantId: string, code: string): ProductRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM products
      WHERE tenant_id = ? AND code = ?
    `);
    return stmt.get(tenantId, code) as ProductRow | undefined;
  }

  create(product: Omit<ProductRow, 'created_at' | 'updated_at'>): ProductRow {
    const stmt = this.db.prepare(`
      INSERT INTO products (
        id, tenant_id, code, barcode, name, description, category,
        unit, cost_price, sale_price, stock, min_stock, image, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      product.id,
      product.tenant_id,
      product.code,
      product.barcode,
      product.name,
      product.description,
      product.category,
      product.unit,
      product.cost_price,
      product.sale_price,
      product.stock,
      product.min_stock,
      product.image,
      product.status
    );

    return this.findById(product.id)!;
  }

  update(id: string, data: Partial<Omit<ProductRow, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): ProductRow | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE products SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  updateStock(id: string, quantity: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE products
      SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(quantity, id);
    return result.changes > 0;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  searchByName(tenantId: string, searchTerm: string): ProductRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM products
      WHERE tenant_id = ? AND name LIKE ?
      ORDER BY name
    `);
    return stmt.all(tenantId, `%${searchTerm}%`) as ProductRow[];
  }

  getLowStockProducts(tenantId: string): ProductRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM products
      WHERE tenant_id = ? AND stock <= min_stock AND status = 'ATIVO'
      ORDER BY stock ASC
    `);
    return stmt.all(tenantId) as ProductRow[];
  }
}
