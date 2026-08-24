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

export async function createAdminSessionToken(): Promise<string> {
  const key = await getKey();
  const payload = new TextEncoder().encode('admin');
  const signature = await crypto.subtle.sign('HMAC', key, payload.buffer as ArrayBuffer);
  return `${base64UrlEncode(payload.buffer as ArrayBuffer)}.${base64UrlEncode(signature)}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    getSessionSecret();
  } catch {
    return false;
  }

  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return false;

  try {
    const payload = await base64UrlDecode(payloadB64);
    const expectedPayload = new TextEncoder().encode('admin');
    if (payload.length !== expectedPayload.length) return false;
    for (let i = 0; i < payload.length; i++) {
      if (payload[i] !== expectedPayload[i]) return false;
    }

    const signature = await base64UrlDecode(signatureB64);
    const key = await getKey();
    return await crypto.subtle.verify('HMAC', key, signature.buffer as ArrayBuffer, payload.buffer as ArrayBuffer);
  } catch {
    return false;
  }
}
