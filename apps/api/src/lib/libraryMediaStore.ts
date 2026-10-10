import { createHash } from 'node:crypto';
import type { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { PrismaClient } from '@my-music-coach/database';

// Local media store for the Library: Garage (S3-compatible) on the server's
// second NVMe - see deploy/platform/library-storage. Content-addressed: an
// object's key is its SHA-256, so identical bytes are stored exactly once and
// a stored file can never silently change. Separate from the course-upload
// bucket (lib/storage.ts) and configured by the library-media-s3 Secret.

export function libraryMediaStoreConfigured(): boolean {
  return Boolean(
    process.env.LIBRARY_MEDIA_S3_ENDPOINT &&
      process.env.LIBRARY_MEDIA_S3_BUCKET &&
      process.env.LIBRARY_MEDIA_S3_ACCESS_KEY_ID &&
      process.env.LIBRARY_MEDIA_S3_SECRET_ACCESS_KEY,
  );
}

let client: S3Client | null = null;
function s3(): S3Client {
  client ??= new S3Client({
    endpoint: process.env.LIBRARY_MEDIA_S3_ENDPOINT,
    region: process.env.LIBRARY_MEDIA_S3_REGION || 'garage',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.LIBRARY_MEDIA_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.LIBRARY_MEDIA_S3_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

const bucket = () => process.env.LIBRARY_MEDIA_S3_BUCKET!;

export function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function objectKey(sha256: string): string {
  return `sha256/${sha256.slice(0, 2)}/${sha256}`;
}

// Stores the bytes (once) and records the object. Returns its hash.
export async function storeLibraryObject(prisma: PrismaClient, bytes: Buffer, contentType: string): Promise<string> {
  const sha256 = sha256Hex(bytes);
  const known = await prisma.libraryMediaObject.findUnique({ where: { sha256 } });
  if (!known) {
    await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: objectKey(sha256), Body: bytes, ContentType: contentType }));
    await prisma.libraryMediaObject.upsert({
      where: { sha256 },
      create: { sha256, contentType, size: bytes.length },
      update: {},
    });
  }
  return sha256;
}

export interface StoredObjectStream {
  body: Readable;
  contentType: string;
  contentLength: number;
  contentRange: string | null;
  totalSize: number;
}

// Streams an object, or one byte range of it (audio seeking).
export async function readLibraryObject(sha256: string, range?: string | null): Promise<StoredObjectStream> {
  const total = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: objectKey(sha256) }));
  const result = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: objectKey(sha256), Range: range ?? undefined }));
  return {
    body: result.Body as Readable,
    contentType: result.ContentType ?? 'application/octet-stream',
    contentLength: Number(result.ContentLength ?? 0),
    contentRange: result.ContentRange ?? null,
    totalSize: Number(total.ContentLength ?? 0),
  };
}

// Sends a stored object to the browser, honouring a single byte range so
// audio can seek. Content never changes for a hash, so it caches forever.
export async function sendLibraryObject(req: Request, res: Response, sha256: string): Promise<void> {
  const range = /^bytes=\d*-\d*$/.test(req.headers.range ?? '') ? req.headers.range! : null;
  const object = await readLibraryObject(sha256, range);
  res.setHeader('content-type', object.contentType);
  res.setHeader('accept-ranges', 'bytes');
  res.setHeader('cache-control', 'public, max-age=31536000, immutable');
  res.setHeader('content-length', String(object.contentLength));
  if (range && object.contentRange) {
    res.status(206);
    res.setHeader('content-range', object.contentRange);
  }
  res.on('close', () => object.body.destroy());
  object.body.pipe(res);
}
