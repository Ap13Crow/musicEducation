import type { ReactNode } from 'react';
import { getPillar, type PillarKey } from '@/lib/pillars';

/** Page header for a pillar's main page: pillar chip, title, intro text. */
export function PillarHeader({ pillar, title, children }: { pillar: PillarKey; title: string; children?: ReactNode }) {
  const p = getPillar(pillar);
  return (
    <>
      <p className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.iconClass}`}>
        <p.icon className="h-3.5 w-3.5" />
        {p.label}
      </p>
      <h1 className="mb-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      {children && <p className="max-w-3xl text-muted">{children}</p>}
    </>
  );
}
