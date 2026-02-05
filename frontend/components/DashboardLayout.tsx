import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-slate-800 border-b-2 border-primary' : 'text-slate-500 hover:text-sage-600 transition-colors';
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-sage-200 dark:border-sage-700 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 px-6 py-3 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800 dark:text-sage-300">
            <span className="material-symbols-outlined text-2xl">translate</span>
          </div>
          <Link to="/" className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-800 dark:text-white">
            MedTranslate
          </Link>
        </div>
        <div className="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <Link to="/dashboard" className={`text-sm font-medium leading-normal ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/consultation"
              className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm shadow-sage-500/20"
            >
              <span className="truncate flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>
                <span>New Consultation</span>
              </span>
            </Link>
            <button className="sm:hidden flex items-center justify-center rounded-lg size-10 bg-primary text-white">
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;