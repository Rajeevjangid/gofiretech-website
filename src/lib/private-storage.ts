import path from 'path'
import { promises as fs } from 'fs'
import crypto from 'crypto'

// Private (non-public) storage: files live outside /public and are only
// reachable through authorized API routes.
const ROOT = process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private-uploads')

export const MAX_DOC_SIZE = 10 * 1024 * 1024
export const ALLOWED_DOC_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export async function savePrivateFile(buf: Buffer, mimeType: string): Promise<string> {
  await fs.mkdir(ROOT, { recursive: true })
  const key = crypto.randomBytes(24).toString('hex') + (ALLOWED_DOC_TYPES[mimeType] ?? '')
  await fs.writeFile(path.join(ROOT, key), buf)
  return key
}

export async function readPrivateFile(key: string): Promise<Buffer> {
  if (!/^[a-f0-9]{48}(\.[a-z]+)?$/.test(key)) throw new Error('bad key')
  return fs.readFile(path.join(ROOT, key))
}

export async function deletePrivateFile(key: string): Promise<void> {
  if (!/^[a-f0-9]{48}(\.[a-z]+)?$/.test(key)) return
  await fs.unlink(path.join(ROOT, key)).catch(() => {})
}
