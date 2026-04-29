'use client';

import { useRouter } from 'next/navigation';
import ReportOverview from '@/components/ReportOverview';

export default function ReportPage() {
  const router = useRouter();

  return (
    <ReportOverview
      onOpenReport={(id, params) => {
        if (id === 'new' || id.startsWith('tpl-')) {
          const query = [id !== 'new' ? `type=${id}` : '', params].filter(Boolean).join('&');
          router.push(`/report/create${query ? `?${query}` : ''}`);
        } else {
          router.push(`/report/${id}`);
        }
      }}
    />
  );
}
