'use client';

import { useRouter } from 'next/navigation';
import WidgetDashboard from '@/components/WidgetDashboard';

export default function ReportCreatePage() {
  const router = useRouter();

  return (
    <WidgetDashboard
      onBack={() => router.push('/report')}
    />
  );
}
