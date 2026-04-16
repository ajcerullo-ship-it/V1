import React from 'react';
import { scoreAll, clearLeads, exportUrl } from '../api';

export default function Toolbar({
  leads,
  filterStatus, setFilterStatus,
  filterMin, setFilterMin,
  filterMax, setFilterMax,
  sortBy, setSortBy,
  sortDir, setSortDir,
  onScoreAll,
  onClear,
}) {
  const pendingCount = leads.filter((l) => l.status === 'pending' || l.status === 'error').length;
  const scoredCount = leads.filter((l) => l.distressScore !== null).length;

  async function handleScoreAll() {
    try {
      await scoreAll();
      onScoreAll();
    } catch (err) {
      console.error('Score all error:', err);
    }
  }

  async function handleClear() {
    if (!window.confirm('Clear all leads? This cannot be undone.')) return;
    await clearLeads();
    onClear();
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
      {/* Status filter */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="scoring">Scoring</option>
          <option value="scored">Scored</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Score range */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Min Score</label>
        <input
          type="number"
          min="1" max="10"
          value={filterMin}
          onChange={(e) => setFilterMin(e.target.value)}
          placeholder="1"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Max Score</label>
        <input
          type="number"
          min="1" max="10"
          value={filterMax}
          onChange={(e) => setFilterMax(e.target.value)}
          placeholder="10"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Sort By</label>
        <div className="flex gap-1">
          {[['distressScore', 'Score'], ['address', 'Address'], ['ownerName', 'Owner']].map(([field, label]) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                sortBy === field
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {label} {sortBy === field ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-2">
        {pendingCount > 0 && (
          <button
            onClick={handleScoreAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Score All ({pendingCount})
          </button>
        )}
        {scoredCount > 0 && (
          <a
            href={exportUrl()}
            download="scored_leads.csv"
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium inline-flex items-center gap-1"
          >
            Export CSV ({scoredCount})
          </a>
        )}
        {leads.length > 0 && (
          <button
            onClick={handleClear}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
