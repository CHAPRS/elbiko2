function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('SESSION_SECRET or ADMIN_PASSWORD must be set');
  }
  return secret;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function base64UrlDecode(input: string): Promise<Uint8Array> {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSessionSecret());
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export const ADMIN_ROLES = ['OWNER', 'DISPATCHER'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export async function createAdminSessionToken(role: AdminRole = 'OWNER'): Promise<string> {
  const key = await getKey();
  const payloadObj = { type: 'admin', role };
  const payload = new TextEncoder().encode(JSON.stringify(payloadObj));
  const signature = await crypto.subtle.sign('HMAC', key, payload.buffer as ArrayBuffer);
  return `${base64UrlEncode(payload.buffer as ArrayBuffer)}.${base64UrlEncode(signature)}`;
}

export interface AdminSessionResult {
  valid: boolean;
  role: AdminRole | null;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<AdminSessionResult> {
  if (!token) {
    console.error('[verifyAdminSessionToken] no token');
    return { valid: false, role: null };
  }

  try {
    const secret = getSessionSecret();
    console.log('[verifyAdminSessionToken] token present, secret prefix:', secret.slice(0, 4));
  } catch (e) {
    console.error('[verifyAdminSessionToken] getSessionSecret error:', (e as Error).message);
    return { valid: false, role: null };
  }

  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) {
    console.error('[verifyAdminSessionToken] malformed token');
    return { valid: false, role: null };
  }

  try {
    const payload = await base64UrlDecode(payloadB64);
    const key = await getKey();
    const signature = await base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature.buffer as ArrayBuffer,
      payload.buffer as ArrayBuffer
    );
    if (!valid) {
      console.error('[verifyAdminSessionToken] HMAC not valid');
      return { valid: false, role: null };
    }

    const text = new TextDecoder().decode(payload);
    let role: AdminRole = 'OWNER';

    if (text === 'admin') {
      role = 'OWNER';
    } else {
      const parsed = JSON.parse(text);
      if (ADMIN_ROLES.includes(parsed.role)) {
        role = parsed.role as AdminRole;
      }
    }

    console.log('[verifyAdminSessionToken] valid, role:', role);
    return { valid: true, role };
  } catch (e) {
    console.error('[verifyAdminSessionToken] verify error:', (e as Error).message);
    return { valid: false, role: null };
  }
}
