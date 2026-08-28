import { sendMail } from './mailer.js';

// Small, purpose-built email templates - one function per transactional
// trigger, matching the small-helper-duplication convention already used
// for youtube.ts/ai.ts rather than a generic templating layer. Booking/event
// helpers return content for the durable outbox; the remaining direct
// purchase sender inherits sendMail's non-throwing behavior.

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

// Sent after Stripe has confirmed payment, while the lesson is still
// waiting for the teacher's explicit approval. Deliberately has no calendar
// attachment: the lesson is not a calendar commitment until confirmBooking
// transitions it to CONFIRMED.
export function bookingRequestEmailContent(booking: {
  studentName: string;
  teacherName: string;
  startsAt: Date;
  durationMin: number;
  format: string;
  instrument: string | null | undefined;
  teacherWorkspaceUrl: string;
  paymentStatus: 'PAID' | 'COVERED' | 'NOT_REQUIRED';
}): { student: { subject: string; html: string }; teacher: { subject: string; html: string } } {
  const when = formatUtc(booking.startsAt);
  const details = `${when} · ${booking.durationMin} min · ${booking.format}${booking.instrument ? ` · ${booking.instrument}` : ''}`;
  const paymentSummary = booking.paymentStatus === 'PAID'
    ? 'Your payment was successful and your lesson request was sent'
    : booking.paymentStatus === 'COVERED'
      ? 'Your lesson credit was accepted and your request was sent'
      : 'Your lesson request was sent';
  const teacherPaymentSummary = booking.paymentStatus === 'PAID'
    ? 'has paid and requested a lesson with you'
    : booking.paymentStatus === 'COVERED'
      ? 'used a lesson credit and requested a lesson with you'
      : 'requested a lesson with you';
  return {
    student: {
      subject: 'Your lesson request was sent',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.studentName)},</p>
         <p>${escapeHtml(paymentSummary)} to <strong>${escapeHtml(booking.teacherName)}</strong>.</p>
         <p>${escapeHtml(details)}</p>
         <p>We will email you again with a calendar invitation as soon as the teacher accepts it.</p>`,
      ),
    },
    teacher: {
      subject: `New lesson request from ${booking.studentName}`,
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.teacherName)},</p>
         <p><strong>${escapeHtml(booking.studentName)}</strong> ${escapeHtml(teacherPaymentSummary)}.</p>
         <p>${escapeHtml(details)}</p>
         <p><a href="${escapeHtml(booking.teacherWorkspaceUrl)}">Review and accept the booking</a></p>`,
      ),
    },
  };
}

export function bookingCancelledEmailContent(booking: {
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
      subject: 'Your lesson was cancelled',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.studentName)},</p>
         <p>Your lesson with <strong>${escapeHtml(booking.teacherName)}</strong> has been cancelled.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
    teacher: {
      subject: 'A lesson booking was cancelled',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.teacherName)},</p>
         <p>Your lesson with <strong>${escapeHtml(booking.studentName)}</strong> has been cancelled.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
  };
}

export function eventBookingConfirmedEmailContent(booking: {
  attendeeName: string;
  organizerName: string;
  eventTitle: string;
  startsAt: Date;
  location: string;
}): { attendee: { subject: string; html: string }; organizer: { subject: string; html: string } } {
  const details = `${formatUtc(booking.startsAt)} · ${booking.location}`;
  return {
    attendee: {
      subject: 'Your event booking is confirmed',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.attendeeName)},</p>
         <p>Your booking for <strong>${escapeHtml(booking.eventTitle)}</strong> is confirmed.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
    organizer: {
      subject: 'A new event booking was confirmed',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.organizerName)},</p>
         <p><strong>${escapeHtml(booking.attendeeName)}</strong> booked ${escapeHtml(booking.eventTitle)}.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
  };
}

export function eventBookingCancelledEmailContent(booking: {
  attendeeName: string;
  organizerName: string;
  eventTitle: string;
  startsAt: Date;
  location: string;
}): { attendee: { subject: string; html: string }; organizer: { subject: string; html: string } } {
  const details = `${formatUtc(booking.startsAt)} · ${booking.location}`;
  return {
    attendee: {
      subject: 'Your event booking was cancelled',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.attendeeName)},</p>
         <p>Your booking for <strong>${escapeHtml(booking.eventTitle)}</strong> was cancelled.</p>
         <p>${escapeHtml(details)}</p>`,
      ),
    },
    organizer: {
      subject: 'An event booking was cancelled',
      html: wrapper(
        `<p>Hi ${escapeHtml(booking.organizerName)},</p>
         <p><strong>${escapeHtml(booking.attendeeName)}</strong> cancelled their booking for ${escapeHtml(booking.eventTitle)}.</p>
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
