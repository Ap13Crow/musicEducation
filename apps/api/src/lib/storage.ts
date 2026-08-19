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
  | 'COURSE_SLIDE';

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
