-- ============================================
-- Fix: Insert missing debt-only transactions and update existing
-- 88 records with Paid=0, Debt>0 (fully unpaid)
-- 10 records with Paid>0, Debt>0 (partially paid)
-- Total: 206,001,907 UZS
-- ============================================

-- First, ensure debt column exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debt DECIMAL(15,2) DEFAULT 0;

-- Insert missing debt-only transactions (Paid = 0, Debt > 0)
-- These customers owe money but haven't paid anything yet

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-03-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-03-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-04-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-04-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-05-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-05-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ALL TECH NDT', 0, 1600000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-05-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ALL TECH NDT' 
  AND transaction_date = '2024-05-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'PS CLOUD SERVICES', 0, 1600000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'PS CLOUD SERVICES' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TRINITY CENTER', 0, 1500000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TRINITY CENTER' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'SGGROUP-U', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'SGGROUP-U' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ALL TECH NDT', 0, 1600000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ALL TECH NDT' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TURECODE', 0, 800000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TURECODE' 
  AND transaction_date = '2024-06-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-07-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-07-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'EXPORTGROUP', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-07-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'EXPORTGROUP' 
  AND transaction_date = '2024-07-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'IMPEX COMMUNITY', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'IMPEX COMMUNITY' 
  AND transaction_date = '2024-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'EXPORTGROUP', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'EXPORTGROUP' 
  AND transaction_date = '2024-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'IMPEX COMMUNITY', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'IMPEX COMMUNITY' 
  AND transaction_date = '2024-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TOSHKENT MED TEX CA', 0, 1250000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TOSHKENT MED TEX CA' 
  AND transaction_date = '2024-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TRINITY CENTER', 0, 1500000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TRINITY CENTER' 
  AND transaction_date = '2024-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'AFSUN TRADING', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'AFSUN TRADING' 
  AND transaction_date = '2024-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'Tahirov Ilyos', 0, 1500000,
  (SELECT id FROM service_types WHERE code = 'flex' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'Tahirov Ilyos' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TOSHKENT MED TEX CA', 0, 1250000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TOSHKENT MED TEX CA' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ICC OILS AND FATS TAS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ICC OILS AND FATS TAS' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'INNOSPHERE', 0, 451613,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'INNOSPHERE' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ENDORPHIN ADVERTISING', 0, 1000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ENDORPHIN ADVERTISING' 
  AND transaction_date = '2024-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TOSHKENT MED TEX CA', 0, 1250000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TOSHKENT MED TEX CA' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TECHCELLS', 0, 1200000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TECHCELLS' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'EXPORTGROUP MINERALS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'EXPORTGROUP MINERALS' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ICC OILS AND FATS TAS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ICC OILS AND FATS TAS' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'INNOSPHERE', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'INNOSPHERE' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ENDORPHIN ADVERTISING', 0, 1000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ENDORPHIN ADVERTISING' 
  AND transaction_date = '2024-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MIGRANT', 0, 1600000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MIGRANT' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TOSHKENT MED TEX CA', 0, 1250000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TOSHKENT MED TEX CA' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TUERREDDA', 0, 1800000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TUERREDDA' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TECHCELLS', 0, 1200000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TECHCELLS' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'EXPORTGROUP MINERALS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'EXPORTGROUP MINERALS' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ICC OILS AND FATS TAS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ICC OILS AND FATS TAS' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'INNOSPHERE', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'INNOSPHERE' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MANSURBEK BIZNES IMKONI', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MANSURBEK BIZNES IMKONI' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TIMELESS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TIMELESS' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'NASRULLO QURULISH TORG', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'NASRULLO QURULISH TORG' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'KAMILLAXON DOKONI', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'KAMILLAXON DOKONI' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ENDORPHIN ADVERTISING', 0, 1000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ENDORPHIN ADVERTISING' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ALFA TURK', 0, 1000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ALFA TURK' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'RAFEX', 0, 1000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'RAFEX' 
  AND transaction_date = '2024-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TIMELESS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-01-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TIMELESS' 
  AND transaction_date = '2025-01-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TIMELESS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-02-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TIMELESS' 
  AND transaction_date = '2025-02-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'TIMELESS', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-03-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'TIMELESS' 
  AND transaction_date = '2025-03-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'NAZ-OZ', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-05-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'NAZ-OZ' 
  AND transaction_date = '2025-05-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MIDAS OPERATION', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MIDAS OPERATION' 
  AND transaction_date = '2025-07-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'YUNONA MERKURIY', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'YUNONA MERKURIY' 
  AND transaction_date = '2025-07-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MUSAIT TECH', 0, 375000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MUSAIT TECH' 
  AND transaction_date = '2025-07-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'FRESH TOUR', 0, 10000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'FRESH TOUR' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'GEONA-GROUP', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'GEONA-GROUP' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MIDAS OPERATION', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MIDAS OPERATION' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'YUNONA MERKURIY', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'YUNONA MERKURIY' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MUSAIT TECH', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MUSAIT TECH' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MAKMART EAST', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MAKMART EAST' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'UNOMED', 0, 322580,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'UNOMED' 
  AND transaction_date = '2025-08-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'FRESH TOUR', 0, 10000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'FRESH TOUR' 
  AND transaction_date = '2025-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MAKMART EAST', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MAKMART EAST' 
  AND transaction_date = '2025-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'WHITE HILL CAPITAL', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'WHITE HILL CAPITAL' 
  AND transaction_date = '2025-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'UNION CAFE', 0, 2800000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'UNION CAFE' 
  AND transaction_date = '2025-09-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'FRESH TOUR', 0, 10000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'FRESH TOUR' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'PGM RESOURCE CA', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'PGM RESOURCE CA' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MAKMART EAST', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MAKMART EAST' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'LUMIKIDY', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'LUMIKIDY' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'WHITE HILL CAPITAL', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'WHITE HILL CAPITAL' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' 
  AND transaction_date = '2025-10-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'FRESH TOUR', 0, 5000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'FRESH TOUR' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ACE GROUP CONSULTANTS-HR PARTNERS', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ACE GROUP CONSULTANTS-HR PARTNERS' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'PGM RESOURCE CA', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'PGM RESOURCE CA' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'MAKMART EAST', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'MAKMART EAST' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'THEMAESTRO STUDIO', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'THEMAESTRO STUDIO' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'WHITE HILL CAPITAL', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'WHITE HILL CAPITAL' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'UFA BUILDGROUP', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'UFA BUILDGROUP' 
  AND transaction_date = '2025-11-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'Lumikidy', 0, 6000000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'Lumikidy' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'LENOVO INT. COO. (иностранная компания)', 0, 20417000,
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'LENOVO INT. COO. (иностранная компания)' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'ACE GROUP CONSULTANTS-HR PARTNERS', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'ACE GROUP CONSULTANTS-HR PARTNERS' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'PGM RESOURCE CA', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'PGM RESOURCE CA' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'LUMIKIDY', 0, 6720000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'LUMIKIDY' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'THEMAESTRO STUDIO', 0, 2000000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'THEMAESTRO STUDIO' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'RADIANCE GROUP', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'RADIANCE GROUP' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'WHITE HILL CAPITAL', 0, 700000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'WHITE HILL CAPITAL' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

INSERT INTO transactions (
  transaction_number, customer_name, amount, debt, service_type_id, payment_method_id,
  branch_id, agent_id, transaction_date, notes
)
SELECT 
  'TXN-DEBT-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1 FROM transactions WHERE transaction_number LIKE 'TXN-DEBT-%')::TEXT, 5, '0'),
  'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000,
  (SELECT id FROM service_types WHERE code = 'e_ijara' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01',
  'Debt-only record (unpaid)'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' 
  AND transaction_date = '2025-12-01' 
  AND branch_id = 'labzak'
  AND amount = 0
);

-- Update partially paid transactions (Paid > 0, Debt > 0)
UPDATE transactions SET debt = 130000 WHERE customer_name = 'ENDORPHIN ADVERTISING' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND ABS(amount - 870000) < 1000;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND ABS(amount - 1000000) < 1000;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND ABS(amount - 1000000) < 1000;
UPDATE transactions SET debt = 500000 WHERE customer_name = 'Xojiakbar Zokirbekov' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND ABS(amount - 2500000) < 1000;
UPDATE transactions SET debt = 900000 WHERE customer_name = 'Sayfuddinov A''lo' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND ABS(amount - 600000) < 1000;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2025-01-01' AND branch_id = 'labzak' AND ABS(amount - 1000000) < 1000;
UPDATE transactions SET debt = 785714 WHERE customer_name = 'WELMONDE DIGITAL HEALTHCARE' AND transaction_date = '2025-03-01' AND branch_id = 'labzak' AND ABS(amount - 1214286) < 1000;
UPDATE transactions SET debt = 900000 WHERE customer_name = 'Murod Erkinboyev' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND ABS(amount - 600000) < 1000;
UPDATE transactions SET debt = 1300000 WHERE customer_name = 'BE WOMAN HAPPY WOMANS ACADEMY' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND ABS(amount - 700000) < 1000;
UPDATE transactions SET debt = 200000 WHERE customer_name = 'TURON TELECOM' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND ABS(amount - 11800000) < 1000;

-- Summary
DO $$
DECLARE
  v_total_debt DECIMAL;
  v_count INT;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(debt), 0) INTO v_count, v_total_debt
  FROM transactions WHERE debt > 0 AND branch_id = 'labzak';
  
  RAISE NOTICE 'Total debt records: %, Total debt: % UZS', v_count, v_total_debt;
END $$;
