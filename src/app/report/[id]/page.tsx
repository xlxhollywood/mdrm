'use client';

import { useRouter, useParams } from 'next/navigation';
import ReportViewer from '@/components/ReportViewer';

export default function ReportViewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  return (
    <ReportViewer
      reportId={id}
      onBack={() => router.push('/report')}
      onEdit={() => router.push(`/report/create?id=${id}`)}
    />
  );
}
