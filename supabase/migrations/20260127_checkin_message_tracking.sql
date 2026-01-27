-- Migration: Add telegram message tracking for cleaner checkout reminder flow
-- This allows the bot to edit the original check-in message when user clicks "I left"

-- Add telegram_checkin_message_id to attendance table
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS telegram_checkin_message_id TEXT DEFAULT NULL;

-- Add telegram_chat_id to attendance table (for editing messages later)
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT DEFAULT NULL;

-- Add checkin_message_id to checkout_reminders for quick access
ALTER TABLE checkout_reminders
ADD COLUMN IF NOT EXISTS checkin_message_id TEXT DEFAULT NULL;

-- Add chat_id to checkout_reminders for message operations
ALTER TABLE checkout_reminders
ADD COLUMN IF NOT EXISTS chat_id TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN attendance.telegram_checkin_message_id IS 'Telegram message ID of the check-in confirmation message, used to edit it on checkout';
COMMENT ON COLUMN attendance.telegram_chat_id IS 'Telegram chat ID where the check-in message was sent';
COMMENT ON COLUMN checkout_reminders.checkin_message_id IS 'Telegram message ID of the original check-in message, copied from attendance for quick access';
COMMENT ON COLUMN checkout_reminders.chat_id IS 'Telegram chat ID for message operations';
