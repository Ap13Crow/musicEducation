'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PlusOffer } from './PlusOffer';

// Shown when someone goes to buy a single course while Plus is on sale: the
// membership first, buying just this course still one click away.
export function PlusUpsellDialog({
  open,
  onClose,
  onBuySingle,
  singlePrice,
  buying,
  returnTo,
}: {
  open: boolean;
  onClose: () => void;
  onBuySingle: () => void;
  singlePrice: string;
  buying: boolean;
  returnTo: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Get every course with mymusic.coach Plus"
        data-testid="plus-upsell"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Before you check out</h2>
            <p className="mt-1 text-sm text-gray-600">For a little more than this one course, you can learn with all of them.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <PlusOffer returnTo={returnTo} />
        <div className="mt-5 border-t border-gray-100 pt-4 text-center">
          <button type="button" onClick={onBuySingle} disabled={buying} className="text-sm font-medium text-gray-700 underline hover:text-gray-900 disabled:opacity-60">
            {buying ? 'Opening checkout…' : `No thanks - buy only this course for ${singlePrice}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
