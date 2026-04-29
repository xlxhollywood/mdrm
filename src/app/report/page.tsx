'use client';

import { useRouter } from 'next/navigation';
import ReportOverview from '@/components/ReportOverview';

export default function ReportPage() {
  const router = useRouter();

  return (
    <ReportOverview
      onOpenReport={(id) => {
        if (id === 'new' || id.startsWith('tpl-')) {
          router.push(`/report/create${id !== 'new' ? `?type=${id}` : ''}`);
        } else {
          router.push(`/report/${id}`);
        }
      }}
    />
  );
}
