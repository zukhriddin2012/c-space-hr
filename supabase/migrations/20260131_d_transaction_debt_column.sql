-- ============================================
-- Add Debt Column to Transactions Table
-- Track unpaid amounts per transaction
-- ============================================

-- Add debt column to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debt DECIMAL(15,2) DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_debt ON transactions(debt) WHERE debt > 0;

COMMENT ON COLUMN transactions.debt IS 'Outstanding unpaid amount for this transaction';

-- ============================================
-- Update debt values for 2024-2025 imported transactions
-- Total records: 98, Total debt: 206,001,907 UZS
-- ============================================

UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-03-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-04-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-05-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1600000 WHERE customer_name = 'ALL TECH NDT' AND transaction_date = '2024-05-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1600000 WHERE customer_name = 'PS CLOUD SERVICES' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1500000 WHERE customer_name = 'TRINITY CENTER' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'SGGROUP-U' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1600000 WHERE customer_name = 'ALL TECH NDT' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 800000 WHERE customer_name = 'TURECODE' AND transaction_date = '2024-06-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'EXPORTGROUP' AND transaction_date = '2024-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'IMPEX COMMUNITY' AND transaction_date = '2024-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'EXPORTGROUP' AND transaction_date = '2024-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'IMPEX COMMUNITY' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1250000 WHERE customer_name = 'TOSHKENT MED TEX CA' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1500000 WHERE customer_name = 'TRINITY CENTER' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'AFSUN TRADING' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 130000 WHERE customer_name = 'ENDORPHIN ADVERTISING' AND transaction_date = '2024-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1500000 WHERE customer_name = 'Tahirov Ilyos' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1250000 WHERE customer_name = 'TOSHKENT MED TEX CA' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'ICC OILS AND FATS TAS' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 451613 WHERE customer_name = 'INNOSPHERE' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'ENDORPHIN ADVERTISING' AND transaction_date = '2024-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1250000 WHERE customer_name = 'TOSHKENT MED TEX CA' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1200000 WHERE customer_name = 'TECHCELLS' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'EXPORTGROUP MINERALS' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'ICC OILS AND FATS TAS' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'INNOSPHERE' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'ENDORPHIN ADVERTISING' AND transaction_date = '2024-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 500000 WHERE customer_name = 'Xojiakbar Zokirbekov' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 900000 WHERE customer_name = 'Sayfuddinov A''lo' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1600000 WHERE customer_name = 'MIGRANT' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1250000 WHERE customer_name = 'TOSHKENT MED TEX CA' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1800000 WHERE customer_name = 'TUERREDDA' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1200000 WHERE customer_name = 'TECHCELLS' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'EXPORTGROUP MINERALS' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'ICC OILS AND FATS TAS' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'INNOSPHERE' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MANSURBEK BIZNES IMKONI' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'TIMELESS' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'NASRULLO QURULISH TORG' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'KAMILLAXON DOKONI' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'ENDORPHIN ADVERTISING' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'ALFA TURK' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'RAFEX' AND transaction_date = '2024-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1000000 WHERE customer_name = 'Shaxzod Ayubjonov' AND transaction_date = '2025-01-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'TIMELESS' AND transaction_date = '2025-01-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'TIMELESS' AND transaction_date = '2025-02-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'TIMELESS' AND transaction_date = '2025-03-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 785714 WHERE customer_name = 'WELMONDE DIGITAL HEALTHCARE' AND transaction_date = '2025-03-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'NAZ-OZ' AND transaction_date = '2025-05-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 900000 WHERE customer_name = 'Murod Erkinboyev' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MIDAS OPERATION' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'YUNONA MERKURIY' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 1300000 WHERE customer_name = 'BE WOMAN HAPPY WOMANS ACADEMY' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 375000 WHERE customer_name = 'MUSAIT TECH' AND transaction_date = '2025-07-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 10000000 WHERE customer_name = 'FRESH TOUR' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'GEONA-GROUP' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MIDAS OPERATION' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'YUNONA MERKURIY' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'MUSAIT TECH' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MAKMART EAST' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 322580 WHERE customer_name = 'UNOMED' AND transaction_date = '2025-08-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 10000000 WHERE customer_name = 'FRESH TOUR' AND transaction_date = '2025-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MAKMART EAST' AND transaction_date = '2025-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'WHITE HILL CAPITAL' AND transaction_date = '2025-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2800000 WHERE customer_name = 'UNION CAFE' AND transaction_date = '2025-09-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 10000000 WHERE customer_name = 'FRESH TOUR' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'PGM RESOURCE CA' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MAKMART EAST' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'LUMIKIDY' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'WHITE HILL CAPITAL' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2500000 WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' AND transaction_date = '2025-10-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 5000000 WHERE customer_name = 'FRESH TOUR' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 200000 WHERE customer_name = 'TURON TELECOM' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'ACE GROUP CONSULTANTS-HR PARTNERS' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'PGM RESOURCE CA' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'MAKMART EAST' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'THEMAESTRO STUDIO' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'WHITE HILL CAPITAL' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2500000 WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'UFA BUILDGROUP' AND transaction_date = '2025-11-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 6000000 WHERE customer_name = 'Lumikidy' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 20417000 WHERE customer_name = 'LENOVO INT. COO. (иностранная компания)' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'ACE GROUP CONSULTANTS-HR PARTNERS' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'PGM RESOURCE CA' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 6720000 WHERE customer_name = 'LUMIKIDY' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2000000 WHERE customer_name = 'THEMAESTRO STUDIO' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'RADIANCE GROUP' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 700000 WHERE customer_name = 'WHITE HILL CAPITAL' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;
UPDATE transactions SET debt = 2500000 WHERE customer_name = 'SINOMA WIND POWER BLADE CENTRAL ASIA' AND transaction_date = '2025-12-01' AND branch_id = 'labzak' AND debt = 0;

-- Summary
DO $$
DECLARE
  v_total_debt DECIMAL;
  v_count INT;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(debt), 0) INTO v_count, v_total_debt
  FROM transactions WHERE debt > 0 AND branch_id = 'labzak';
  
  RAISE NOTICE 'Debt updated: % records with % UZS total debt', v_count, v_total_debt;
END $$;
