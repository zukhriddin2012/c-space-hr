-- CSN-172: Fix OpEx calculation
--
-- 1. Add cash_management_start_date to branches — used as baseline when
--    no cash transfer has ever occurred. Without this, expenses/transactions
--    are summed from the beginning of time, causing massive mismatches.
--
-- 2. Fix create_cash_transfer_atomic to:
--    - Use expense_date (not requested_at) for dividend_spend_requests
--    - Exclude dividend-linked expenses from regular expense sum
--    - Use cash_management_start_date as fallback baseline

-- Step 1: Add the start date column
ALTER TABLE branches
  ADD COLUMN IF NOT EXISTS cash_management_start_date DATE;

COMMENT ON COLUMN branches.cash_management_start_date
  IS 'Baseline date for cash management calculations when no transfer exists. Set to the date cash management was enabled for this branch.';

-- Step 2: Recreate the atomic transfer function with fixes
CREATE OR REPLACE FUNCTION create_cash_transfer_atomic(
  p_branch_id VARCHAR,
  p_dividend_amount DECIMAL(18,2),
  p_marketing_amount DECIMAL(18,2),
  p_transferred_by UUID,
  p_transfer_date TIMESTAMPTZ DEFAULT NOW(),
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transfer_id UUID;
  v_last_transfer_date TIMESTAMPTZ;
  v_baseline_date DATE;
  v_cash_pm_id UUID;
  v_total_non_inkasso DECIMAL(18,2);
  v_total_regular_expenses DECIMAL(18,2);
  v_total_div_spends DECIMAL(18,2);
  v_opex_pct DECIMAL(5,2);
  v_mkt_pct DECIMAL(5,2);
  v_div_available DECIMAL(18,2);
  v_mkt_available DECIMAL(18,2);
BEGIN
  -- Advisory lock per branch prevents concurrent transfers
  PERFORM pg_advisory_xact_lock(hashtext('cash_transfer_' || p_branch_id));

  -- Get last transfer date
  SELECT transfer_date INTO v_last_transfer_date
  FROM cash_transfers
  WHERE branch_id = p_branch_id
  ORDER BY transfer_date DESC
  LIMIT 1;

  -- Get branch settings (including start date fallback)
  SELECT cash_opex_percentage, cash_marketing_percentage, cash_management_start_date
  INTO v_opex_pct, v_mkt_pct, v_baseline_date
  FROM branches WHERE id = p_branch_id;

  -- Get cash payment method ID
  SELECT id INTO v_cash_pm_id FROM payment_methods WHERE code = 'cash' LIMIT 1;

  -- Sum non-inkasso cash since last transfer (or start date)
  SELECT COALESCE(SUM(amount), 0) INTO v_total_non_inkasso
  FROM transactions
  WHERE branch_id = p_branch_id
    AND is_inkasso = FALSE
    AND is_voided = FALSE
    AND (v_cash_pm_id IS NULL OR payment_method_id = v_cash_pm_id)
    AND (
      CASE
        WHEN v_last_transfer_date IS NOT NULL THEN transaction_date > v_last_transfer_date::date
        WHEN v_baseline_date IS NOT NULL THEN transaction_date >= v_baseline_date
        ELSE TRUE
      END
    );

  -- Sum approved dividend spends since last transfer (or start date)
  SELECT COALESCE(SUM(dividend_portion), 0) INTO v_total_div_spends
  FROM dividend_spend_requests
  WHERE branch_id = p_branch_id
    AND status = 'approved'
    AND (
      CASE
        WHEN v_last_transfer_date IS NOT NULL THEN expense_date > v_last_transfer_date::date
        WHEN v_baseline_date IS NOT NULL THEN expense_date >= v_baseline_date
        ELSE TRUE
      END
    );

  -- Sum regular cash expenses since last transfer (excluding dividend-generated expenses)
  SELECT COALESCE(SUM(e.amount), 0) INTO v_total_regular_expenses
  FROM expenses e
  WHERE e.branch_id = p_branch_id
    AND e.payment_method = 'cash'
    AND e.is_voided = FALSE
    AND (
      CASE
        WHEN v_last_transfer_date IS NOT NULL THEN e.expense_date > v_last_transfer_date::date
        WHEN v_baseline_date IS NOT NULL THEN e.expense_date >= v_baseline_date
        ELSE TRUE
      END
    )
    AND NOT EXISTS (
      SELECT 1 FROM dividend_spend_requests dsr
      WHERE dsr.expense_id = e.id
        AND dsr.status = 'approved'
    );

  -- Calculate available balances
  v_mkt_available := v_total_non_inkasso * (v_mkt_pct / 100);
  v_div_available := v_total_non_inkasso - (v_total_non_inkasso * (v_opex_pct / 100)) - v_mkt_available - v_total_div_spends;

  -- Validate amounts don't exceed available
  IF p_dividend_amount > v_div_available THEN
    RAISE EXCEPTION 'Insufficient dividend balance';
  END IF;
  IF p_marketing_amount > v_mkt_available THEN
    RAISE EXCEPTION 'Insufficient marketing balance';
  END IF;

  -- Insert transfer (balance check and insert are atomic under advisory lock)
  INSERT INTO cash_transfers (branch_id, dividend_amount, marketing_amount, transferred_by, transfer_date, notes)
  VALUES (p_branch_id, p_dividend_amount, p_marketing_amount, p_transferred_by, p_transfer_date, p_notes)
  RETURNING id INTO v_transfer_id;

  RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql;
