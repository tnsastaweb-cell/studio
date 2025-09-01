
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the mis-reports page by default.
export default function SaReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sa-reports/mis-reports');
  }, [router]);

  return null; 
}
