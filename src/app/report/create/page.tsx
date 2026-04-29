'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WidgetDashboard from '@/components/WidgetDashboard';

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || undefined;
  const id = searchParams.get('id') || undefined;

  return (
    <WidgetDashboard
      onBack={() => router.push('/report')}
      templateType={type || id}
    />
  );
}

export default function ReportCreatePage() {
  return (
    <Suspense>
      <CreateContent />
    </Suspense>
  );
}
