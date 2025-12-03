import Database from 'better-sqlite3';
import { getDatabase } from '../database.js';
import bcrypt from 'bcryptjs';

export interface TenantRow {
  id: string;
  company_name: string;
  owner_name: string;
  email: string;
  password_hash: string;
  document: string;
  plan_id: string;
  status: 'Active' | 'Blocked' | 'Pending';
  monthly_fee: number;
  next_billing: string;
  joined_at: string;
  must_change_password: number;
  created_at: string;
  updated_at: string;
}

export class TenantRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  findAll(): TenantRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tenants ORDER BY created_at DESC
    `);
    return stmt.all() as TenantRow[];
  }

  findById(id: string): TenantRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM tenants WHERE id = ?
    `);
    return stmt.get(id) as TenantRow | undefined;
  }

  findByEmail(email: string): TenantRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM tenants WHERE email = ?
    `);
    return stmt.get(email) as TenantRow | undefined;
  }

  create(tenant: Omit<TenantRow, 'created_at' | 'updated_at'>): TenantRow {
    const stmt = this.db.prepare(`
      INSERT INTO tenants (
        id, company_name, owner_name, email, password_hash,
        document, plan_id, status, monthly_fee, next_billing,
        joined_at, must_change_password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tenant.id,
      tenant.company_name,
      tenant.owner_name,
      tenant.email,
      tenant.password_hash,
      tenant.document,
      tenant.plan_id,
      tenant.status,
      tenant.monthly_fee,
      tenant.next_billing,
      tenant.joined_at,
      tenant.must_change_password
    );

    return this.findById(tenant.id)!;
  }

  update(id: string, data: Partial<Omit<TenantRow, 'id' | 'created_at' | 'updated_at'>>): TenantRow | undefined {
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
      UPDATE tenants SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tenants WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  verifyPassword(email: string, password: string): TenantRow | null {
    const tenant = this.findByEmail(email);
    if (!tenant) return null;

    const isValid = bcrypt.compareSync(password, tenant.password_hash);
    return isValid ? tenant : null;
  }

  updatePassword(id: string, newPassword: string): boolean {
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const stmt = this.db.prepare(`
      UPDATE tenants
      SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(passwordHash, id);
    return result.changes > 0;
  }

  resetPassword(id: string): string {
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    const stmt = this.db.prepare(`
      UPDATE tenants
      SET password_hash = ?, must_change_password = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(passwordHash, id);
    return tempPassword;
  }
}
