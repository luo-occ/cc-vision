'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import DashboardPage from '@/components/pages/dashboard/dashboard-page';
import HoldingsPage from '@/components/pages/holdings/holdings-page';
import PerformancePage from '@/components/pages/performance/performance-page';
import ActivitiesPage from '@/components/pages/activities/activities-page';
import SettingsPage from '@/components/pages/settings/settings-page';
import { AppLoader } from '@/components/ui/app-loader';

export function ClientRouter() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <AppLoader text="Initializing Portfolio Tracker..." />;
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