import React from 'react';

/** Placeholder exibido enquanto o código de uma página é baixado (code splitting). */
export const PageSkeleton: React.FC = () => (
  <div
    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
    role="status"
    aria-live="polite"
    aria-label="Carregando página"
  >
    <div className="space-y-3">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-9 w-3/4 sm:w-1/2" />
      <div className="skeleton h-4 w-2/3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="skeleton h-40" />
      <div className="skeleton h-40" />
    </div>
    <div className="skeleton h-14 w-full sm:w-72" />
    <span className="sr-only">Carregando…</span>
  </div>
);
