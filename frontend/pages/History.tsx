import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations`)
      .then(res => res.json())
      .then(data => setConsultations(data))
      .catch(err => console.error("Failed to load conversations:", err));
  }, []);

  const filteredConsultations = consultations.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const idMatch = c.id?.toLowerCase().includes(searchLower) || c._id?.toLowerCase().includes(searchLower);
    // Add additional checks if patient name became available
    return idMatch;
  });

  return (
    <div className="flex w-full flex-col items-center py-8 px-4 sm:px-8">
      <div className="flex w-full max-w-5xl flex-col gap-6">

        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-800">History</h1>
          <p className="text-slate-500 text-base font-normal">Manage your past consultation transcripts.</p>
        </div>

        {/* Search Filter */}
        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="block w-full rounded-lg border-sage-200 bg-white pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
            placeholder="Search by ID..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-sage-50/50 border-b border-sage-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sage-600 uppercase tracking-wider text-xs" scope="col">Date/Time</th>
                  <th className="px-6 py-4 font-semibold text-sage-600 uppercase tracking-wider text-xs" scope="col">Consultation ID</th>
                  <th className="px-6 py-4 font-semibold text-sage-600 uppercase tracking-wider text-xs" scope="col">Snippet</th>
                  <th className="px-6 py-4 font-semibold text-sage-600 text-right uppercase tracking-wider text-xs" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No conversations found.
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((c) => (
                    <tr key={c.id || c._id} className="group hover:bg-sage-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* Fallback formatting if raw date string */}
                          <span className="font-medium text-slate-800">{new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
                          <span className="text-xs text-slate-500">{new Date(c.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-600">
                          {(c.id || c._id).slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="truncate text-slate-500 max-w-xs group-hover:text-slate-700 transition-colors">{c.snippet || "No messages"}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/summary?id=${c.id || c._id}`)}
                          className="inline-flex items-center justify-center rounded-lg bg-white border border-sage-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-primary hover:text-white hover:border-primary focus:outline-none transition-all"
                        >
                          View Summary
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default History;