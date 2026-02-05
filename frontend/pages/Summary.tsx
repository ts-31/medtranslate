import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setError("No conversation ID provided.");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${conversationId}/summary`, {
          method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to generate summary");
        const data = await res.json();
        setSummary(data.summary);
      } catch (err) {
        console.error(err);
        setError("Failed to generate summary. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [conversationId]);

  return (
    <div className="relative min-h-screen flex flex-col antialiased transition-colors duration-200 bg-background-light">
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-3xl bg-sage-50 rounded-xl shadow-2xl border border-sage-200 overflow-hidden flex flex-col animate-fade-in-up">
          {/* Header */}
          <header className="px-6 py-5 border-b border-sage-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sage-50">
            <div>
              <h1 className="text-[#111418] text-2xl font-bold tracking-tight">Consultation Summary</h1>
              <div className="flex items-center gap-2 mt-1">
                {conversationId && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    ID: {conversationId.slice(-6).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary" title="AI Generated">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh] min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sage-600 font-medium animate-pulse">Generating medical summary...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-center">
                <div className="text-red-500 material-symbols-outlined text-4xl">error</div>
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="prose prose-sage max-w-none">
                <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-normal text-base md:text-lg p-4 bg-white rounded-xl border border-sage-100 shadow-sm">
                  {summary}
                </div>
              </div>
            )}
          </div>

          <footer className="bg-[#E4EBE7] px-6 py-4 border-t border-sage-200 flex justify-end items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-5 py-2.5 text-sm font-bold text-primary shadow-sm hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              Print
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-[20px]">check</span>
              Done
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Summary;