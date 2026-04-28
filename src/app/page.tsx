'use client';

import { useState } from 'react';
import WidgetDashboard from '@/components/WidgetDashboard';
import ReportOverview from '@/components/ReportOverview';

export default function Home() {
  const [view, setView] = useState<'overview' | 'editor'>('overview');
  const [reportId, setReportId] = useState<string | null>(null);

  if (view === 'editor') {
    return (
      <WidgetDashboard
        onBack={() => { setView('overview'); setReportId(null); }}
      />
    );
  }

  return (
    <ReportOverview
      onOpenReport={(id) => { setReportId(id); setView('editor'); }}
    />
  );
}
