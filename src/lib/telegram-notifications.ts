// Telegram notification service for HR platform
// Sends notifications to employees via Telegram when:
// - Payment requests are approved/paid
// - Leave requests are approved/rejected

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface SendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_notification?: boolean;
}

/**
 * Send a message to a Telegram user
 */
async function sendTelegramMessage(
  chatId: string,
  text: string,
  options: SendMessageOptions = {}
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'HTML',
        disable_notification: options.disable_notification || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

/**
 * Format currency in UZS
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

/**
 * Get month name in Uzbek
 */
function getMonthName(month: number): string {
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  return months[month - 1] || '';
}

// ============================================
// PAYMENT NOTIFICATIONS
// ============================================

interface PaymentNotificationData {
  employeeName: string;
  telegramId: string;
  amount: number;
  type: 'advance' | 'wage';
  month: number;
  year: number;
}

/**
 * Notify employee that their payment has been approved
 */
export async function notifyPaymentApproved(data: PaymentNotificationData): Promise<boolean> {
  const typeLabel = data.type === 'advance' ? 'Avans' : 'Oylik';
  const message = `
✅ <b>To'lov tasdiqlandi!</b>

👤 ${data.employeeName}
💰 ${typeLabel}: <b>${formatCurrency(data.amount)}</b>
📅 Davr: ${getMonthName(data.month)} ${data.year}

To'lov tez orada amalga oshiriladi.
`.trim();

  return sendTelegramMessage(data.telegramId, message);
}

/**
 * Notify employee that their payment has been made
 */
export async function notifyPaymentPaid(
  data: PaymentNotificationData & { paymentReference?: string }
): Promise<boolean> {
  const typeLabel = data.type === 'advance' ? 'Avans' : 'Oylik';
  const refLine = data.paymentReference
    ? `\n📋 Havola: ${data.paymentReference}`
    : '';

  const message = `
💵 <b>To'lov amalga oshirildi!</b>

👤 ${data.employeeName}
💰 ${typeLabel}: <b>${formatCurrency(data.amount)}</b>
📅 Davr: ${getMonthName(data.month)} ${data.year}${refLine}

Hisobingizga pul o'tkazildi. ✨
`.trim();

  return sendTelegramMessage(data.telegramId, message);
}

/**
 * Notify employee that their payment request was rejected
 */
export async function notifyPaymentRejected(
  data: PaymentNotificationData & { reason?: string }
): Promise<boolean> {
  const typeLabel = data.type === 'advance' ? 'Avans' : 'Oylik';
  const reasonLine = data.reason
    ? `\n📝 Sabab: ${data.reason}`
    : '';

  const message = `
❌ <b>To'lov so'rovi rad etildi</b>

👤 ${data.employeeName}
💰 ${typeLabel}: ${formatCurrency(data.amount)}
📅 Davr: ${getMonthName(data.month)} ${data.year}${reasonLine}

Savollar bo'lsa, HR bo'limiga murojaat qiling.
`.trim();

  return sendTelegramMessage(data.telegramId, message);
}

// ============================================
// LEAVE NOTIFICATIONS
// ============================================

interface LeaveNotificationData {
  employeeName: string;
  telegramId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * Format date to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Notify employee that their leave request was approved
 */
export async function notifyLeaveApproved(data: LeaveNotificationData): Promise<boolean> {
  const message = `
✅ <b>Ta'til so'rovi tasdiqlandi!</b>

👤 ${data.employeeName}
📅 Boshlanish: ${formatDate(data.startDate)}
📅 Tugash: ${formatDate(data.endDate)}

Yaxshi dam oling! 🌴
`.trim();

  return sendTelegramMessage(data.telegramId, message);
}

/**
 * Notify employee that their leave request was rejected
 */
export async function notifyLeaveRejected(
  data: LeaveNotificationData & { reviewNote?: string }
): Promise<boolean> {
  const noteLine = data.reviewNote
    ? `\n📝 Izoh: ${data.reviewNote}`
    : '';

  const message = `
❌ <b>Ta'til so'rovi rad etildi</b>

👤 ${data.employeeName}
📅 Boshlanish: ${formatDate(data.startDate)}
📅 Tugash: ${formatDate(data.endDate)}${noteLine}

Savollar bo'lsa, HR bo'limiga murojaat qiling.
`.trim();

  return sendTelegramMessage(data.telegramId, message);
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

/**
 * Notify admins about pending payment approvals
 */
export async function notifyAdminPendingPayments(
  adminTelegramId: string,
  pendingCount: number,
  totalAmount: number
): Promise<boolean> {
  const message = `
⏳ <b>Kutilayotgan to'lovlar mavjud!</b>

📊 So'rovlar soni: <b>${pendingCount}</b>
💰 Jami summa: <b>${formatCurrency(totalAmount)}</b>

HR tizimiga kirib tasdiqlashni unutmang.
`.trim();

  return sendTelegramMessage(adminTelegramId, message);
}

/**
 * Notify admins about pending leave requests
 */
export async function notifyAdminPendingLeaves(
  adminTelegramId: string,
  pendingCount: number
): Promise<boolean> {
  const message = `
⏳ <b>Kutilayotgan ta'til so'rovlari mavjud!</b>

📊 So'rovlar soni: <b>${pendingCount}</b>

HR tizimiga kirib ko'rib chiqishni unutmang.
`.trim();

  return sendTelegramMessage(adminTelegramId, message);
}

/**
 * Send bulk notifications to multiple employees
 * Used when a payment batch is approved/paid
 */
export async function sendBulkNotifications(
  notifications: Array<{
    telegramId: string;
    message: string;
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Send notifications with a small delay to avoid rate limiting
  for (const notification of notifications) {
    const sent = await sendTelegramMessage(notification.telegramId, notification.message);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    // Small delay between messages to avoid Telegram rate limits
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return { success, failed };
}

// ============================================
// FEEDBACK NOTIFICATIONS
// ============================================

const FEEDBACK_CATEGORY_LABELS: Record<string, string> = {
  work_environment: 'Ish muhiti',
  management: 'Rahbariyat',
  career: 'Karyera rivojlanishi',
  compensation: 'Maosh va imtiyozlar',
  suggestion: 'Taklif',
  other: 'Boshqa',
};

/**
 * Generate star rating display
 */
function renderStars(rating: number | undefined | null): string {
  if (!rating) return '';
  const filled = '⭐'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return `\nBaho: ${filled}${empty}`;
}

/**
 * Notify GM about new feedback submission
 */
export async function notifyNewFeedback(data: {
  gmTelegramId: string;
  feedbackId: string;
  category: string;
  isAnonymous: boolean;
  employeeName?: string;
  rating?: number | null;
  feedbackText: string;
}): Promise<boolean> {
  const categoryLabel = FEEDBACK_CATEGORY_LABELS[data.category] || data.category;
  const fromText = data.isAnonymous ? 'Anonim' : data.employeeName || 'Noma\'lum';
  const stars = renderStars(data.rating);

  // Truncate feedback text if too long for Telegram
  const maxLength = 500;
  const truncatedText = data.feedbackText.length > maxLength
    ? data.feedbackText.substring(0, maxLength) + '...'
    : data.feedbackText;

  const message = `
📝 <b>Yangi fikr-mulohaza!</b>

📂 Turkum: ${categoryLabel}
👤 Kimdan: ${fromText}${stars}

💬 <i>"${truncatedText}"</i>

HR tizimida to'liq ko'rish mumkin.
`.trim();

  return sendTelegramMessage(data.gmTelegramId, message);
}
