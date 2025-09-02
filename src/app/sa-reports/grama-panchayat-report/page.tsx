
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the mgnregs report page by default.
export default function GramaPanchayatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sa-reports/mgnregs-grama-panchayat-report');
  }, [router]);

  return null; 
}
