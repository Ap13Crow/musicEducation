import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GraphQLError } from 'graphql';
import { libraryMediaStoreConfigured, putStoredUpload } from './libraryMediaStore.js';

// Uploaded files go to an external S3-compatible bucket when S3_* is set
// (browser PUTs to a presigned URL). Without it, they go to our own media
// store (Garage, lib/libraryMediaStore.ts) through the API: the browser PUTs
// to /api/uploads/<signed token> and the file is served from /api/files/<key>.
// Neither configured means uploads stay disabled - callers check
// storageConfigured() (a GraphQL query) before showing upload UI at all.
function externalS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
  );
}

function localUploadsConfigured(): boolean {
  return !externalS3Configured() && libraryMediaStoreConfigured() && Boolean(process.env.JWT_SECRET && process.env.FRONTEND_URL);
}

export function storageConfigured(): boolean {
  return externalS3Configured() || localUploadsConfigured();
}

const LOCAL_FILES_PATH = '/api/files/';
const LOCAL_UPLOAD_TTL_MS = 15 * 60 * 1000;
// Per purpose: PDFs and images for slides/documents, longer audio.
const LOCAL_MAX_BYTES: Record<string, number> = { audio: 150 * 1024 * 1024, other: 40 * 1024 * 1024 };

const frontendOrigin = () => process.env.FRONTEND_URL!.replace(/\/$/, '');

export function localFileUrl(key: string): string {
  return `${frontendOrigin()}${LOCAL_FILES_PATH}${key.split('/').map(encodeURIComponent).join('/')}`;
}

function sign(payload: string): string {
  return createHmac('sha256', process.env.JWT_SECRET!).update(`upload:${payload}`).digest('base64url');
}

// What a signed upload link allows: one key, one content type, until exp.
export interface LocalUploadGrant {
  key: string;
  contentType: string;
  maxBytes: number;
  exp: number;
}

export function createLocalUploadToken(grant: LocalUploadGrant): string {
  const payload = Buffer.from(JSON.stringify(grant)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyLocalUploadToken(token: string, now = Date.now()): LocalUploadGrant | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !process.env.JWT_SECRET) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const grant = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as LocalUploadGrant;
    if (typeof grant.key !== 'string' || !grant.key || grant.key.includes('..') || grant.exp < now) return null;
    return grant;
  } catch {
    return null;
  }
}

// Key of a /api/files/... URL on our own site, or null.
export function localKeyFromUrl(fileUrl: string): string | null {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.search || parsed.hash || parsed.origin !== new URL(frontendOrigin()).origin) return null;
    if (!parsed.pathname.startsWith(LOCAL_FILES_PATH)) return null;
    return parsed.pathname.slice(LOCAL_FILES_PATH.length).split('/').map(decodeURIComponent).join('/');
  } catch {
    return null;
  }
}

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    // Works with any S3-compatible endpoint (DO Spaces, MinIO, AWS S3)
    // without needing per-provider virtual-hosted-style bucket subdomains.
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}

export type UploadPurpose =
  | 'TEACHER_APPLICATION_CV'
  | 'TEACHER_APPLICATION_AUDIO'
  | 'TEACHER_APPLICATION_DOCUMENT'
  | 'COURSE_SLIDE'
  | 'TEACHER_PROFILE_IMAGE'
  | 'COURSE_LESSON_AUDIO';

// Matches the instrument/style/level vocabulary elsewhere in the codebase:
// keep the allowed content types narrow and purpose-specific rather than a
// single shared allowlist, so a CV upload can't be swapped for an arbitrary
// file type at the same key prefix.
const PURPOSES: Record<UploadPurpose, { prefix: string; allowedContentTypes: string[] }> = {
  TEACHER_APPLICATION_CV: { prefix: 'teacher-applications/cv', allowedContentTypes: ['application/pdf'] },
  TEACHER_APPLICATION_AUDIO: {
    prefix: 'teacher-applications/audio',
    allowedContentTypes: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg'],
  },
  TEACHER_APPLICATION_DOCUMENT: {
    prefix: 'teacher-applications/documents',
    allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  },
  COURSE_SLIDE: { prefix: 'course-slides', allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg'] },
  // A contentType AUDIO lesson's own audio file (distinct from
  // TEACHER_APPLICATION_AUDIO, which is an applicant's audition recording,
  // not course content) - populated either by a teacher's own upload or by
  // importBnfAudio (see resolvers/bnf.ts).
  COURSE_LESSON_AUDIO: {
    prefix: 'course-lesson-audio',
    allowedContentTypes: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg'],
  },
  // Public teacher directory/profile photo - image only, no PDF (unlike
  // TEACHER_APPLICATION_DOCUMENT, nothing here is ever opened as a document).
  TEACHER_PROFILE_IMAGE: { prefix: 'teacher-profile-images', allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp'] },
};

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() || 'file';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  return cleaned || 'file';
}

export interface UploadTarget {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

// ownerId namespaces the key so two callers can never collide or overwrite
// each other's uploads - always the uploading user's own id, including for
// COURSE_SLIDE (the teacher/admin who requested the URL, not the course),
// which is what addLessonSlide's isOwnedUploadUrl check assumes too.
export async function createUploadTarget(
  purpose: UploadPurpose,
  ownerId: string,
  filename: string,
  contentType: string,
): Promise<UploadTarget> {
  if (!storageConfigured()) {
    throw new GraphQLError('File uploads are not configured on this deployment yet.', {
      extensions: { code: 'STORAGE_NOT_CONFIGURED' },
    });
  }
  const config = PURPOSES[purpose];
  if (!config) throw new GraphQLError('Unknown upload purpose.', { extensions: { code: 'BAD_USER_INPUT' } });
  if (!config.allowedContentTypes.includes(contentType)) {
    throw new GraphQLError(`Unsupported file type for this upload: ${contentType}.`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const key = `${config.prefix}/${ownerId}/${Date.now()}-${randomUUID()}-${sanitizeFilename(filename)}`;
  if (localUploadsConfigured()) {
    const maxBytes = contentType.startsWith('audio/') ? LOCAL_MAX_BYTES.audio : LOCAL_MAX_BYTES.other;
    const token = createLocalUploadToken({ key, contentType, maxBytes, exp: Date.now() + LOCAL_UPLOAD_TTL_MS });
    return { uploadUrl: `${frontendOrigin()}/api/uploads/${token}`, fileUrl: localFileUrl(key), key };
  }
  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 300 });
  const fileUrl = `${process.env.S3_ENDPOINT!.replace(/\/$/, '')}/${process.env.S3_BUCKET}/${key}`;
  return { uploadUrl, fileUrl, key };
}

// Unlike createUploadTarget (mints a presigned URL for the *browser* to PUT
// to), this is for bytes the API server already has in hand - today, only
// importBnfSlide/importBnfAudio (resolvers/bnf.ts), which download a Gallica
// asset server-side rather than hotlink it (see that file's header for why).
// Reuses the same purpose/prefix/content-type allowlist as createUploadTarget
// so both paths land under the same key scheme and pass isOwnedUploadUrl.
export async function uploadServerFetchedAsset(
  purpose: UploadPurpose,
  ownerId: string,
  bytes: Buffer,
  contentType: string,
  filenameHint: string,
): Promise<string> {
  if (!storageConfigured()) {
    throw new GraphQLError('File uploads are not configured on this deployment yet.', {
      extensions: { code: 'STORAGE_NOT_CONFIGURED' },
    });
  }
  const config = PURPOSES[purpose];
  if (!config) throw new GraphQLError('Unknown upload purpose.', { extensions: { code: 'BAD_USER_INPUT' } });
  if (!config.allowedContentTypes.includes(contentType)) {
    throw new GraphQLError(`Unsupported file type for this upload: ${contentType}.`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const key = `${config.prefix}/${ownerId}/${Date.now()}-${randomUUID()}-${sanitizeFilename(filenameHint)}`;
  if (localUploadsConfigured()) {
    await putStoredUpload(key, bytes, contentType);
    return localFileUrl(key);
  }
  await getClient().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: bytes, ContentType: contentType }));
  return `${process.env.S3_ENDPOINT!.replace(/\/$/, '')}/${process.env.S3_BUCKET}/${key}`;
}

// Callers (applyForTeacher, addLessonSlide) persist a fileUrl the browser
// hands back after a PUT - without this check a client could submit any
// external URL for a field that's later rendered to an admin/student
// (iframe/img), or one under the right prefix but a different caller's
// namespace. Confirms the URL is actually one createUploadTarget minted for
// this purpose and this ownerId. Also false whenever storage isn't
// configured, so a stray URL can't sneak past the "uploads disabled" state.
//
// Parses both URLs rather than a raw startsWith on the full string: a plain
// prefix check would also accept the *presigned* uploadUrl (same path
// prefix, but with a `?X-Amz-...` signature query string) as if it were the
// plain fileUrl - which would both leak that signature into a persisted/
// rendered URL and eventually 403 once the signature expires. Rejecting any
// query string or fragment, and matching origin/pathname separately, closes
// that off.
export function isOwnedUploadUrl(fileUrl: string, purpose: UploadPurpose, ownerId: string): boolean {
  if (!storageConfigured()) return false;
  const config = PURPOSES[purpose];
  if (!config) return false;
  if (localUploadsConfigured()) {
    const key = localKeyFromUrl(fileUrl);
    return Boolean(key && key.startsWith(`${config.prefix}/${ownerId}/`));
  }

  let parsed: URL;
  let endpoint: URL;
  try {
    parsed = new URL(fileUrl);
    endpoint = new URL(process.env.S3_ENDPOINT!);
  } catch {
    return false;
  }
  if (parsed.search || parsed.hash) return false;
  if (parsed.origin !== endpoint.origin) return false;

  const expectedPathPrefix = `/${process.env.S3_BUCKET}/${config.prefix}/${ownerId}/`;
  return parsed.pathname.startsWith(expectedPathPrefix);
}
