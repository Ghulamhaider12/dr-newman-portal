import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * DigitalOcean Spaces (S3-compatible) helper.
 *
 * In production this issues signed PUT URLs for uploads and short-lived signed
 * GET URLs for downloads. When Spaces credentials are not configured (local
 * dev), it falls back to local-disk storage served from /uploads so the whole
 * app remains runnable without cloud secrets.
 */

const ENDPOINT = process.env.DO_SPACES_ENDPOINT || '';
const REGION = process.env.DO_SPACES_REGION || 'us-east-1';
const BUCKET = process.env.DO_SPACES_BUCKET || '';
const KEY = process.env.DO_SPACES_KEY || '';
const SECRET = process.env.DO_SPACES_SECRET || '';
const CDN = process.env.DO_SPACES_CDN || '';

export const spacesConfigured = Boolean(ENDPOINT && BUCKET && KEY && SECRET);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: ENDPOINT,
      region: REGION,
      credentials: { accessKeyId: KEY, secretAccessKey: SECRET },
      forcePathStyle: false,
    });
  }
  return client;
}

/** A short-lived signed PUT URL the browser uploads directly to. */
export async function getSignedUploadUrl(storageKey: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: contentType,
    ACL: 'private',
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: 60 * 5 });
}

/**
 * A short-lived signed GET URL used by the download route handler and inline
 * previews. `expiresIn` is in seconds (default 5 min); previews pass a longer
 * window so HTML5 <video> range requests don't 403 mid-playback.
 */
export async function getSignedDownloadUrl(
  storageKey: string,
  expiresIn: number = 60 * 5
): Promise<string> {
  if (!spacesConfigured) {
    // Local fallback: files live under /public/uploads and are public.
    return `/uploads/${storageKey.replace(/^uploads\//, '')}`;
  }
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

/** Public CDN URL for a public-read object (e.g. homepage background photo). */
export function publicUrl(storageKey: string): string {
  if (!spacesConfigured) {
    return `/uploads/${storageKey.replace(/^uploads\//, '')}`;
  }
  if (CDN) return `${CDN.replace(/\/$/, '')}/${storageKey}`;
  return `${ENDPOINT.replace(/\/$/, '')}/${BUCKET}/${storageKey}`;
}

/** Build a unique-ish storage key from a filename (no Math.random for det. builds). */
export function buildStorageKey(filename: string, seed: number): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `uploads/${seed}-${safe}`;
}
