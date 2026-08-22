import nodemailer, { type Transporter } from 'nodemailer';

// Same Google Workspace SMTP relay config apps/api/src/lib/mailer.ts uses
// (see deploy/README.md) - duplicated rather than shared, matching this
// repo's existing convention for small per-app lib helpers (see
// apps/api/src/lib/ai.ts vs apps/worker/src/lib/ai.ts). This is the only
// thing in the worker that actually calls the SMTP relay; the mail-dispatch
// job is the only caller.
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
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return cachedTransport;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Unlike apps/api's sendMail, this throws on failure rather than swallowing
// it into a boolean - the mail-dispatch job needs the real error to decide
// retry/backoff/dead-letter and to record lastError for admin visibility.
export async function sendMail(message: MailMessage): Promise<void> {
  if (!mailConfigured()) {
    throw new Error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD/SMTP_FROM).');
  }
  await getTransport().sendMail({
    from: `${process.env.SMTP_FROM_NAME ?? 'MyMusic.Coach'} <${process.env.SMTP_FROM}>`,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: stripHtml(message.html),
  });
}
