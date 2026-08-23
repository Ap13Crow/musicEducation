import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GraphQLError } from 'graphql';

// S3-compatible object storage (DigitalOcean Spaces in production). Absent
// config means uploads stay disabled rather than crashing the API - callers
// should check storageConfigured() (exposed as a GraphQL query) before
// showing upload UI at all.
export function storageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
  );
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
  | 'TEACHER_PROFILE_IMAGE';

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
  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 300 });
  const fileUrl = `${process.env.S3_ENDPOINT!.replace(/\/$/, '')}/${process.env.S3_BUCKET}/${key}`;
  return { uploadUrl, fileUrl, key };
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
// ── Inline (no-S3) fallback for the public teacher photo ──────────────────
//
// storageConfigured() being false blocks every real upload (CV, audio,
// documents, photo alike) because none of them can be proven to belong to
// the uploading user without a presigned URL. The photo is the one exception
// worth a fallback: it's small, optional, and its absence is the single most
// visible defect on a deployment without S3_* secrets (an applicant sees
// "add a photo" on step 1, then a wall of dead ends). So when storage isn't
// configured, the *photo only* (never CV/audio/documents - those stay
// S3-only, both because they're larger and because they're never rendered
// back at students the way the photo is) can be submitted as a small
// data: URL instead, stored directly in the same String column S3 uploads
// use. The web client resizes/compresses the image before encoding (see
// resizeImageToDataUrl in apps/web/src/lib/upload.ts) so a real photo fits
// well under the cap below.
export const MAX_INLINE_IMAGE_BYTES = 400 * 1024; // 400 KB decoded

const INLINE_IMAGE_DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+=*)$/;

export function isInlineTeacherPhoto(value: string): boolean {
  return INLINE_IMAGE_DATA_URL_PATTERN.test(value);
}

export function requireInlineTeacherPhoto(value: string): string {
  const match = INLINE_IMAGE_DATA_URL_PATTERN.exec(value);
  if (!match) {
    throw new GraphQLError('Photo must be a PNG, JPEG, or WebP image.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  const base64 = match[2];
  // A well-formed base64 payload is always a multiple of 4 characters long,
  // with at most 2 trailing '=' pad characters (Copilot review finding on
  // PR #52: a payload like the single character "A" matched the character
  // class and passed the old size check below, but isn't valid/decodable
  // base64 at all - a broken data: URL would have been persisted). Reject
  // that here, before trusting the length to compute a decoded byte count.
  const paddingLength = (/=*$/.exec(base64) as RegExpExecArray)[0].length;
  if (base64.length % 4 !== 0 || paddingLength > 2) {
    throw new GraphQLError('Photo must be a PNG, JPEG, or WebP image.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  // Decoded byte length from the (now known well-formed) base64 payload
  // length, without actually decoding it - 4 base64 chars encode 3 bytes,
  // minus 1 byte per trailing '=' pad character.
  const approxBytes = Math.floor((base64.length * 3) / 4) - paddingLength;
  if (approxBytes > MAX_INLINE_IMAGE_BYTES) {
    throw new GraphQLError('Photo is too large - please use a smaller image (under 400KB).', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return value;
}

export function isOwnedUploadUrl(fileUrl: string, purpose: UploadPurpose, ownerId: string): boolean {
  if (!storageConfigured()) return false;
  const config = PURPOSES[purpose];
  if (!config) return false;

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
