
import { Product, ProductStatus, UnitOfMeasure, Customer, PlanConfig, Tenant } from './types';

// Plano Demo para o João
export const PLANS: Record<string, PlanConfig> = {
  'plan_demo': {
    id: 'plan_demo',
    name: 'Plano Pro (Demo)',
    productLimit: 500,
    userLimit: 3,
    implementationFee: 150.00,
    supportFee: 99.90,
    features: ['Suporte Prioritário', 'Gestão de Estoque', 'Múltiplos Usuários']
  }
};

// Usuário Cliente solicitado: João
export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant_joao',
    companyName: 'Mercadinho do João',
    ownerName: 'João Silva',
    email: 'joao@mercado.com',
    document: '12.345.678/0001-99',
    plan: 'plan_demo',
    status: 'Active',
    joinedAt: new Date().toISOString(),
    nextBilling: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    monthlyFee: 99.90,
    mustChangePassword: false // False para ele logar direto com 123456 sem trocar
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    code: 'PROD001',
    barcode: '78910001001',
    name: 'Refrigerante Cola 2L',
    category: 'Bebidas',
    unit: UnitOfMeasure.UN,
    costPrice: 5.50,
    salePrice: 9.00,
    stock: 150,
    minStock: 20,
    status: ProductStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    code: 'PROD002',
    barcode: '78910001002',
    name: 'Arroz Branco 5kg',
    category: 'Alimentos',
    unit: UnitOfMeasure.UN,
    costPrice: 18.00,
    salePrice: 24.90,
    stock: 45,
    minStock: 10,
    status: ProductStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    image: 'https://picsum.photos/200/200?random=2'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Cliente Balcão',
    document: '00000000000',
    phone: '',
    creditLimit: 0,
    active: true
  }
];
