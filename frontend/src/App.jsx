import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SimulatorPage from './pages/SimulatorPage';
import DelayedReleaseVaultPage from './pages/DelayedReleaseVaultPage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RulesEnginePage from './pages/RulesEnginePage';
import ThreatTaxonomyPage from './pages/ThreatTaxonomyPage';
import ApiDocsPage from './pages/ApiDocsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<SimulatorPage />} />
              <Route path="/delayed-release" element={<DelayedReleaseVaultPage />} />
              <Route path="/monitor" element={<LiveMonitorPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/rules" element={<RulesEnginePage />} />
              <Route path="/threats" element={<ThreatTaxonomyPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

