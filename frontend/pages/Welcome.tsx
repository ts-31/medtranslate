import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background-light font-display text-[#111418]">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#E0E5E2] bg-surface-light px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <span className="material-symbols-outlined text-2xl">medical_services</span>
          </div>
          <h2 className="text-[#111418] text-xl font-bold leading-tight tracking-[-0.015em]">MedTranslate</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col gap-8 md:gap-12 animate-fade-in">

          <div className="flex flex-col items-center text-center gap-3">
            <h1 className="text-[#2C3E34] text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
              Welcome to MedTranslate
            </h1>
            <p className="text-[#5F7568] text-lg font-normal leading-normal max-w-lg">
              Select your role and language preferences to begin a secure, real-time consultation.
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
            <label
              onClick={() => setRole('doctor')}
              className={`group relative flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/40 ${role === 'doctor' ? 'border-primary bg-primary/5' : 'border-transparent bg-surface-light'}`}
            >
              <input
                className="peer sr-only"
                name="role"
                type="radio"
                value="doctor"
                checked={role === 'doctor'}
                onChange={() => setRole('doctor')}
              />
              <div className={`z-10 flex size-16 items-center justify-center rounded-full transition-colors ${role === 'doctor' ? 'bg-primary text-white' : 'bg-[#EEF3F0] text-primary'}`}>
                <span className="material-symbols-outlined text-4xl">stethoscope</span>
              </div>
              <div className="z-10 flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#111418]">I am a Doctor</h3>
                <p className="text-[#5F7568] text-sm">Initiate consultation and review history.</p>
              </div>
              {role === 'doctor' && (
                <div className="z-10 absolute top-6 right-6 text-primary animate-in fade-in zoom-in duration-200">
                  <span className="material-symbols-outlined fill">check_circle</span>
                </div>
              )}
            </label>

            <label
              onClick={() => setRole('patient')}
              className={`group relative flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/40 ${role === 'patient' ? 'border-primary bg-primary/5' : 'border-transparent bg-surface-light'}`}
            >
              <input
                className="peer sr-only"
                name="role"
                type="radio"
                value="patient"
                checked={role === 'patient'}
                onChange={() => setRole('patient')}
              />
              <div className={`z-10 flex size-16 items-center justify-center rounded-full transition-colors ${role === 'patient' ? 'bg-primary text-white' : 'bg-[#EEF3F0] text-primary'}`}>
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
              <div className="z-10 flex flex-col gap-1">
                <h3 className="text-xl font-bold text-[#111418]">I am a Patient</h3>
                <p className="text-[#5F7568] text-sm">Join consultation and view translations.</p>
              </div>
              {role === 'patient' && (
                <div className="z-10 absolute top-6 right-6 text-primary animate-in fade-in zoom-in duration-200">
                  <span className="material-symbols-outlined fill">check_circle</span>
                </div>
              )}
            </label>
          </div>

          {/* Language Selection */}
          <div className="w-full max-w-2xl mx-auto rounded-xl bg-surface-light p-6 shadow-sm ring-1 ring-[#E0E5E2]">
            <h3 className="text-[#2C3E34] text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">translate</span>
              Select Conversation Languages
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-[#5F7568] uppercase tracking-wider mb-1.5 block pl-1">I speak</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg border border-[#CFDBD5] bg-[#FDFEFE] py-3.5 pl-4 pr-10 text-[#2C3E34] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer transition-shadow">
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5F7568]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              <button aria-label="Swap languages" className="flex-none mt-6 p-2 rounded-full hover:bg-[#EEF3F0] text-primary transition-colors">
                <span className="material-symbols-outlined">sync_alt</span>
              </button>

              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-[#5F7568] uppercase tracking-wider mb-1.5 block pl-1">Translate to</label>
                <div className="relative">
                  <select defaultValue="es" className="w-full appearance-none rounded-lg border border-[#CFDBD5] bg-[#FDFEFE] py-3.5 pl-4 pr-10 text-[#2C3E34] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer transition-shadow">
                    <option value="es">Spanish</option>
                    <option value="en">English (US)</option>
                    <option value="fr">French</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5F7568]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate('/consultation', { state: { role } })}
                disabled={!role}
                className={`w-full max-w-sm rounded-lg px-8 py-4 text-white shadow-sage transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 ${!role ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-primary hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5'}`}
              >
                <span>Start Conversation</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-[#5F7568] flex flex-col md:flex-row justify-center gap-4 md:gap-8 border-t border-[#E0E5E2] mt-auto bg-surface-light">
        <span>© 2023 MedTranslate Inc.</span>
      </footer>
    </div>
  );
};

export default Welcome;