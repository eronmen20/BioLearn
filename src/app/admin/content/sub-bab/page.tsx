'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubBabPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/content/materi-biologi');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-muted">Mengalihkan ke Materi Biologi...</p>
    </div>
  );
}
