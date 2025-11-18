"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token');
      let isInvalidToken =
        !token || token === 'null' || token === 'undefined' || token.trim() === '' || (token.split && token.split('.').length !== 3);
      try {
        if (!isInvalidToken && token) {
          const payloadStr = token.split('.')[1];
          const decoded = JSON.parse(atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/')));
          if (decoded && decoded.exp) {
            const nowSec = Math.floor(Date.now() / 1000);
            if (decoded.exp <= nowSec) isInvalidToken = true;
          }
        }
      } catch (e) {
        isInvalidToken = true;
      }

      if (isInvalidToken) {
        try { localStorage.removeItem('access_token'); } catch (e) {}
        router.replace('/');
      }
    } catch (e) {
      router.replace('/');
    }
  }, [router]);

  return <>{children}</>;
}
