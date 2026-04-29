'use client';

import { useParams } from 'next/navigation';
import ReportDetailView from '@/components/ReportDetailView';

export default function ReportViewPage() {
  const { id } = useParams<{ id: string }>();
  return <ReportDetailView reportId={id} />;
}
