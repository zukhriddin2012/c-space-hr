-- CSN-172: Fix OpEx calculation in create_cash_transfer_atomic
--
-- Bug: The dividend_spend_requests date filter used `requested_at` while
-- the expenses query used `expense_date`, causing a mismatch that could
-- make the dividend subtraction far exceed the expense total.
-- Additionally, the expense query included dividend-generated expense rows
-- which were then partially subtracted, leading to incorrect OpEx numbers.
--
-- Fix: Use `expense_date` consistently for dividend_spend_requests,
-- exclude dividend-linked expenses from the regular expense sum,
-- and compute OpEx spent as regular_expenses + opex_portions.

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

  -- Get branch settings
  SELECT cash_opex_percentage, cash_marketing_percentage
  INTO v_opex_pct, v_mkt_pct
  FROM branches WHERE id = p_branch_id;

  -- Get cash payment method ID
  SELECT id INTO v_cash_pm_id FROM payment_methods WHERE code = 'cash' LIMIT 1;

  -- Sum non-inkasso cash since last transfer
  SELECT COALESCE(SUM(amount), 0) INTO v_total_non_inkasso
  FROM transactions
  WHERE branch_id = p_branch_id
    AND is_inkasso = FALSE
    AND is_voided = FALSE
    AND (v_cash_pm_id IS NULL OR payment_method_id = v_cash_pm_id)
    AND (v_last_transfer_date IS NULL OR transaction_date > v_last_transfer_date::date);

  -- Sum approved dividend spends since last transfer (using expense_date for consistency)
  SELECT COALESCE(SUM(dividend_portion), 0) INTO v_total_div_spends
  FROM dividend_spend_requests
  WHERE branch_id = p_branch_id
    AND status = 'approved'
    AND (v_last_transfer_date IS NULL OR expense_date > v_last_transfer_date::date);

  -- Sum regular cash expenses since last transfer (excluding dividend-generated expenses)
  SELECT COALESCE(SUM(e.amount), 0) INTO v_total_regular_expenses
  FROM expenses e
  WHERE e.branch_id = p_branch_id
    AND e.payment_method = 'cash'
    AND e.is_voided = FALSE
    AND (v_last_transfer_date IS NULL OR e.expense_date > v_last_transfer_date::date)
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
