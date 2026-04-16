import React, { useState } from 'react';
import ScoreBadge from './ScoreBadge';
import ImageModal from './ImageModal';
import { scoreLead } from '../api';

const STATUS_LABELS = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  scoring: { label: 'Scoring...', cls: 'bg-purple-100 text-purple-700 animate-pulse' },
  scored: { label: 'Scored', cls: 'bg-green-100 text-green-700' },
  error: { label: 'Error', cls: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

export default function LeadTable({ leads, onLeadUpdated, filterMin, filterMax, filterStatus, sortBy, sortDir }) {
  const [modalLead, setModalLead] = useState(null);
  const [scoringIds, setScoringIds] = useState(new Set());

  async function handleScore(lead, e) {
    e.stopPropagation();
    setScoringIds((prev) => new Set(prev).add(lead.id));
    try {
      const updated = await scoreLead(lead.id);
      onLeadUpdated(updated);
    } catch (err) {
      console.error('Score error:', err);
    } finally {
      setScoringIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  }

  // Filter
  let filtered = leads.filter((l) => {
    if (filterStatus && filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (l.distressScore !== null) {
      if (filterMin && l.distressScore < Number(filterMin)) return false;
      if (filterMax && l.distressScore > Number(filterMax)) return false;
    }
    return true;
  });

  // Sort
  if (sortBy) {
    filtered = [...filtered].sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (av === null || av === undefined) av = sortDir === 'asc' ? Infinity : -Infinity;
      if (bv === null || bv === undefined) bv = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (!filtered.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No leads match your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Address</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Flags</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Images</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((lead) => {
              const isScoring = scoringIds.has(lead.id) || lead.status === 'scoring';
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setModalLead(lead)}
                >
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.distressScore} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{lead.address || '—'}</p>
                    <p className="text-xs text-gray-400">{[lead.city, lead.state, lead.zip].filter(Boolean).join(', ')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lead.ownerName || '—'}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {(lead.flags || []).slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                      {(lead.flags || []).length > 3 && (
                        <span className="text-xs text-gray-400">+{lead.flags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                    {lead.status === 'error' && lead.errorMessage && (
                      <p className="text-xs text-red-400 mt-1 max-w-xs truncate" title={lead.errorMessage}>
                        {lead.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {lead.streetViewUrl ? (
                        <img
                          src={lead.streetViewUrl}
                          alt="Street"
                          className="w-16 h-10 object-cover rounded border"
                          onClick={(e) => { e.stopPropagation(); setModalLead(lead); }}
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-300">SV</span>
                        </div>
                      )}
                      {lead.satelliteUrl ? (
                        <img
                          src={lead.satelliteUrl}
                          alt="Sat"
                          className="w-16 h-10 object-cover rounded border"
                          onClick={(e) => { e.stopPropagation(); setModalLead(lead); }}
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-300">SAT</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {(lead.status === 'pending' || lead.status === 'error') && (
                      <button
                        disabled={isScoring}
                        onClick={(e) => handleScore(lead, e)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isScoring ? 'Scoring...' : 'Score'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ImageModal lead={modalLead} onClose={() => setModalLead(null)} />
    </>
  );
}
