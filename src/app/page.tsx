'use client';

import { useState } from 'react';
import WidgetDashboard from '@/components/WidgetDashboard';
import ReportOverview from '@/components/ReportOverview';
import ReportViewer from '@/components/ReportViewer';

export default function Home() {
  const [view, setView] = useState<'overview' | 'editor' | 'viewer'>('overview');
  const [reportId, setReportId] = useState<string | null>(null);

  if (view === 'editor') {
    return (
      <WidgetDashboard
        onBack={() => { setView('overview'); setReportId(null); }}
      />
    );
  }

  if (view === 'viewer' && reportId) {
    return (
      <ReportViewer
        reportId={reportId}
        onBack={() => { setView('overview'); setReportId(null); }}
        onEdit={() => setView('editor')}
      />
    );
  }

  return (
    <ReportOverview
      onOpenReport={(id) => {
        setReportId(id);
        // 템플릿이나 new → 에디터, 기존 리포트 → 뷰어
        if (id === 'new' || id.startsWith('tpl-')) {
          setView('editor');
        } else {
          setView('viewer');
        }
      }}
    />
  );
}
