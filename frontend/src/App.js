import React, { useState, useEffect, useCallback } from 'react';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import Toolbar from './components/Toolbar';
import { getLeads } from './api';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/sort state
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [sortBy, setSortBy] = useState('distressScore');
  const [sortDir, setSortDir] = useState('desc');

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Poll for updates when any lead is currently scoring
  useEffect(() => {
    const hasScoring = leads.some((l) => l.status === 'scoring');
    if (!hasScoring) return;
    const interval = setInterval(fetchLeads, 3000);
    return () => clearInterval(interval);
  }, [leads, fetchLeads]);

  function handleUploaded(result) {
    setLeads((prev) => {
      const existingIds = new Set(prev.map((l) => l.id));
      const newLeads = result.leads.filter((l) => !existingIds.has(l.id));
      return [...newLeads, ...prev];
    });
  }

  function handleLeadUpdated(updated) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Distressed Property Lead Finder</h1>
            <p className="text-xs text-gray-400">Upload Propstream CSV → AI scores distress → Export top leads</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Upload */}
        <UploadZone onUploaded={handleUploaded} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {leads.length > 0 && (
              <>
                <Dashboard leads={leads} />
                <Toolbar
                  leads={leads}
                  filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                  filterMin={filterMin} setFilterMin={setFilterMin}
                  filterMax={filterMax} setFilterMax={setFilterMax}
                  sortBy={sortBy} setSortBy={setSortBy}
                  sortDir={sortDir} setSortDir={setSortDir}
                  onScoreAll={fetchLeads}
                  onClear={() => setLeads([])}
                />
                <LeadTable
                  leads={leads}
                  onLeadUpdated={handleLeadUpdated}
                  filterStatus={filterStatus}
                  filterMin={filterMin}
                  filterMax={filterMax}
                  sortBy={sortBy}
                  sortDir={sortDir}
                />
                <p className="text-center text-xs text-gray-400 mt-4">
                  {leads.length} total leads — click any row for full details
                </p>
              </>
            )}

            {!leads.length && (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No leads yet</p>
                <p className="text-sm">Upload a Propstream CSV to get started</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
