import { sendMail } from './mailer.js';

// Small, purpose-built email templates - one function per transactional
// trigger, matching the small-helper-duplication convention already used
// for youtube.ts/ai.ts rather than a generic templating layer. Every sender
// here is fire-and-forget from the caller's perspective: sendMail already
// swallows "not configured"/"failed" into a boolean, so a booking or
// purchase must never fail because a notification couldn't go out.

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Absolute UTC is the only thing safe to print server-side - the frontend
// renders every date in the viewer's own locale/timezone (see
// Intl.DateTimeFormat usage across apps/web), but an email has no viewer
// context to localize against, so it says UTC explicitly rather than
// guessing wrong.
function formatUtc(date: Date): string {
  return `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
}

function wrapper(bodyHtml: string): string {
  return `<div style="font-family:sans-serif;font-size:15px;color:#1f2937;line-height:1.5;max-width:480px">
    ${bodyHtml}
    <p style="margin-top:24px;font-size:12px;color:#9ca3af">MyMusic.Coach</p>
  </div>`;
}

// Renders the two booking-confirmation emails (student-facing, teacher-
// facing) as plain {subject, html} - the caller (notifyBookingConfirmed in
// bookings.ts) writes these into the durable mail outbox rather than
// sending them directly, so delivery survives a temporarily-down SMTP relay
// instead of silently dropping the notification. See mailOutbox.ts.
export function bookingConfirmedEmailContent(booking: {
  studentName: string;
  teacherName: string;
  startsAt: Date;
  durationMin: number;
  format: string;
  instrument: string | null | undefined;
}): { student: { subject: string; html: string }; teacher: { subject: string; html: string } } {
  const when = formatUtc(booking.startsAt);
  const details = `${when} · ${booking.durationMin} min · ${booking.format}${booking.instrument ? ` · ${booking.instrument}` : ''}`;
  return {
    student: {
      subject: 'Your lesson is confirmed',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.studentName)},</p>
         <p>Your lesson with <strong>${escapeHtml(booking.teacherName)}</strong> is confirmed.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
    teacher: {
      subject: 'A lesson booking was confirmed',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.teacherName)},</p>
         <p>Your lesson with <strong>${escapeHtml(booking.studentName)}</strong> is confirmed.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
  };
}

export async function sendPurchaseConfirmedEmail(purchase: {
  toEmail: string | null | undefined;
  toName: string;
  description: string;
  amount: number;
  currency: string;
}): Promise<void> {
  if (!purchase.toEmail) return;
  await sendMail({
    to: purchase.toEmail,
    subject: 'Payment confirmed',
    html: wrapper(
      `<p>Hi ${escapeHtml(purchase.toName)},</p>
       <p>Thanks for your purchase - your payment has been confirmed.</p>
       <p><strong>${escapeHtml(purchase.description)}</strong><br/>
       ${purchase.amount.toFixed(2)} ${escapeHtml(purchase.currency.toUpperCase())}</p>`,
    ),
  });
}
