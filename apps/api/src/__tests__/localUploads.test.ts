jest.mock('../lib/libraryMediaStore', () => ({ libraryMediaStoreConfigured: () => true, putStoredUpload: jest.fn(async () => undefined) }));

import { putStoredUpload } from '../lib/libraryMediaStore';
import { createLocalUploadToken, createUploadTarget, isOwnedUploadUrl, localKeyFromUrl, storageConfigured, uploadServerFetchedAsset, verifyLocalUploadToken } from '../lib/storage';

beforeEach(() => {
  delete process.env.S3_ENDPOINT;
  process.env.JWT_SECRET = 'test-secret';
  process.env.FRONTEND_URL = 'https://mymusic.coach';
});

describe('uploads into our own media store', () => {
  it('is on without external S3', () => {
    expect(storageConfigured()).toBe(true);
  });

  it('hands out a signed same-origin upload link and a file URL', async () => {
    const target = await createUploadTarget('COURSE_SLIDE', 'teacher-1', 'Week 1.png', 'image/png');
    expect(target.uploadUrl).toMatch(/^https:\/\/mymusic\.coach\/api\/uploads\/[\w-]+\.[\w-]+$/);
    expect(target.fileUrl).toMatch(/^https:\/\/mymusic\.coach\/api\/files\/course-slides\/teacher-1\/\d+-[\w-]+-Week_1\.png$/);
    const grant = verifyLocalUploadToken(target.uploadUrl.split('/').pop()!);
    expect(grant).toMatchObject({ key: target.key, contentType: 'image/png' });
    expect(isOwnedUploadUrl(target.fileUrl, 'COURSE_SLIDE', 'teacher-1')).toBe(true);
    expect(isOwnedUploadUrl(target.fileUrl, 'COURSE_SLIDE', 'teacher-2')).toBe(false);
    expect(isOwnedUploadUrl(target.fileUrl, 'TEACHER_APPLICATION_CV', 'teacher-1')).toBe(false);
  });

  it('rejects forged, altered and expired links', () => {
    const token = createLocalUploadToken({ key: 'course-slides/t/a.png', contentType: 'image/png', maxBytes: 10, exp: Date.now() + 60_000 });
    expect(verifyLocalUploadToken(token)).not.toBeNull();
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ key: 'course-slides/x/a.png', contentType: 'image/png', maxBytes: 10, exp: Date.now() + 60_000 })).toString('base64url');
    expect(verifyLocalUploadToken(`${forged}.${signature}`)).toBeNull();
    expect(verifyLocalUploadToken(`${payload}.x${signature.slice(1)}`)).toBeNull();
    const expired = createLocalUploadToken({ key: 'k', contentType: 'image/png', maxBytes: 10, exp: Date.now() - 1 });
    expect(verifyLocalUploadToken(expired)).toBeNull();
  });

  it('only accepts its own file URLs', () => {
    expect(localKeyFromUrl('https://mymusic.coach/api/files/course-slides/t/a.png')).toBe('course-slides/t/a.png');
    expect(localKeyFromUrl('https://evil.example/api/files/course-slides/t/a.png')).toBeNull();
    expect(localKeyFromUrl('https://mymusic.coach/api/files/course-slides/t/a.png?x=1')).toBeNull();
  });

  it('stores server-side assets directly', async () => {
    const url = await uploadServerFetchedAsset('COURSE_SLIDE', 'teacher-1', Buffer.from('png'), 'image/png', 'slide.png');
    expect(putStoredUpload).toHaveBeenCalledWith(expect.stringMatching(/^course-slides\/teacher-1\//), Buffer.from('png'), 'image/png');
    expect(url).toMatch(/^https:\/\/mymusic\.coach\/api\/files\/course-slides\/teacher-1\//);
  });
});
