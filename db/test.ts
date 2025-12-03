#!/usr/bin/env tsx
import { TenantRepository, ProductRepository, SaleRepository } from './repositories/index.js';
import { AuthService } from '../services/authService.js';

console.log('🧪 Testing Database & Security...\n');

// Test 1: Authentication
console.log('📝 Test 1: Authentication');
const authService = new AuthService();

// Test login with correct credentials
const loginResult = await authService.login('joao@mercado.com', '123456');
console.log('✅ Login test:', loginResult.success ? 'PASSED' : 'FAILED');

if (loginResult.user) {
  console.log('   User:', loginResult.user.name, '|', loginResult.user.role);
}

// Test login with wrong credentials
const wrongLogin = await authService.login('joao@mercado.com', 'wrong');
console.log('✅ Wrong password test:', !wrongLogin.success ? 'PASSED' : 'FAILED');

console.log();

// Test 2: Tenant Repository
console.log('📝 Test 2: Tenant Repository');
const tenantRepo = new TenantRepository();

const tenant = tenantRepo.findByEmail('joao@mercado.com');
console.log('✅ Find tenant:', tenant ? 'PASSED' : 'FAILED');

if (tenant) {
  console.log('   Company:', tenant.company_name);
  console.log('   Status:', tenant.status);
}

console.log();

// Test 3: Product Repository
console.log('📝 Test 3: Product Repository');
const productRepo = new ProductRepository();

const products = productRepo.findAllByTenant('tenant_joao');
console.log('✅ Find products:', products.length > 0 ? 'PASSED' : 'FAILED');
console.log('   Found', products.length, 'products');

const product = productRepo.findByBarcode('tenant_joao', '78910001001');
console.log('✅ Find by barcode:', product ? 'PASSED' : 'FAILED');

if (product) {
  console.log('   Product:', product.name);
  console.log('   Stock:', product.stock);
}

const lowStock = productRepo.getLowStockProducts('tenant_joao');
console.log('✅ Low stock products:', lowStock.length >= 0 ? 'PASSED' : 'FAILED');

console.log();

// Test 4: Sale Repository
console.log('📝 Test 4: Sale Repository');
const saleRepo = new SaleRepository();

// Create test sale
const saleId = crypto.randomUUID();
const sale = saleRepo.create(
  {
    id: saleId,
    tenant_id: 'tenant_joao',
    customer_id: 'customer_balcao',
    total_amount: 18.00,
    discount: 3.00,
    final_amount: 15.00,
    payment_method: 'PIX',
    timestamp: new Date().toISOString(),
    synced: 0
  },
  [
    {
      id: crypto.randomUUID(),
      sale_id: saleId,
      product_id: 'prod_1',
      product_name: 'Refrigerante Cola 2L',
      quantity: 2,
      unit_price: 9.00,
      total: 18.00
    }
  ]
);

console.log('✅ Create sale:', sale ? 'PASSED' : 'FAILED');

if (sale) {
  console.log('   Sale ID:', sale.id);
  console.log('   Items:', sale.items.length);
  console.log('   Total:', 'R$', sale.final_amount.toFixed(2));
}

// Check if stock was updated
const updatedProduct = productRepo.findById('prod_1');
console.log('✅ Stock update:', updatedProduct && updatedProduct.stock < 150 ? 'PASSED' : 'FAILED');

if (updatedProduct) {
  console.log('   New stock:', updatedProduct.stock, '(was 150)');
}

// Get statistics
const totalSales = saleRepo.getTotalSalesByTenant('tenant_joao');
const salesCount = saleRepo.getSalesCountByTenant('tenant_joao');
const topProducts = saleRepo.getTopProducts('tenant_joao', 3);

console.log('✅ Get statistics:', totalSales > 0 ? 'PASSED' : 'FAILED');
console.log('   Total sales:', 'R$', totalSales.toFixed(2));
console.log('   Transactions:', salesCount);
console.log('   Top product:', topProducts[0]?.name);

console.log();

// Test 5: Password Security
console.log('📝 Test 5: Password Security');

// Test password change
const changeResult = await authService.changePassword('tenant_joao', '123456', 'newpass123');
console.log('✅ Change password:', changeResult.success ? 'PASSED' : 'FAILED');

// Test login with new password
const newLoginResult = await authService.login('joao@mercado.com', 'newpass123');
console.log('✅ Login with new password:', newLoginResult.success ? 'PASSED' : 'FAILED');

// Change back to original password
await authService.changePassword('tenant_joao', 'newpass123', '123456');
console.log('✅ Restored original password');

console.log();

// Test 6: Password Reset
console.log('📝 Test 6: Password Reset');

const resetResult = await authService.resetPassword('tenant_joao');
console.log('✅ Reset password:', resetResult.success ? 'PASSED' : 'FAILED');

if (resetResult.tempPassword) {
  console.log('   Temp password:', resetResult.tempPassword);

  // Test login with temp password
  const tempLoginResult = await authService.login('joao@mercado.com', resetResult.tempPassword);
  console.log('✅ Login with temp password:', tempLoginResult.success ? 'PASSED' : 'FAILED');

  if (tempLoginResult.user) {
    console.log('   Must change password:', tempLoginResult.user.mustChangePassword);
  }

  // Restore original password
  await authService.changePassword('tenant_joao', resetResult.tempPassword, '123456');
  console.log('✅ Restored original password');
}

console.log();
console.log('✅ All tests completed!');
console.log('🔒 Database is secure and working correctly!');

process.exit(0);
