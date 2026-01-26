-- Telegram Bot Content Management Tables
-- Run this migration to set up the tables for managing bot content, messages, and settings

-- Learning Content Table
CREATE TABLE IF NOT EXISTS bot_learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('tip', 'scenario', 'quiz', 'reflection')),
  category VARCHAR(30) NOT NULL CHECK (category IN ('service_excellence', 'team_collaboration', 'customer_handling', 'company_values', 'professional_growth')),
  title JSONB NOT NULL DEFAULT '{"en": "", "ru": "", "uz": ""}',
  content JSONB NOT NULL DEFAULT '{"en": "", "ru": "", "uz": ""}',
  quiz_options JSONB DEFAULT NULL, -- Array of {en, ru, uz} objects
  quiz_correct_index INTEGER DEFAULT NULL,
  quiz_explanation JSONB DEFAULT NULL, -- {en, ru, uz}
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Templates Table
CREATE TABLE IF NOT EXISTS bot_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{"en": "", "ru": "", "uz": ""}',
  available_placeholders TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Button Labels Table
CREATE TABLE IF NOT EXISTS bot_button_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  label JSONB NOT NULL DEFAULT '{"en": "", "ru": "", "uz": ""}',
  emoji VARCHAR(10) DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Settings Table
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkout Reminders Table (for tracking reminder status)
CREATE TABLE IF NOT EXISTS checkout_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_id UUID NOT NULL REFERENCES attendance(id),
  shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('day', 'night')),
  reminder_sent_at TIMESTAMPTZ DEFAULT NULL,
  reminder_message_id TEXT DEFAULT NULL,
  learning_content_id UUID REFERENCES bot_learning_content(id) DEFAULT NULL,
  response_received_at TIMESTAMPTZ DEFAULT NULL,
  response_type VARCHAR(20) CHECK (response_type IN ('confirmed', 'in_office', 'left', 'auto')),
  ip_verified BOOLEAN DEFAULT false,
  ip_address VARCHAR(45) DEFAULT NULL,
  auto_checkout_at TIMESTAMPTZ DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'auto_completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bot_learning_content_type ON bot_learning_content(type);
CREATE INDEX IF NOT EXISTS idx_bot_learning_content_category ON bot_learning_content(category);
CREATE INDEX IF NOT EXISTS idx_bot_learning_content_active ON bot_learning_content(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_message_templates_key ON bot_message_templates(key);
CREATE INDEX IF NOT EXISTS idx_bot_button_labels_key ON bot_button_labels(key);
CREATE INDEX IF NOT EXISTS idx_bot_settings_key ON bot_settings(key);
CREATE INDEX IF NOT EXISTS idx_checkout_reminders_employee ON checkout_reminders(employee_id);
CREATE INDEX IF NOT EXISTS idx_checkout_reminders_status ON checkout_reminders(status);
CREATE INDEX IF NOT EXISTS idx_checkout_reminders_created ON checkout_reminders(created_at);

-- Insert default bot settings
INSERT INTO bot_settings (key, value, description) VALUES
  ('day_shift_reminder_time', '18:30', 'When to send checkout reminders for day shift employees'),
  ('night_shift_reminder_time', '10:00', 'When to send checkout reminders for night shift employees (next day)'),
  ('auto_checkout_delay_minutes', '45', 'How long to wait after reminder before auto-checkout'),
  ('day_shift_cutoff_hour', '12', 'Check-ins before this hour are considered day shift')
ON CONFLICT (key) DO NOTHING;

-- Insert default message templates
INSERT INTO bot_message_templates (key, description, content, available_placeholders) VALUES
  ('checkout_reminder', 'Reminder sent when employees should check out',
   '{"en": "Hi {employee_name}! 👋 Time to wrap up your day. Please confirm your checkout.", "ru": "Привет, {employee_name}! 👋 Пора завершать рабочий день. Пожалуйста, подтвердите выход.", "uz": "Salom {employee_name}! 👋 Ish kunini yakunlash vaqti keldi. Iltimos, chiqishni tasdiqlang."}',
   ARRAY['employee_name', 'time']),
  ('auto_checkout_notice', 'Notice sent when auto-checkout occurs',
   '{"en": "Your checkout was automatically recorded at {time}. See you tomorrow! 🌙", "ru": "Ваш выход был автоматически зафиксирован в {time}. До завтра! 🌙", "uz": "Sizning chiqishingiz {time} da avtomatik qayd etildi. Ertaga ko''rishamiz! 🌙"}',
   ARRAY['time']),
  ('ip_mismatch_question', 'Question sent when IP does not match branch',
   '{"en": "Your location doesn''t match your branch''s network. Where are you right now?", "ru": "Ваше местоположение не совпадает с сетью филиала. Где вы сейчас находитесь?", "uz": "Joylashuvingiz filial tarmog''iga mos kelmaydi. Hozir qayerdasiz?"}',
   ARRAY[]::TEXT[])
ON CONFLICT (key) DO NOTHING;

-- Insert default button labels
INSERT INTO bot_button_labels (key, description, label, emoji) VALUES
  ('confirm_checkout', 'Button to confirm checkout',
   '{"en": "Confirm Checkout", "ru": "Подтвердить выход", "uz": "Chiqishni tasdiqlash"}', '✅'),
  ('im_in_office', 'Button to indicate still in office',
   '{"en": "I''m in the office", "ru": "Я в офисе", "uz": "Men ofisdaman"}', '🏢'),
  ('i_left', 'Button to indicate already left',
   '{"en": "I already left", "ru": "Я уже ушёл", "uz": "Men allaqachon chiqdim"}', '🚪'),
  ('start_quiz', 'Button to start a quiz',
   '{"en": "Start Quiz", "ru": "Начать тест", "uz": "Testni boshlash"}', '🎯'),
  ('next', 'Button for next action',
   '{"en": "Next", "ru": "Далее", "uz": "Keyingi"}', '➡️')
ON CONFLICT (key) DO NOTHING;

-- Insert sample learning content
INSERT INTO bot_learning_content (type, category, title, content, is_active, display_order) VALUES
  ('tip', 'service_excellence',
   '{"en": "Quick Response Tip", "ru": "Совет по быстрому реагированию", "uz": "Tezkor javob bo''yicha maslahat"}',
   '{"en": "When a resident asks a question, acknowledge them within 30 seconds - even if you need time to find the answer. A quick ''I''ll look into that for you'' builds trust!", "ru": "Когда резидент задаёт вопрос, ответьте ему в течение 30 секунд - даже если вам нужно время, чтобы найти ответ. Быстрое ''Я уточню для вас'' укрепляет доверие!", "uz": "Resident savol berganda, 30 soniya ichida javob bering - hatto javobni topish uchun vaqt kerak bo''lsa ham. Tez ''Men siz uchun aniqlayman'' deyish ishonchni mustahkamlaydi!"}',
   true, 1),
  ('reflection', 'company_values',
   '{"en": "Architects Not Firefighters", "ru": "Архитекторы, а не пожарные", "uz": "O''t o''chiruvchilar emas, arxitektorlar"}',
   '{"en": "Did you prevent a problem today, or just solve one? True excellence is building systems that prevent issues before they happen. What can you improve tomorrow?", "ru": "Вы сегодня предотвратили проблему или просто решили её? Настоящее мастерство - это создание систем, которые предотвращают проблемы ещё до их возникновения. Что вы можете улучшить завтра?", "uz": "Bugun muammoni oldini oldingizmi yoki shunchaki hal qildingizmi? Haqiqiy mukammallik - muammolarni paydo bo''lishidan oldin oldini oladigan tizimlarni yaratishdir. Ertaga nimani yaxshilashingiz mumkin?"}',
   true, 2)
ON CONFLICT DO NOTHING;

-- Insert sample quiz content
INSERT INTO bot_learning_content (type, category, title, content, quiz_options, quiz_correct_index, quiz_explanation, is_active, display_order) VALUES
  ('quiz', 'customer_handling',
   '{"en": "Printer Troubleshooting", "ru": "Устранение неполадок принтера", "uz": "Printer muammolarini bartaraf qilish"}',
   '{"en": "A resident''s printer isn''t working. What''s the C-Space way to handle it?", "ru": "Принтер резидента не работает. Как это решить по-C-Space?", "uz": "Rezidentning printeri ishlamayapti. Buni C-Space uslubida qanday hal qilish kerak?"}',
   '[{"en": "Call IT support immediately", "ru": "Немедленно позвонить в IT-поддержку", "uz": "Darhol IT qo''llab-quvvatlashga qo''ng''iroq qiling"}, {"en": "Troubleshoot first, then escalate if needed", "ru": "Сначала попробовать решить, потом передать если нужно", "uz": "Avval o''zingiz hal qilib ko''ring, kerak bo''lsa yuqoriga uzating"}, {"en": "Tell them to use a different printer", "ru": "Предложить использовать другой принтер", "uz": "Ularga boshqa printerdan foydalanishni ayting"}]',
   1,
   '{"en": "Always try to help first - it shows you care and often solves the problem faster!", "ru": "Всегда сначала пробуйте помочь - это показывает вашу заботу и часто решает проблему быстрее!", "uz": "Har doim avval yordam berishga harakat qiling - bu sizning g''amxo''rligingizni ko''rsatadi va ko''pincha muammoni tezroq hal qiladi!"}',
   true, 3)
ON CONFLICT DO NOTHING;
