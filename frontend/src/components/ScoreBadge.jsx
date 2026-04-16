import React from 'react';

function scoreColor(score) {
  if (score === null) return 'bg-gray-100 text-gray-500';
  if (score >= 8) return 'bg-red-100 text-red-700';
  if (score >= 6) return 'bg-orange-100 text-orange-700';
  if (score >= 4) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

export default function ScoreBadge({ score }) {
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${scoreColor(score)}`}>
      {score !== null ? score : '—'}
    </span>
  );
}
