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

  describe('isOwnedUploadUrl', () => {
    it('accepts the exact fileUrl createUploadTarget returned', async () => {
      clearStorageEnv();
      setStorageEnv();
      const { createUploadTarget, isOwnedUploadUrl } = await import('../lib/storage.js');
      const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf');
      expect(isOwnedUploadUrl(target.fileUrl, 'TEACHER_APPLICATION_CV', 'user-1')).toBe(true);
    });

    it('rejects the presigned uploadUrl itself (query-string signature, not the plain fileUrl)', async () => {
      clearStorageEnv();
      setStorageEnv();
      const { createUploadTarget, isOwnedUploadUrl } = await import('../lib/storage.js');
      const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf');
      expect(target.uploadUrl).not.toBe(target.fileUrl);
      expect(isOwnedUploadUrl(target.uploadUrl, 'TEACHER_APPLICATION_CV', 'user-1')).toBe(false);
    });

    it('rejects a fileUrl with an appended query string even if the path prefix matches', async () => {
      clearStorageEnv();
      setStorageEnv();
      const { createUploadTarget, isOwnedUploadUrl } = await import('../lib/storage.js');
      const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf');
      expect(isOwnedUploadUrl(`${target.fileUrl}?x=y`, 'TEACHER_APPLICATION_CV', 'user-1')).toBe(false);
    });

    it("rejects another user's legit-looking URL", async () => {
      clearStorageEnv();
      setStorageEnv();
      const { createUploadTarget, isOwnedUploadUrl } = await import('../lib/storage.js');
      const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf');
      expect(isOwnedUploadUrl(target.fileUrl, 'TEACHER_APPLICATION_CV', 'user-2')).toBe(false);
    });

    it('rejects a URL from an unrelated host even with a matching path', async () => {
      clearStorageEnv();
      setStorageEnv();
      const { createUploadTarget, isOwnedUploadUrl } = await import('../lib/storage.js');
      const target = await createUploadTarget('TEACHER_APPLICATION_CV', 'user-1', 'cv.pdf', 'application/pdf');
      const path = new URL(target.fileUrl).pathname;
      expect(isOwnedUploadUrl(`https://evil.example${path}`, 'TEACHER_APPLICATION_CV', 'user-1')).toBe(false);
    });

    it('is false whenever storage is not configured, even for an otherwise well-formed URL', async () => {
      clearStorageEnv();
      const { isOwnedUploadUrl } = await import('../lib/storage.js');
      expect(isOwnedUploadUrl('https://fra1.digitaloceanspaces.com/mymusic-coach-development/teacher-applications/cv/user-1/x.pdf', 'TEACHER_APPLICATION_CV', 'user-1')).toBe(false);
    });
  });

  // No-S3 fallback for the public teacher photo only - CV/audio/documents
  // have no equivalent and must keep going through isOwnedUploadUrl above,
  // storage-configured or not.
  describe('inline teacher photo (no-S3 fallback)', () => {
    // 10x10 solid-color PNG, well under the 400KB cap.
    const TINY_PNG =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+M9QDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    it('isInlineTeacherPhoto recognizes a PNG/JPEG/WebP data URL', async () => {
      const { isInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(isInlineTeacherPhoto(TINY_PNG)).toBe(true);
      expect(isInlineTeacherPhoto('data:image/jpeg;base64,/9j/AAA=')).toBe(true);
      expect(isInlineTeacherPhoto('data:image/webp;base64,AAAA')).toBe(true);
    });

    it('isInlineTeacherPhoto is false for a real S3 URL or an arbitrary string', async () => {
      const { isInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(isInlineTeacherPhoto('https://fra1.digitaloceanspaces.com/bucket/teacher-profile-images/user-1/x.png')).toBe(false);
      expect(isInlineTeacherPhoto('not a url at all')).toBe(false);
    });

    it('isInlineTeacherPhoto rejects a non-image data URL (e.g. a PDF or a script)', async () => {
      const { isInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(isInlineTeacherPhoto('data:application/pdf;base64,AAAA')).toBe(false);
      expect(isInlineTeacherPhoto('data:text/html;base64,AAAA')).toBe(false);
    });

    it('requireInlineTeacherPhoto returns the value unchanged for a small valid image', async () => {
      const { requireInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(requireInlineTeacherPhoto(TINY_PNG)).toBe(TINY_PNG);
    });

    it('requireInlineTeacherPhoto rejects a non-image data URL', async () => {
      const { requireInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(() => requireInlineTeacherPhoto('data:application/pdf;base64,AAAA')).toThrow(/PNG, JPEG, or WebP/);
    });

    it('requireInlineTeacherPhoto rejects a payload over the size cap', async () => {
      const { requireInlineTeacherPhoto, MAX_INLINE_IMAGE_BYTES } = await import('../lib/storage.js');
      // Comfortably over the cap once base64-decoded (base64 ~4/3 the
      // size); rounded up to a multiple of 4 so this exercises the size
      // check specifically, not the base64-structure check below it.
      const rawLength = Math.ceil((MAX_INLINE_IMAGE_BYTES + 1024) * 4 / 3);
      const length = rawLength + ((4 - (rawLength % 4)) % 4);
      const oversized = 'data:image/png;base64,' + 'A'.repeat(length);
      expect(() => requireInlineTeacherPhoto(oversized)).toThrow(/too large/);
    });

    it('requireInlineTeacherPhoto accepts a payload right at the size cap', async () => {
      const { requireInlineTeacherPhoto, MAX_INLINE_IMAGE_BYTES } = await import('../lib/storage.js');
      const atCap = 'data:image/jpeg;base64,' + 'A'.repeat(Math.floor(MAX_INLINE_IMAGE_BYTES * 4 / 3 / 4) * 4);
      expect(() => requireInlineTeacherPhoto(atCap)).not.toThrow();
    });

    // Regression (Copilot review finding on PR #52): a base64 payload whose
    // length isn't a multiple of 4, or that has more than 2 trailing '='
    // pad characters, isn't valid/decodable base64 at all - the old check
    // only looked at size, so a string like the single character "A" passed
    // straight through and would have been persisted as a broken data: URL.
    it('requireInlineTeacherPhoto rejects a payload whose length is not a multiple of 4', async () => {
      const { requireInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,A')).toThrow(/PNG, JPEG, or WebP/);
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,AAAAA')).toThrow(/PNG, JPEG, or WebP/);
    });

    it('requireInlineTeacherPhoto rejects a payload with more than 2 trailing pad characters', async () => {
      const { requireInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,A===')).toThrow(/PNG, JPEG, or WebP/);
    });

    it('requireInlineTeacherPhoto accepts well-formed base64 with 0, 1, or 2 trailing pad characters', async () => {
      const { requireInlineTeacherPhoto } = await import('../lib/storage.js');
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,AAAA')).not.toThrow();
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,AAA=')).not.toThrow();
      expect(() => requireInlineTeacherPhoto('data:image/png;base64,AA==')).not.toThrow();
    });
  });
});
