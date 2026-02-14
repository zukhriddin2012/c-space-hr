-- ============================================================
-- CSN-030: Record Cash Transfer to Investors — C-Space Labzak
-- ============================================================
-- Problem: Marketing and dividend allocations were physically
-- given to investors but never recorded in the system.
-- This makes "Cash on Hand" show a misleadingly large number.
--
-- Fix: Insert a cash_transfers record with the marketing and
-- dividend amounts. This resets the cycle baseline.
-- ============================================================

-- ============================================================
-- STEP 1: DIAGNOSTIC — Run this first to see current state
-- ============================================================
WITH cash_pm AS (
  SELECT id FROM payment_methods WHERE code = 'cash' LIMIT 1
),
last_transfer AS (
  SELECT transfer_date
  FROM cash_transfers
  WHERE branch_id = 'labzak'
  ORDER BY transfer_date DESC
  LIMIT 1
),
settings AS (
  SELECT cash_opex_percentage, cash_marketing_percentage, cash_transfer_threshold
  FROM branches
  WHERE id = 'labzak'
),
non_inkasso AS (
  SELECT COALESCE(SUM(t.amount), 0) AS total
  FROM transactions t
  JOIN cash_pm pm ON t.payment_method_id = pm.id
  WHERE t.branch_id = 'labzak'
    AND t.is_inkasso = FALSE
    AND t.is_voided = FALSE
    AND (
      NOT EXISTS (SELECT 1 FROM last_transfer)
      OR t.transaction_date > (SELECT transfer_date::date FROM last_transfer)
    )
),
cash_expenses AS (
  SELECT COALESCE(SUM(e.amount), 0) AS total
  FROM expenses e
  WHERE e.branch_id = 'labzak'
    AND e.payment_method = 'cash'
    AND e.is_voided = FALSE
    AND (
      NOT EXISTS (SELECT 1 FROM last_transfer)
      OR e.expense_date > (SELECT transfer_date::date FROM last_transfer)
    )
),
div_spends AS (
  SELECT COALESCE(SUM(d.dividend_portion), 0) AS total
  FROM dividend_spend_requests d
  WHERE d.branch_id = 'labzak'
    AND d.status = 'approved'
    AND (
      NOT EXISTS (SELECT 1 FROM last_transfer)
      OR d.requested_at > (SELECT transfer_date FROM last_transfer)
    )
)
SELECT
  ni.total                                                                        AS "totalNonInkassoCash",
  ce.total                                                                        AS "totalCashExpenses",
  ds.total                                                                        AS "totalDividendSpends",
  s.cash_opex_percentage,
  s.cash_marketing_percentage,
  ROUND(ni.total * s.cash_opex_percentage / 100, 2)                               AS "opexAllocated",
  ROUND(ni.total * s.cash_marketing_percentage / 100, 2)                          AS "marketingAllocated",
  ROUND(ni.total - ni.total * s.cash_opex_percentage / 100
                  - ni.total * s.cash_marketing_percentage / 100, 2)              AS "dividendAllocated",
  ROUND((ni.total * s.cash_opex_percentage / 100) - (ce.total - ds.total), 2)    AS "opexAvailable",
  ROUND(ni.total * s.cash_marketing_percentage / 100, 2)                          AS "marketingAvailable",
  ROUND((ni.total - ni.total * s.cash_opex_percentage / 100
                   - ni.total * s.cash_marketing_percentage / 100) - ds.total, 2) AS "dividendAvailable",
  (SELECT transfer_date FROM last_transfer)                                       AS "lastTransferDate"
FROM non_inkasso ni, cash_expenses ce, div_spends ds, settings s;


-- ============================================================
-- STEP 2: RECORD THE TRANSFER
-- ============================================================
-- After running Step 1, replace the amounts below with the
-- actual "marketingAvailable" and "dividendAvailable" values.
--
-- ⚠️  IMPORTANT: This resets the cycle. After this insert,
-- all balance calculations will only count income/expenses
-- AFTER this transfer date. The opex balance will also reset
-- to 0 and rebuild from new transactions going forward.
-- ============================================================

INSERT INTO cash_transfers (
  id,
  branch_id,
  dividend_amount,
  marketing_amount,
  -- total_amount is auto-generated: dividend_amount + marketing_amount
  transferred_by,
  transfer_date,
  notes,
  created_at
)
VALUES (
  gen_random_uuid(),
  'labzak',
  0,     -- ← REPLACE with "dividendAvailable" from Step 1
  0,     -- ← REPLACE with "marketingAvailable" from Step 1
  -- Pick a valid employee UUID (e.g. your own):
  (SELECT id FROM employees WHERE branch_id = 'labzak' LIMIT 1),
  NOW(),
  'Historical correction: recorded dividend + marketing cash physically given to investors. Resets cycle baseline.',
  NOW()
);

-- ============================================================
-- STEP 3: VERIFY — Run the diagnostic again to confirm reset
-- ============================================================
-- After the insert, run Step 1 again.
-- Expected: totalNonInkassoCash ≈ 0, all allocations ≈ 0
-- (only transactions from today onward will be counted)
