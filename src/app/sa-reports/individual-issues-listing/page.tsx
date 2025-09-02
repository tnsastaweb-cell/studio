
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the mgnregs report page by default.
export default function IndividualIssuesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sa-reports/mgnregs-individual-issues-listing');
  }, [router]);

  return null; 
}
