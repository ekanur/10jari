export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
}

// Akun Pendidik & Admin Default (Dapat disesuaikan)
export const TEACHER_ACCOUNTS: { [email: string]: { password: string; user: TeacherUser } } = {
  'guru@sekolah.id': {
    password: 'guru10jari',
    user: {
      id: 'teacher-1',
      name: 'Bapak Eka (Guru)',
      email: 'guru@sekolah.id',
      role: 'teacher',
    },
  },
  'admin@typearena.id': {
    password: 'admin10jari',
    user: {
      id: 'admin-1',
      name: 'Admin Sekolah',
      email: 'admin@typearena.id',
      role: 'admin',
    },
  },
};

export const AUTH_COOKIE_NAME = 'typearena_teacher_session';

// Helper token sederhana untuk sesi
export function generateSessionToken(user: TeacherUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifySessionToken(token: string): TeacherUser | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(raw);
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
