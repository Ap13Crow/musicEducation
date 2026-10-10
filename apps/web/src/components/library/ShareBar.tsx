'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { Check, Download, Link2, QrCode, X } from 'lucide-react';
import { hasRole } from '@/lib/roles';

// Permanent link for an item (or one of its files) - copy for everyone; QR
// code (SVG for print, PNG for slides/messengers) for admins only.
export function CopyLinkButton({ url, label = 'Copy link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={url}
      className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

// qrBase: /api/library/items/<id>/qr or /api/library/folders/<id>/qr.
export function qrUrl(qrBase: string, format: 'svg' | 'png', fileNumber?: number, download = false): string {
  const params = new URLSearchParams();
  if (fileNumber) params.set('file', String(fileNumber));
  if (download) params.set('download', '1');
  const query = params.toString();
  return `${qrBase}.${format}${query ? `?${query}` : ''}`;
}

// The QR code itself with its link and SVG/PNG downloads - shown in the
// QR pop-up and inline in the folder settings dialog.
export function QrCodePanel({ qrBase, fileNumber, shareUrl }: { qrBase: string; fileNumber?: number; shareUrl: string }) {
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl(qrBase, 'svg', fileNumber)} alt={`QR code linking to ${shareUrl}`} className="mx-auto aspect-square w-full max-w-[16rem]" />
      <p className="mt-2 break-all text-center text-xs text-gray-500">{shareUrl}</p>
      <div className="mt-4 flex gap-2">
        <a href={qrUrl(qrBase, 'svg', fileNumber, true)} className="btn-primary flex-1 text-center text-sm">
          <Download className="mr-1 inline h-4 w-4" /> SVG
        </a>
        <a href={qrUrl(qrBase, 'png', fileNumber, true)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm text-gray-700 hover:border-primary-300">
          <Download className="mr-1 inline h-4 w-4" /> PNG
        </a>
      </div>
    </div>
  );
}

export function QrCodeButton({ qrBase, fileNumber, shareUrl, title, compact = false }: {
  qrBase: string;
  fileNumber?: number;
  shareUrl: string;
  title: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700"
      >
        <QrCode className="h-4 w-4" />
        {compact ? <span className="sr-only">QR code</span> : 'QR code'}
      </button>
      {/* Rendered at the end of <body>: inside a sidebar, menu or card the
          pop-up would otherwise be trapped and clipped by its container. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
            <div role="dialog" aria-label={`QR code for ${title}`} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 font-semibold">{title}</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-gray-500 hover:text-gray-900">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <QrCodePanel qrBase={qrBase} fileNumber={fileNumber} shareUrl={shareUrl} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return hasRole(session?.roles, 'ADMIN');
}

export function ShareBar({ itemId, shareUrl, title }: { itemId: string; shareUrl: string; title: string }) {
  const isAdmin = useIsAdmin();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyLinkButton url={shareUrl} />
      {isAdmin && <QrCodeButton qrBase={`/api/library/items/${itemId}/qr`} shareUrl={shareUrl} title={title} />}
    </div>
  );
}
