import { randomBytes, pbkdf2, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64');
  const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEYLEN, DIGEST);
  const hash = derivedKey.toString('base64');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;

  // Legacy plain text migration path: if no ':' separator, treat as plain text
  if (!stored.includes(':')) {
    return password === stored;
  }

  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEYLEN, DIGEST);
  const providedHash = derivedKey.toString('base64');

  const storedBuf = Buffer.from(hash, 'base64');
  const providedBuf = Buffer.from(providedHash, 'base64');

  if (storedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(storedBuf, providedBuf);
}
