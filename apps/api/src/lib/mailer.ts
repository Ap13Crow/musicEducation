import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../utils/logger.js';

// Transactional email via a Google Workspace SMTP relay (smtp-relay.gmail.com,
// see deploy/README.md) - not Keycloak's own email verification, which is
// configured separately on the realm itself (see
// deploy/overlays/dev/keycloak-realm/realm-import.yaml). Absent config means
// sending is silently skipped, same convention as storage.ts/ai.ts: nothing
// user-facing (a booking, a purchase) should ever fail because an optional
// notification couldn't go out.
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
}

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;
  const port = Number(process.env.SMTP_PORT ?? '587');
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Google's relay documents ports 25/465/587. 465 is implicit TLS from
    // the first byte; 587 (the one actually used here) negotiates TLS via
    // STARTTLS after connecting in plaintext - nodemailer's `secure` flag
    // picks which handshake to perform, so it must match the chosen port.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return cachedTransport;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Defaults to a plain-text version stripped from html. */
  text?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Sends a transactional email. Returns whether it was actually sent -
 * false when SMTP isn't configured or the send failed - purely for
 * logging/tests. Callers must never let a false result block the mutation
 * that triggered it (booking confirmed, purchase completed, etc.); email is
 * always a best-effort side effect, not part of the state transition itself.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    await getTransport().sendMail({
      from: `${process.env.SMTP_FROM_NAME ?? 'MyMusic.Coach'} <${process.env.SMTP_FROM}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text ?? stripHtml(message.html),
    });
    return true;
  } catch (error) {
    logger.warn({ error, to: message.to, subject: message.subject }, 'sendMail failed');
    return false;
  }
}
