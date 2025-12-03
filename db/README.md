# Banco de Dados VarejoSmart

## 📚 Visão Geral

Este projeto utiliza **SQLite** com **better-sqlite3** para armazenamento local de dados, proporcionando:

- ✅ Banco de dados relacional completo
- 🔒 Segurança com bcrypt para senhas
- 🚀 Alta performance com WAL mode
- 📦 Zero configuração necessária
- 💾 Armazenamento local persistente

## 🏗️ Estrutura

```
db/
├── database.ts          # Configuração da conexão
├── migrate.ts           # Sistema de migrações
├── init.ts              # Script de inicialização
├── migrations/          # Arquivos de migração
│   ├── 001_initial_schema.ts
│   └── 002_seed_data.ts
├── repositories/        # Camada de acesso a dados (DAL)
│   ├── TenantRepository.ts
│   ├── ProductRepository.ts
│   └── SaleRepository.ts
└── varejosmart.db       # Arquivo do banco (gerado)
```

## 🗄️ Schema

### Tabelas Principais

- **tenants**: Inquilinos/Clientes do sistema
- **plans**: Planos de assinatura
- **products**: Produtos do estoque
- **customers**: Clientes finais
- **sales** & **sale_items**: Vendas e itens vendidos
- **tenant_users**: Funcionários/Usuários
- **suppliers**: Fornecedores
- **system_updates**: Atualizações do sistema

## 🔐 Segurança

### Senhas

- Todas as senhas são hasheadas com **bcrypt** (10 rounds)
- Nunca armazena senhas em texto puro
- Suporta reset de senha com geração automática

### Integridade

- Foreign keys habilitadas
- Constraints de validação
- Transações ACID

### Exemplos

```typescript
// Criar senha segura
const passwordHash = bcrypt.hashSync('123456', 10);

// Verificar senha
const isValid = bcrypt.compareSync(password, passwordHash);
```

## 📝 Comandos

### Migrations

```bash
# Executar migrações pendentes
npm run db:setup

# Fazer rollback da última migração
npm run db:rollback
```

### Inicialização

```bash
# Configurar banco de dados pela primeira vez
npx tsx db/init.ts
```

## 🔄 Uso dos Repositórios

### TenantRepository

```typescript
import { TenantRepository } from './db/repositories';

const tenantRepo = new TenantRepository();

// Buscar por email
const tenant = tenantRepo.findByEmail('joao@mercado.com');

// Verificar senha
const validTenant = tenantRepo.verifyPassword('joao@mercado.com', '123456');

// Atualizar senha
tenantRepo.updatePassword(tenantId, 'newPassword');

// Reset de senha
const tempPassword = tenantRepo.resetPassword(tenantId);
```

### ProductRepository

```typescript
import { ProductRepository } from './db/repositories';

const productRepo = new ProductRepository();

// Listar produtos de um tenant
const products = productRepo.findAllByTenant(tenantId);

// Buscar por código de barras
const product = productRepo.findByBarcode(tenantId, '78910001001');

// Atualizar estoque
productRepo.updateStock(productId, -5); // Subtrai 5 unidades

// Produtos com estoque baixo
const lowStock = productRepo.getLowStockProducts(tenantId);
```

### SaleRepository

```typescript
import { SaleRepository } from './db/repositories';

const saleRepo = new SaleRepository();

// Registrar venda (transação completa)
const sale = saleRepo.create(
  {
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    customer_id: customerId,
    total_amount: 100.00,
    discount: 10.00,
    final_amount: 90.00,
    payment_method: 'PIX',
    timestamp: new Date().toISOString(),
    synced: 0
  },
  [
    {
      id: crypto.randomUUID(),
      sale_id: saleId,
      product_id: productId,
      product_name: 'Produto Exemplo',
      quantity: 2,
      unit_price: 50.00,
      total: 100.00
    }
  ]
);

// Estatísticas
const totalSales = saleRepo.getTotalSalesByTenant(tenantId);
const topProducts = saleRepo.getTopProducts(tenantId, 5);
```

## 🛠️ Criando uma Nova Migration

1. Criar arquivo em `db/migrations/`
2. Exportar funções `up` e `down`
3. Registrar no `migrate.ts`

Exemplo:

```typescript
// db/migrations/003_add_new_field.ts
import Database from 'better-sqlite3';

export const up = (db: Database.Database): void => {
  db.exec(`
    ALTER TABLE tenants ADD COLUMN phone TEXT;
  `);
  console.log('✅ Phone field added');
};

export const down = (db: Database.Database): void => {
  // SQLite não suporta DROP COLUMN diretamente
  console.log('⚠️ Rollback not fully supported');
};
```

## 🎯 Dados de Teste

O sistema vem com dados pré-configurados:

### Tenant Padrão
- Email: `joao@mercado.com`
- Senha: `123456`
- Empresa: Mercadinho do João

### Produtos
- Refrigerante Cola 2L (estoque: 150)
- Arroz Branco 5kg (estoque: 45)

## ⚡ Performance

### Índices

O sistema cria índices automaticamente para:
- `products.tenant_id`
- `products.barcode`
- `sales.tenant_id`
- `sales.timestamp`
- Outros campos frequentemente consultados

### WAL Mode

O banco usa Write-Ahead Logging para:
- Melhor performance em escrita
- Leitura concorrente
- Maior durabilidade

## 📊 Backup

```bash
# Backup manual
cp db/varejosmart.db db/backups/varejosmart_$(date +%Y%m%d).db

# O arquivo pode ser copiado diretamente
# Arquivos WAL (.db-wal) e SHM (.db-shm) são temporários
```

## 🔍 Debugging

```typescript
// Ativar logs SQL (já configurado)
const db = new Database(DB_PATH, { verbose: console.log });

// Executar query diretamente
const result = db.prepare('SELECT * FROM tenants').all();
console.log(result);
```

## ⚠️ Considerações

- O arquivo `.db` NÃO deve ser commitado no git
- Backups devem ser feitos regularmente
- Para produção, considere PostgreSQL ou MySQL
- SQLite é excelente para desenvolvimento e aplicações desktop
