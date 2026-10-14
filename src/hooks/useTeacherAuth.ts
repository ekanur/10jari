'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherUser } from '@/lib/authConfig';

export function useTeacherAuth() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.teacher) {
        setTeacher(data.teacher);
      } else {
        setTeacher(null);
      }
    } catch {
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setTeacher(null);
      router.push('/teacher/login');
      router.refresh();
    } catch {
      // ignore
    }
  };

  return {
    teacher,
    loading,
    logout,
    checkAuth,
  };
}
