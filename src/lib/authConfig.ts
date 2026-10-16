import type { NextRequest } from 'next/server';

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
}

export const AUTH_COOKIE_NAME = 'typearena_teacher_session';

const AUTH_SECRET =
  process.env.AUTH_SECRET || 'typearena-stembayo-hmac-secret-key-2026-v1';

// Fungsi ambil akun guru dari Environment Variables (dengan fallback default)
export function getTeacherAccounts(): {
  [email: string]: { password: string; user: TeacherUser };
} {
  const teacherEmail = (process.env.TEACHER_EMAIL || 'guru@sekolah.id').trim().toLowerCase();
  const teacherPassword = process.env.TEACHER_PASSWORD || 'guru10jari';
  const teacherName = process.env.TEACHER_NAME || 'Bapak Eka (Guru)';

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@typearena.id').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin10jari';

  return {
    [teacherEmail]: {
      password: teacherPassword,
      user: {
        id: 'teacher-1',
        name: teacherName,
        email: teacherEmail,
        role: 'teacher',
      },
    },
    [adminEmail]: {
      password: adminPassword,
      user: {
        id: 'admin-1',
        name: 'Admin Sekolah',
        email: adminEmail,
        role: 'admin',
      },
    },
  };
}

// Kompatibilitas ekspor konstanta lama
export const TEACHER_ACCOUNTS = getTeacherAccounts();

/**
 * Implementasi SHA-256 & HMAC-SHA256 murni (kompatibel di Node.js & Next.js Edge Middleware)
 */
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function sha256Bytes(msgBytes: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = msgBytes.length * 8;
  const padLen = ((msgBytes.length + 8) >>> 6 << 6) + 64;
  const padded = new Uint8Array(padLen);
  padded.set(msgBytes);
  padded[msgBytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function hmacSha256Hex(keyStr: string, messageStr: string): string {
  const encoder = new TextEncoder();
  let keyBytes: Uint8Array = encoder.encode(keyStr);
  if (keyBytes.length > 64) {
    keyBytes = sha256Bytes(keyBytes);
  }
  const paddedKey = new Uint8Array(64);
  paddedKey.set(keyBytes);

  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const msgBytes = encoder.encode(messageStr);
  const innerInput = new Uint8Array(64 + msgBytes.length);
  innerInput.set(iKeyPad);
  innerInput.set(msgBytes, 64);
  const innerHash = sha256Bytes(innerInput);

  const outerInput = new Uint8Array(64 + 32);
  outerInput.set(oKeyPad);
  outerInput.set(innerHash, 64);
  const finalHash = sha256Bytes(outerInput);

  return Array.from(finalHash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(b64)));
}

// Perbandingan string waktu-konstan untuk mencegah timing attack
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Buat token sesi dengan tanda tangan kriptografi HMAC-SHA256
 * Format: <base64_payload>.<hmac_sha256_hex>
 */
export function generateSessionToken(user: TeacherUser): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  };
  const payloadB64 = toBase64(JSON.stringify(payload));
  const signature = hmacSha256Hex(AUTH_SECRET, payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifikasi keaslian tanda tangan HMAC-SHA256 & masa berlaku token
 */
export function verifySessionToken(token: string): TeacherUser | null {
  try {
    if (!token || !token.includes('.')) {
      return null;
    }
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) {
      return null;
    }

    const expectedSig = hmacSha256Hex(AUTH_SECRET, payloadB64);
    if (!timingSafeEqualStr(signature, expectedSig)) {
      return null;
    }

    const raw = fromBase64(payloadB64);
    const payload = JSON.parse(raw);

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    if (payload.role !== 'teacher' && payload.role !== 'admin') {
      return null;
    }

    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Helper validasi apakah request berasal dari Guru yang terautentikasi sah
 */
export function getAuthenticatedTeacher(req: NextRequest): TeacherUser | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
