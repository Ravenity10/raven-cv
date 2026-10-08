import { useEffect, useState } from 'react';
import { onToast } from '../hooks/copyEmail.js';

const DURATION = 2200;

// One small status toast at the bottom of the screen (e.g. "Email copied").
// The live region stays mounted so screen readers announce each new message.
export default function Toast() {
  const [toast, setToast] = useState({ message: '', visible: false });

  useEffect(() => onToast((message) => setToast({ message, visible: true, at: Date.now() })), []);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => setToast((current) => ({ ...current, visible: false })), DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <p
        aria-hidden={toast.visible ? undefined : 'true'}
        className={`toast inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-[0.8rem] text-fg shadow-lg shadow-black/20 ${toast.visible ? 'is-visible' : ''}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-(--teal)">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {toast.message}
      </p>
    </div>
  );
}
