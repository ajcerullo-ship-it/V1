import React from 'react';

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard({ leads }) {
  const total = leads.length;
  const scored = leads.filter((l) => l.status === 'scored').length;
  const pending = leads.filter((l) => l.status === 'pending').length;
  const scoring = leads.filter((l) => l.status === 'scoring').length;
  const errors = leads.filter((l) => l.status === 'error').length;

  const scoredLeads = leads.filter((l) => l.distressScore !== null);
  const avgScore =
    scoredLeads.length > 0
      ? (scoredLeads.reduce((s, l) => s + l.distressScore, 0) / scoredLeads.length).toFixed(1)
      : '—';
  const highPriority = scoredLeads.filter((l) => l.distressScore >= 7).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <StatCard label="Total Leads" value={total} color="border-blue-500" />
      <StatCard label="Scored" value={scored} color="border-green-500" />
      <StatCard label="Pending" value={pending} color="border-yellow-400" />
      <StatCard label="In Progress" value={scoring} color="border-purple-500" />
      <StatCard label="Errors" value={errors} color="border-red-400" />
      <StatCard label="Avg Score" value={avgScore} color="border-indigo-500" />
      <StatCard label="High Priority (7+)" value={highPriority} color="border-orange-500" />
    </div>
  );
}
