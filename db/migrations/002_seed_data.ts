import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

export const up = (db: Database.Database): void => {
  // Insert default plan
  const insertPlan = db.prepare(`
    INSERT INTO plans (id, name, product_limit, user_limit, implementation_fee, support_fee, features)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPlan.run(
    'plan_demo',
    'Plano Pro (Demo)',
    500,
    3,
    150.00,
    99.90,
    JSON.stringify(['Suporte Prioritário', 'Gestão de Estoque', 'Múltiplos Usuários'])
  );

  // Insert demo tenant (João)
  const insertTenant = db.prepare(`
    INSERT INTO tenants (
      id, company_name, owner_name, email, password_hash,
      document, plan_id, status, monthly_fee, next_billing,
      joined_at, must_change_password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const joaoPasswordHash = bcrypt.hashSync('123456', 10);
  const now = new Date().toISOString();
  const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  insertTenant.run(
    'tenant_joao',
    'Mercadinho do João',
    'João Silva',
    'joao@mercado.com',
    joaoPasswordHash,
    '12.345.678/0001-99',
    'plan_demo',
    'Active',
    99.90,
    nextBilling,
    now,
    0
  );

  // Insert demo products for João
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, tenant_id, code, barcode, name, category, unit,
      cost_price, sale_price, stock, min_stock, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    'prod_1',
    'tenant_joao',
    'PROD001',
    '78910001001',
    'Refrigerante Cola 2L',
    'Bebidas',
    'UN',
    5.50,
    9.00,
    150,
    20,
    'ATIVO'
  );

  insertProduct.run(
    'prod_2',
    'tenant_joao',
    'PROD002',
    '78910001002',
    'Arroz Branco 5kg',
    'Alimentos',
    'UN',
    18.00,
    24.90,
    45,
    10,
    'ATIVO'
  );

  // Insert default customer (Cliente Balcão)
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, tenant_id, name, document, phone, credit_limit, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run(
    'customer_balcao',
    'tenant_joao',
    'Cliente Balcão',
    '00000000000',
    '',
    0,
    1
  );

  console.log('✅ Seed data inserted successfully');
};

export const down = (db: Database.Database): void => {
  db.exec(`
    DELETE FROM customers WHERE tenant_id = 'tenant_joao';
    DELETE FROM products WHERE tenant_id = 'tenant_joao';
    DELETE FROM tenants WHERE id = 'tenant_joao';
    DELETE FROM plans WHERE id = 'plan_demo';
  `);

  console.log('✅ Seed data removed successfully');
};
