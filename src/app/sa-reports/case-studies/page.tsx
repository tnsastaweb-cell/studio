
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the view page by default.
export default function CaseStudiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sa-reports/case-studies/view');
  }, [router]);

  return null; 
}
