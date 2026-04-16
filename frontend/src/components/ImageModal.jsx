import React from 'react';

export default function ImageModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{lead.fullAddress}</h2>
            {lead.ownerName && <p className="text-sm text-gray-500">{lead.ownerName}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Street View</p>
            {lead.streetViewUrl ? (
              <img
                src={lead.streetViewUrl}
                alt="Street View"
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Satellite</p>
            {lead.satelliteUrl ? (
              <img
                src={lead.satelliteUrl}
                alt="Satellite"
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
        </div>

        {lead.distressScore !== null && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-gray-800">Score: {lead.distressScore}/10</span>
            </div>
            {lead.flags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {lead.flags.map((f, i) => (
                  <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            )}
            {lead.reasoning && (
              <p className="text-sm text-gray-600 italic">{lead.reasoning}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
