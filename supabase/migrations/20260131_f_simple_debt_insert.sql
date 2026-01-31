-- SIMPLE FIX: Insert missing debt-only transactions
-- Run this in Supabase SQL Editor
-- 88 records, 198,286,193 UZS

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00001', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-03-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00001');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00002', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-04-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00002');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00003', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-05-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00003');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00004', 'ALL TECH NDT', 0, 1600000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-05-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00004');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00005', 'PS CLOUD SERVICES', 0, 1600000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00005');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00006', 'TRINITY CENTER', 0, 1500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00006');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00007', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00007');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00008', 'SGGROUP-U', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00008');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00009', 'ALL TECH NDT', 0, 1600000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00009');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00010', 'TURECODE', 0, 800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-06-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00010');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00011', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-07-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00011');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00012', 'EXPORTGROUP', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-07-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00012');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00013', 'IMPEX COMMUNITY', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00013');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00014', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00014');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00015', 'EXPORTGROUP', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00015');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00016', 'IMPEX COMMUNITY', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00016');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00017', 'TOSHKENT MED TEX CA', 0, 1250000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00017');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00018', 'TRINITY CENTER', 0, 1500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00018');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00019', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00019');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00020', 'AFSUN TRADING', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00020');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00021', 'Tahirov Ilyos', 0, 1500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00021');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00022', 'TOSHKENT MED TEX CA', 0, 1250000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00022');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00023', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00023');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00024', 'ICC OILS AND FATS TAS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00024');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00025', 'INNOSPHERE', 0, 451613, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00025');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00026', 'ENDORPHIN ADVERTISING', 0, 1000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00026');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00027', 'TOSHKENT MED TEX CA', 0, 1250000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00027');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00028', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00028');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00029', 'TECHCELLS', 0, 1200000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00029');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00030', 'EXPORTGROUP MINERALS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00030');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00031', 'ICC OILS AND FATS TAS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00031');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00032', 'INNOSPHERE', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00032');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00033', 'ENDORPHIN ADVERTISING', 0, 1000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00033');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00034', 'MIGRANT', 0, 1600000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00034');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00035', 'TOSHKENT MED TEX CA', 0, 1250000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00035');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00036', 'TUERREDDA', 0, 1800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00036');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00037', 'TECHCELLS', 0, 1200000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00037');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00038', 'EXPORTGROUP MINERALS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00038');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00039', 'ICC OILS AND FATS TAS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00039');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00040', 'INNOSPHERE', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00040');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00041', 'MANSURBEK BIZNES IMKONI', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00041');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00042', 'TIMELESS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00042');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00043', 'NASRULLO QURULISH TORG', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00043');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00044', 'KAMILLAXON DOKONI', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00044');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00045', 'ENDORPHIN ADVERTISING', 0, 1000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00045');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00046', 'ALFA TURK', 0, 1000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00046');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00047', 'RAFEX', 0, 1000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2024-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00047');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00048', 'TIMELESS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-01-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00048');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00049', 'TIMELESS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-02-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00049');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00050', 'TIMELESS', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-03-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00050');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00051', 'NAZ-OZ', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-05-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00051');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00052', 'MIDAS OPERATION', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00052');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00053', 'YUNONA MERKURIY', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00053');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00054', 'MUSAIT TECH', 0, 375000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-07-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00054');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00055', 'FRESH TOUR', 0, 10000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00055');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00056', 'GEONA-GROUP', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00056');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00057', 'MIDAS OPERATION', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00057');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00058', 'YUNONA MERKURIY', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00058');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00059', 'MUSAIT TECH', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00059');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00060', 'MAKMART EAST', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00060');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00061', 'UNOMED', 0, 322580, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-08-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00061');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00062', 'FRESH TOUR', 0, 10000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00062');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00063', 'MAKMART EAST', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00063');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00064', 'WHITE HILL CAPITAL', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00064');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00065', 'UNION CAFE', 0, 2800000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-09-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00065');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00066', 'FRESH TOUR', 0, 10000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00066');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00067', 'PGM RESOURCE CA', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00067');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00068', 'MAKMART EAST', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00068');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00069', 'LUMIKIDY', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00069');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00070', 'WHITE HILL CAPITAL', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00070');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00071', 'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-10-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00071');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00072', 'FRESH TOUR', 0, 5000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00072');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00073', 'ACE GROUP CONSULTANTS-HR PARTNERS', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00073');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00074', 'PGM RESOURCE CA', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00074');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00075', 'MAKMART EAST', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00075');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00076', 'THEMAESTRO STUDIO', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00076');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00077', 'WHITE HILL CAPITAL', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00077');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00078', 'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00078');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00079', 'UFA BUILDGROUP', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-11-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00079');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00080', 'Lumikidy', 0, 6000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00080');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00081', 'LENOVO INT. COO. (иностранная компания)', 0, 20417000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00081');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00082', 'ACE GROUP CONSULTANTS-HR PARTNERS', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00082');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00083', 'PGM RESOURCE CA', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00083');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00084', 'LUMIKIDY', 0, 6720000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00084');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00085', 'THEMAESTRO STUDIO', 0, 2000000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00085');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00086', 'RADIANCE GROUP', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00086');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00087', 'WHITE HILL CAPITAL', 0, 700000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00087');

INSERT INTO transactions (transaction_number, customer_name, amount, debt, service_type_id, payment_method_id, branch_id, agent_id, transaction_date, notes)
SELECT 'TXN-DEBT-00088', 'SINOMA WIND POWER BLADE CENTRAL ASIA', 0, 2500000, 
  (SELECT id FROM service_types WHERE code = 'office' LIMIT 1),
  (SELECT id FROM payment_methods WHERE code = 'bank' LIMIT 1),
  'labzak',
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  '2025-12-01', 'Unpaid debt'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_number = 'TXN-DEBT-00088');


-- Verify
SELECT SUM(debt) as total_debt FROM transactions WHERE branch_id = 'labzak' AND debt > 0;
