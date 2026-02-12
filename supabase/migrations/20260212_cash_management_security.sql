-- ============================================
-- PR2-066 SEC: Cash Management Security Hardening
-- Migration: 20260212_cash_management_security.sql
-- ============================================
-- Fixes: SEC-066-02 (non-atomic approval), SEC-066-03 (transfer TOCTOU),
--         DEB-066 BUG-5/10 (non-atomic inkasso delivery)
-- ============================================

-- ============================================
-- 1. Atomic dividend spend approval (SEC-066-02)
-- ============================================
-- Wraps the 3-step approve flow in a single transaction:
--   1. Update request status to 'approved'
--   2. Insert expense record
--   3. Link expense_id back to request

CREATE OR REPLACE FUNCTION approve_dividend_spend(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_review_note TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_expense_id UUID;
BEGIN
  -- Lock the row to prevent concurrent approval
  SELECT * INTO v_request
  FROM dividend_spend_requests
  WHERE id = p_request_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or no longer pending';
  END IF;

  -- Step 1: Mark as approved
  UPDATE dividend_spend_requests
  SET status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = NOW(),
      review_note = p_review_note
  WHERE id = p_request_id;

  -- Step 2: Create the expense
  INSERT INTO expenses (subject, amount, expense_type_id, payment_method, branch_id, recorded_by, expense_date)
  VALUES (
    v_request.expense_subject,
    v_request.expense_amount,
    v_request.expense_type_id,
    'cash',
    v_request.branch_id,
    v_request.requested_by,
    v_request.expense_date
  )
  RETURNING id INTO v_expense_id;

  -- Step 3: Link expense to request
  UPDATE dividend_spend_requests
  SET expense_id = v_expense_id
  WHERE id = p_request_id;

  -- Return the result as JSON
  RETURN json_build_object(
    'request_id', p_request_id,
    'expense_id', v_expense_id,
    'status', 'approved'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Atomic inkasso delivery (DEB-066 BUG-5/10)
-- ============================================
-- Wraps delivery header + items in a single transaction.
-- Uses advisory lock per branch to prevent concurrent delivery of same transactions.
-- Returns the created delivery ID.

CREATE OR REPLACE FUNCTION create_inkasso_delivery_atomic(
  p_branch_id VARCHAR,
  p_transaction_ids UUID[],
  p_delivered_by UUID,
  p_delivered_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_delivery_id UUID;
  v_txn RECORD;
  v_total_amount DECIMAL(18,2) := 0;
  v_count INTEGER := 0;
  v_existing_count INTEGER;
BEGIN
  -- Advisory lock per branch prevents concurrent deliveries from racing
  PERFORM pg_advisory_xact_lock(hashtext('inkasso_delivery_' || p_branch_id));

  -- Validate all transactions: exist, inkasso=true, not voided, belong to branch
  FOR v_txn IN
    SELECT id, amount, is_inkasso, is_voided, branch_id
    FROM transactions
    WHERE id = ANY(p_transaction_ids)
  LOOP
    IF v_txn.branch_id != p_branch_id THEN
      RAISE EXCEPTION 'Transaction % belongs to another branch', v_txn.id;
    END IF;
    IF NOT v_txn.is_inkasso THEN
      RAISE EXCEPTION 'Transaction % is not inkasso', v_txn.id;
    END IF;
    IF v_txn.is_voided THEN
      RAISE EXCEPTION 'Transaction % is voided', v_txn.id;
    END IF;
    v_total_amount := v_total_amount + v_txn.amount;
    v_count := v_count + 1;
  END LOOP;

  IF v_count != array_length(p_transaction_ids, 1) THEN
    RAISE EXCEPTION 'Some transactions were not found';
  END IF;

  -- Check for already-delivered transactions
  SELECT COUNT(*) INTO v_existing_count
  FROM inkasso_delivery_items
  WHERE transaction_id = ANY(p_transaction_ids);

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'Some transactions have already been delivered';
  END IF;

  -- Create delivery header
  INSERT INTO inkasso_deliveries (branch_id, delivered_date, delivered_by, total_amount, transaction_count, notes)
  VALUES (p_branch_id, p_delivered_date, p_delivered_by, v_total_amount, v_count, p_notes)
  RETURNING id INTO v_delivery_id;

  -- Create delivery items (atomically with header)
  INSERT INTO inkasso_delivery_items (delivery_id, transaction_id, amount)
  SELECT v_delivery_id, t.id, t.amount
  FROM transactions t
  WHERE t.id = ANY(p_transaction_ids);

  RETURN v_delivery_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Atomic cash transfer with balance lock (SEC-066-03)
-- ============================================
-- Uses advisory lock keyed on branch_id to prevent concurrent
-- transfers from overdrawing the balance.

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
  v_total_expenses DECIMAL(18,2);
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

  -- Sum cash expenses since last transfer
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM expenses
  WHERE branch_id = p_branch_id
    AND payment_method = 'cash'
    AND is_voided = FALSE
    AND (v_last_transfer_date IS NULL OR expense_date > v_last_transfer_date::date);

  -- Sum approved dividend spends since last transfer
  SELECT COALESCE(SUM(dividend_portion), 0) INTO v_total_div_spends
  FROM dividend_spend_requests
  WHERE branch_id = p_branch_id
    AND status = 'approved'
    AND (v_last_transfer_date IS NULL OR requested_at > v_last_transfer_date);

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
