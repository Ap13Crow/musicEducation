const ORIGINAL_ENV = { ...process.env };

function setStorageEnv() {
  process.env.S3_ENDPOINT = 'https://fra1.digitaloceanspaces.com';
  process.env.S3_REGION = 'fra1';
  process.env.S3_BUCKET = 'mymusic-coach-development';
  process.env.S3_ACCESS_KEY_ID = 'test-key-id';
  process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
}

function clearStorageEnv() {
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_REGION;
  delete process.env.S3_BUCKET;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
}

describe('storage', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it('storageConfigured is false when any S3_* var is missing', async () => {
    clearStorageEnv();
    const { storageConfigured } = await import('../lib/storage.js');
    expect(storageConfigured()).toBe(false);
  });

  it('storageConfigured is true once all S3_* vars are set', async () => {
    clearStorageEnv();
    setStorageEnv();
    const { storageConfigured } = await import('../lib/storage.js');
    expect(storageConfigured()).toBe(true);
  });

  it('createUploadTarget throws STORAGE_NOT_CONFIGURED when unconfigured', async () => {
    clearStorageEnv();
    const { createUploadTarget } = await import('../lib/storage.js');
    await expect(createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf')).rejects.toMatchObject({
      extensions: { code: 'STORAGE_NOT_CONFIGURED' },
    });
  });

  it('createUploadTarget rejects a content type outside the purpose allowlist', async () => {
    clearStorageEnv();
    setStorageEnv();
    const { createUploadTarget } = await import('../lib/storage.js');
    await expect(createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.exe', 'application/x-msdownload')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('createUploadTarget returns a presigned uploadUrl and matching fileUrl/key for an allowed content type', async () => {
    clearStorageEnv();
    setStorageEnv();
    const { createUploadTarget } = await import('../lib/storage.js');
    const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'My CV.pdf', 'application/pdf');
    expect(target.uploadUrl).toMatch(/^https:\/\/fra1\.digitaloceanspaces\.com\//);
    expect(target.key).toMatch(/^teacher-applications\/cv\/user-1\/.*My_CV\.pdf$/);
    expect(target.fileUrl).toBe(`https://fra1.digitaloceanspaces.com/mymusic-coach-development/${target.key}`);
  });

  it('createUploadTarget namespaces keys by ownerId so two callers cannot collide', async () => {
    clearStorageEnv();
    setStorageEnv();
    const { createUploadTarget } = await import('../lib/storage.js');
    const a = await createUploadTarget('COURSE_SLIDE', 'teacher-a', 'slide1.png', 'image/png');
    const b = await createUploadTarget('COURSE_SLIDE', 'teacher-b', 'slide1.png', 'image/png');
    expect(a.key).not.toBe(b.key);
    expect(a.key.startsWith('course-slides/teacher-a/')).toBe(true);
    expect(b.key.startsWith('course-slides/teacher-b/')).toBe(true);
  });
});
