-- Branch Finances Module
-- Phase 1: Core accounting tables with double-entry support

-- ============================================
-- 1. ADD FINANCE SETTINGS TO BRANCHES
-- ============================================
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS special_fund_percentage DECIMAL(5,2) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS allocation_threshold DECIMAL(18,2) DEFAULT 3000000,
ADD COLUMN IF NOT EXISTS expense_auto_approval_limit DECIMAL(18,2) DEFAULT 500000;

COMMENT ON COLUMN branches.special_fund_percentage IS 'Percentage of profit allocated to special fund (2.5-5%)';
COMMENT ON COLUMN branches.allocation_threshold IS 'Trigger allocation when dividend-ready cash exceeds this (default 3M UZS)';
COMMENT ON COLUMN branches.expense_auto_approval_limit IS 'Branch manager can auto-approve expenses up to this amount (default 500K UZS)';

-- ============================================
-- 2. CHART OF ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS finance_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  name_uz VARCHAR(100),
  name_ru VARCHAR(100),
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_code VARCHAR(10) REFERENCES finance_accounts(code),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE finance_accounts IS 'Chart of Accounts for double-entry bookkeeping';

-- Insert default Chart of Accounts
INSERT INTO finance_accounts (code, name, name_ru, account_type, display_order) VALUES
-- Assets (1xxx)
('1000', 'Assets', 'Активы', 'asset', 100),
('1100', 'Cash & Bank', 'Денежные средства', 'asset', 110),
('1101', 'Petty Cash', 'Касса (мелкие расходы)', 'asset', 111),
('1102', 'Secondary Safe', 'Вторичный сейф (ресепшн)', 'asset', 112),
('1103', 'Primary Safe', 'Основной сейф (ГМ)', 'asset', 113),
('1110', 'Bank Account', 'Банковский счет', 'asset', 114),
('1120', 'Payment Processors', 'Платежные системы', 'asset', 115),
('1121', 'Payme Balance', 'Баланс Payme', 'asset', 116),
('1122', 'Click Balance', 'Баланс Click', 'asset', 117),
('1123', 'Uzum Balance', 'Баланс Uzum', 'asset', 118),
('1124', 'Terminal Balance', 'Баланс терминала', 'asset', 119),
('1200', 'Accounts Receivable', 'Дебиторская задолженность', 'asset', 120),
('1201', 'Tenant Receivables', 'Задолженность арендаторов', 'asset', 121),

-- Liabilities (2xxx)
('2000', 'Liabilities', 'Обязательства', 'liability', 200),
('2100', 'Accounts Payable', 'Кредиторская задолженность', 'liability', 210),
('2200', 'Accrued Expenses', 'Начисленные расходы', 'liability', 220),
('2300', 'Deferred Revenue', 'Доходы будущих периодов', 'liability', 230),
('2400', 'Taxes Payable', 'Налоги к уплате', 'liability', 240),

-- Equity (3xxx)
('3000', 'Equity', 'Капитал', 'equity', 300),
('3100', 'Retained Earnings', 'Нераспределенная прибыль', 'equity', 310),
('3200', 'Current Period Earnings', 'Прибыль текущего периода', 'equity', 320),
('3300', 'Special Fund', 'Специальный фонд', 'equity', 330),
('3400', 'Dividend Pool', 'Дивидендный фонд', 'equity', 340),

-- Revenue (4xxx)
('4000', 'Revenue', 'Доходы', 'revenue', 400),
('4100', 'Office Rental Income', 'Доход от аренды офисов', 'revenue', 410),
('4200', 'Dedicated Desk Income', 'Доход от выделенных мест', 'revenue', 420),
('4300', 'Flex Membership Income', 'Доход от Flex подписок', 'revenue', 430),
('4400', 'Meeting Room Income', 'Доход от переговорных', 'revenue', 440),
('4500', 'Conference Room Income', 'Доход от конференц-залов', 'revenue', 450),
('4600', 'Virtual Office Income', 'Доход от виртуальных офисов', 'revenue', 460),
('4700', 'Service Income', 'Доход от услуг', 'revenue', 470),
('4900', 'Other Income', 'Прочие доходы', 'revenue', 490),

-- Expenses (5xxx)
('5000', 'Expenses', 'Расходы', 'expense', 500),
('5100', 'Goods & Supplies', 'Товары и материалы', 'expense', 510),
('5200', 'Utilities', 'Коммунальные услуги', 'expense', 520),
('5300', 'Staff Expenses', 'Расходы на персонал', 'expense', 530),
('5400', 'Maintenance & Repairs', 'Ремонт и обслуживание', 'expense', 540),
('5500', 'Marketing & Advertising', 'Маркетинг и реклама', 'expense', 550),
('5600', 'Taxes & Fees', 'Налоги и сборы', 'expense', 560),
('5700', 'Capital Expenditures', 'Капитальные затраты', 'expense', 570),
('5800', 'Other Operating', 'Прочие операционные', 'expense', 580)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. CUSTOMERS/TENANTS
-- ============================================
CREATE TABLE IF NOT EXISTS finance_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) NOT NULL REFERENCES branches(id),
  name VARCHAR(200) NOT NULL,
  customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('company', 'individual')),
  telegram_id VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_customers_branch ON finance_customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_finance_customers_name ON finance_customers(name);

-- ============================================
-- 4. JOURNAL ENTRIES (Double-entry core)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) NOT NULL REFERENCES branches(id),
  entry_date DATE NOT NULL,
  reference VARCHAR(50),
  description TEXT,
  status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'void')),
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_branch_date ON finance_journal_entries(branch_id, entry_date);

-- ============================================
-- 5. JOURNAL ENTRY LINES (Debit/Credit pairs)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES finance_journal_entries(id) ON DELETE CASCADE,
  account_code VARCHAR(10) NOT NULL REFERENCES finance_accounts(code),
  debit DECIMAL(18,2) DEFAULT 0,
  credit DECIMAL(18,2) DEFAULT 0,
  memo VARCHAR(200),
  CONSTRAINT check_debit_credit CHECK (
    (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0) OR (debit = 0 AND credit = 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON finance_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON finance_journal_lines(account_code);

-- ============================================
-- 6. TRANSACTIONS (User-friendly view)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) NOT NULL REFERENCES branches(id),
  journal_entry_id UUID REFERENCES finance_journal_entries(id),

  -- User-friendly fields
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('revenue', 'expense', 'transfer')),
  transaction_date DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,

  -- Revenue specific
  service_type VARCHAR(50),
  customer_id UUID REFERENCES finance_customers(id),
  customer_name VARCHAR(200),

  -- Expense specific
  expense_category VARCHAR(50),
  vendor_name VARCHAR(200),

  -- Payment info
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank', 'payme', 'click', 'uzum', 'terminal', 'transfer')),
  payment_reference VARCHAR(100),

  -- Tracking
  processed_by UUID REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),

  -- Import tracking
  imported_from VARCHAR(50),
  import_batch_id UUID,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_branch_date ON finance_transactions(branch_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON finance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_service ON finance_transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON finance_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_approval ON finance_transactions(approval_status) WHERE approval_status = 'pending';

-- ============================================
-- 7. SAFES (Cash tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_safes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) REFERENCES branches(id),
  safe_type VARCHAR(20) NOT NULL CHECK (safe_type IN ('secondary', 'primary', 'special_fund', 'dividend')),
  name VARCHAR(100) NOT NULL,
  current_balance DECIMAL(18,2) DEFAULT 0,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, safe_type)
);

COMMENT ON TABLE finance_safes IS 'Track cash balances in safes. secondary=reception, primary=GM, special_fund and dividend are company-wide';

-- ============================================
-- 8. SAFE TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS finance_safe_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safe_id UUID NOT NULL REFERENCES finance_safes(id),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
  amount DECIMAL(18,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  balance_after DECIMAL(18,2),
  performed_by UUID REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safe_transactions_safe ON finance_safe_transactions(safe_id);
CREATE INDEX IF NOT EXISTS idx_safe_transactions_date ON finance_safe_transactions(created_at);

-- ============================================
-- 9. ALLOCATIONS (Branch Manager → GM)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) NOT NULL REFERENCES branches(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Income
  total_income DECIMAL(18,2) NOT NULL,

  -- Expense allocations
  operational_expenses DECIMAL(18,2) DEFAULT 0,
  salary_reserve DECIMAL(18,2) DEFAULT 0,
  maintenance DECIMAL(18,2) DEFAULT 0,
  other_expenses DECIMAL(18,2) DEFAULT 0,

  -- Calculated fields
  gross_profit DECIMAL(18,2),
  special_fund_percentage DECIMAL(5,2),
  special_fund_amount DECIMAL(18,2),
  net_to_primary DECIMAL(18,2),

  -- Status workflow
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'transferred')),
  submitted_by UUID REFERENCES employees(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  transferred_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_allocations_branch ON finance_allocations(branch_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON finance_allocations(status);

-- ============================================
-- 10. RECEIVABLES (Debt tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) NOT NULL REFERENCES branches(id),
  customer_id UUID NOT NULL REFERENCES finance_customers(id),
  invoice_number VARCHAR(50),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  paid_amount DECIMAL(18,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'overdue', 'written_off')),
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receivables_customer ON finance_receivables(customer_id);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON finance_receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON finance_receivables(due_date) WHERE status IN ('open', 'partial', 'overdue');

-- ============================================
-- 11. IMPORT BATCHES (Track Excel imports)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id VARCHAR(50) REFERENCES branches(id),
  file_name VARCHAR(200),
  file_type VARCHAR(20),
  row_count INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  errors JSONB,
  imported_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. SERVICE TYPE MAPPING (for imports)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_service_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL UNIQUE,
  service_name_variants TEXT[], -- Alternative names for matching
  account_code VARCHAR(10) NOT NULL REFERENCES finance_accounts(code),
  is_active BOOLEAN DEFAULT true
);

-- Insert default service mappings
INSERT INTO finance_service_mappings (service_name, service_name_variants, account_code) VALUES
('Office', ARRAY['office', 'Office', 'OFFICE', 'офис'], '4100'),
('Dedicated', ARRAY['dedicated', 'Dedicated', 'DEDICATED', 'выделенный'], '4200'),
('Flex', ARRAY['flex', 'Flex', 'FLEX', 'флекс'], '4300'),
('100 Hour', ARRAY['100 hour', '100 Hour', '100 hours', '100 часов'], '4300'),
('Day Pass', ARRAY['day pass', 'Day Pass', 'daypass', 'дневной'], '4300'),
('15 Days', ARRAY['15 days', '15 Days', '15 дней'], '4300'),
('Weekpass', ARRAY['weekpass', 'Weekpass', 'week pass', 'недельный'], '4300'),
('Hour', ARRAY['hour', 'Hour', 'HOUR', 'час', 'hourly'], '4300'),
('Meeting', ARRAY['meeting', 'Meeting', 'MEETING', 'переговорная'], '4400'),
('Conference', ARRAY['conference', 'Conference', 'CONFERENCE', 'конференц'], '4500'),
('Virtual', ARRAY['virtual', 'Virtual', 'VIRTUAL', 'виртуальный'], '4600'),
('E-Ijara', ARRAY['e-ijara', 'E-Ijara', 'eijara'], '4600'),
('Service', ARRAY['service', 'Service', 'SERVICE', 'услуга'], '4700')
ON CONFLICT (service_name) DO NOTHING;

-- ============================================
-- 13. EXPENSE CATEGORY MAPPING
-- ============================================
CREATE TABLE IF NOT EXISTS finance_expense_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(100) NOT NULL UNIQUE,
  category_name_variants TEXT[],
  account_code VARCHAR(10) NOT NULL REFERENCES finance_accounts(code),
  is_active BOOLEAN DEFAULT true
);

-- Insert default expense mappings
INSERT INTO finance_expense_mappings (category_name, category_name_variants, account_code) VALUES
('Goods', ARRAY['goods', 'Goods', 'GOODS', 'товары'], '5100'),
('Utility', ARRAY['utility', 'Utility', 'UTILITY', 'коммунальные', 'utilities'], '5200'),
('Staff', ARRAY['staff', 'Staff', 'STAFF', 'персонал', 'salary'], '5300'),
('Maintenance', ARRAY['maintenance', 'Maintenance', 'MAINTENANCE', 'ремонт'], '5400'),
('Marketing', ARRAY['marketing', 'Marketing', 'MARKETING', 'маркетинг'], '5500'),
('Tax', ARRAY['tax', 'Tax', 'TAX', 'налог', 'taxes'], '5600'),
('CapEx', ARRAY['capex', 'CapEx', 'CAPEX', 'капитальные'], '5700'),
('Other', ARRAY['other', 'Other', 'OTHER', 'прочие'], '5800'),
('Charity', ARRAY['charity', 'Charity', 'благотворительность'], '5800')
ON CONFLICT (category_name) DO NOTHING;

-- ============================================
-- 14. HELPER FUNCTIONS
-- ============================================

-- Function to get account balance for a period
CREATE OR REPLACE FUNCTION get_account_balance(
  p_account_code VARCHAR(10),
  p_branch_id VARCHAR(50),
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS DECIMAL(18,2) AS $$
DECLARE
  v_balance DECIMAL(18,2);
BEGIN
  SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0)
  INTO v_balance
  FROM finance_journal_lines jl
  JOIN finance_journal_entries je ON jl.journal_entry_id = je.id
  WHERE jl.account_code = p_account_code
    AND je.branch_id = p_branch_id
    AND je.status = 'posted'
    AND (p_start_date IS NULL OR je.entry_date >= p_start_date)
    AND (p_end_date IS NULL OR je.entry_date <= p_end_date);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to create journal entry from transaction
CREATE OR REPLACE FUNCTION create_journal_from_transaction() RETURNS TRIGGER AS $$
DECLARE
  v_journal_id UUID;
  v_debit_account VARCHAR(10);
  v_credit_account VARCHAR(10);
BEGIN
  -- Determine accounts based on transaction type and payment method
  IF NEW.transaction_type = 'revenue' THEN
    -- Debit: Cash/Bank/Payment processor
    v_debit_account := CASE NEW.payment_method
      WHEN 'cash' THEN '1102'      -- Secondary Safe
      WHEN 'bank' THEN '1110'      -- Bank Account
      WHEN 'payme' THEN '1121'     -- Payme Balance
      WHEN 'click' THEN '1122'     -- Click Balance
      WHEN 'uzum' THEN '1123'      -- Uzum Balance
      WHEN 'terminal' THEN '1124' -- Terminal Balance
      ELSE '1102'
    END;

    -- Credit: Revenue account based on service type
    SELECT account_code INTO v_credit_account
    FROM finance_service_mappings
    WHERE service_name = NEW.service_type
    LIMIT 1;

    IF v_credit_account IS NULL THEN
      v_credit_account := '4900'; -- Other Income
    END IF;

  ELSIF NEW.transaction_type = 'expense' THEN
    -- Debit: Expense account
    SELECT account_code INTO v_debit_account
    FROM finance_expense_mappings
    WHERE category_name = NEW.expense_category
    LIMIT 1;

    IF v_debit_account IS NULL THEN
      v_debit_account := '5800'; -- Other Operating
    END IF;

    -- Credit: Cash/Bank
    v_credit_account := CASE NEW.payment_method
      WHEN 'cash' THEN '1102'
      WHEN 'bank' THEN '1110'
      ELSE '1102'
    END;
  END IF;

  -- Create journal entry
  INSERT INTO finance_journal_entries (branch_id, entry_date, reference, description, created_by)
  VALUES (NEW.branch_id, NEW.transaction_date, NEW.id::TEXT, NEW.notes, NEW.processed_by)
  RETURNING id INTO v_journal_id;

  -- Create journal lines
  INSERT INTO finance_journal_lines (journal_entry_id, account_code, debit, credit, memo)
  VALUES
    (v_journal_id, v_debit_account, NEW.amount, 0, NEW.customer_name),
    (v_journal_id, v_credit_account, 0, NEW.amount, NEW.customer_name);

  -- Update transaction with journal reference
  NEW.journal_entry_id := v_journal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto journal entry
DROP TRIGGER IF EXISTS trg_create_journal_from_transaction ON finance_transactions;
CREATE TRIGGER trg_create_journal_from_transaction
  BEFORE INSERT ON finance_transactions
  FOR EACH ROW
  WHEN (NEW.journal_entry_id IS NULL)
  EXECUTE FUNCTION create_journal_from_transaction();

-- ============================================
-- 15. INITIAL SAFE SETUP (Run after branch data exists)
-- ============================================
-- This will be populated when branches access the finance module

-- ============================================
-- 16. ROW LEVEL SECURITY (Optional - enable if needed)
-- ============================================
-- ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY branch_isolation ON finance_transactions
--   USING (branch_id = current_setting('app.current_branch', true));

COMMENT ON TABLE finance_transactions IS 'Main transaction table - user-friendly view of all money movements';
COMMENT ON TABLE finance_journal_entries IS 'Double-entry journal headers - system-managed';
COMMENT ON TABLE finance_journal_lines IS 'Double-entry journal lines with debits/credits - system-managed';
