const ORIGINAL_MAILER_ENV = { ...process.env };

function setSmtpEnv() {
  process.env.SMTP_HOST = 'smtp-relay.gmail.com';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'camille@mymusic.coach';
  process.env.SMTP_PASSWORD = 'test-password';
  process.env.SMTP_FROM = 'camille@mymusic.coach';
}

function clearSmtpEnv() {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_FROM;
}

describe('mailer', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_MAILER_ENV };
    jest.resetModules();
  });

  it('mailConfigured() is false when SMTP_* is unset', async () => {
    clearSmtpEnv();
    const { mailConfigured } = await import('../lib/mailer.js');
    expect(mailConfigured()).toBe(false);
  });

  it('mailConfigured() is false when only some SMTP_* vars are set', async () => {
    clearSmtpEnv();
    process.env.SMTP_HOST = 'smtp-relay.gmail.com';
    process.env.SMTP_USER = 'camille@mymusic.coach';
    // SMTP_PASSWORD and SMTP_FROM missing
    const { mailConfigured } = await import('../lib/mailer.js');
    expect(mailConfigured()).toBe(false);
  });

  it('mailConfigured() is true once host/user/password/from are all set', async () => {
    clearSmtpEnv();
    setSmtpEnv();
    const { mailConfigured } = await import('../lib/mailer.js');
    expect(mailConfigured()).toBe(true);
  });

  // The whole point of this no-op contract: a booking or purchase mutation
  // must never fail because email isn't configured yet in this deployment.
  it('sendMail() no-ops (resolves false, never throws) when unconfigured', async () => {
    clearSmtpEnv();
    const { sendMail } = await import('../lib/mailer.js');
    await expect(sendMail({ to: 'student@example.com', subject: 'Hi', html: '<p>Hi</p>' })).resolves.toBe(false);
  });

  // Configured but unreachable (e.g. relay down, wrong port) must also
  // resolve false rather than reject - the same no-throw contract applies
  // to a failed send, not just an absent config.
  it('sendMail() resolves false (never throws) when the relay is unreachable', async () => {
    clearSmtpEnv();
    setSmtpEnv();
    process.env.SMTP_HOST = '127.0.0.1';
    process.env.SMTP_PORT = '1'; // nothing listens here
    const { sendMail } = await import('../lib/mailer.js');
    await expect(sendMail({ to: 'student@example.com', subject: 'Hi', html: '<p>Hi</p>' })).resolves.toBe(false);
  }, 10_000);
});
