'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import DashboardPage from '@/components/pages/dashboard/dashboard-page';
import HoldingsPage from '@/components/pages/holdings/holdings-page';
import PerformancePage from '@/components/pages/performance/performance-page';
import ActivitiesPage from '@/components/pages/activities/activities-page';
import SettingsPage from '@/components/pages/settings/settings-page';

export function ClientRouter() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="holdings" element={<HoldingsPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}