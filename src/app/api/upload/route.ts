import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/apiAuth';
import { detectFileType } from '@/lib/fileType';
import { spacesConfigured, buildStorageKey, publicUrl } from '@/lib/spaces';

export const runtime = 'nodejs';

/**
 * Admin: upload a file. Streams to DigitalOcean Spaces when configured,
 * otherwise writes to /public/uploads so local dev works without cloud secrets.
 * Returns the storageKey + auto-detected file type — the UI shows the type as a
 * badge and never offers a manual dropdown.
 *
 * `kind=background` marks a public-read homepage photo.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!form || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const kind = (form.get('kind') as string) || 'file';
  const filename = file.name;
  const fileType = detectFileType(filename);

  if (kind === 'file' && !fileType) {
    return NextResponse.json({ error: `Unsupported file type: ${filename}` }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Deterministic-ish key from filename length + size (no Math.random).
  const seed = filename.length * 1000 + bytes.length;
  const storageKey = buildStorageKey(filename, seed);

  if (spacesConfigured) {
    const client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET!,
        Key: storageKey,
        Body: bytes,
        ContentType: file.type || 'application/octet-stream',
        ACL: kind === 'background' || kind === 'inline' ? 'public-read' : 'private',
      })
    );
  } else {
    // Local fallback under /public/uploads
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    const localName = storageKey.replace(/^uploads\//, '');
    await writeFile(path.join(dir, localName), bytes);
  }

  return NextResponse.json({
    ok: true,
    storageKey,
    // Directly-usable public URL — correct for local (/uploads/...) and for
    // public-read Spaces objects (background/inline). Embedded in description
    // HTML by the WYSIWYG image tool.
    url: publicUrl(storageKey),
    filename,
    fileType: fileType ?? 'MP4',
    fileSize: bytes.length,
  });
}
