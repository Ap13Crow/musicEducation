'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, Search } from 'lucide-react';

// Admin import: one query against Gallica (BnF) and the Deutsche
// Nationalbibliothek side by side, every result page by page, tick what to
// bring in. Rows already in the Library can't be ticked; lookalikes of works
// we already hold are flagged. Server side: apps/api/src/lib/libraryImportSearch.ts.

const SEARCH = gql`
  query AdminSearchLibraryImportSources($input: LibraryImportSearchInput!) {
    searchLibraryImportSources(input: $input) {
      query
      page
      pageSize
      totalPages
      sources {
        source
        total
        error
        candidates {
          source
          externalId
          title
          creator
          date
          category
          documentType
          format
          summary
          permalink
          publicDomain
          inLibrary { id shortId title source }
          possibleDuplicates { id shortId title source }
        }
      }
    }
  }
`;

const IMPORT = gql`
  mutation AdminImportLibrarySelection($selections: [LibraryImportSelectionInput!]!, $query: String) {
    importLibrarySelection(selections: $selections, query: $query) {
      imported { id title source }
      alreadyInLibrary { id title source }
      failed { source externalId reason }
    }
  }
`;

type SourceKey = 'BNF' | 'DNB' | 'INTERNET_ARCHIVE' | 'EUROPEANA';
const SOURCES: { key: SourceKey; label: string; hint: string }[] = [
  { key: 'BNF', label: 'Gallica (BnF)', hint: 'Scans and recordings; French terms match best' },
  { key: 'DNB', label: 'Deutsche Nationalbibliothek', hint: 'Free online music titles: scores, books, theses (PDF)' },
  { key: 'INTERNET_ARCHIVE', label: 'Internet Archive 78s', hint: 'Historic classical 78 rpm recordings; sides of one work are grouped' },
  { key: 'EUROPEANA', label: 'Europeana', hint: 'Openly licensed recordings from European archives and broadcasters' },
];
const SOURCE_NAME: Record<string, string> = { BNF: 'Gallica', DNB: 'DNB', INTERNET_ARCHIVE: 'Internet Archive', EUROPEANA: 'Europeana' };

const CATEGORIES = [
  { value: '', label: 'Any type' },
  { value: 'SHEET_MUSIC', label: 'Sheet music' },
  { value: 'AUDIO_RECORDING', label: 'Audio recordings' },
  { value: 'BOOK', label: 'Books & texts' },
];
const CATEGORY_LABEL: Record<string, string> = { SHEET_MUSIC: 'Sheet music', AUDIO_RECORDING: 'Audio', BOOK: 'Text', OTHER: 'Other' };

const MODES = [
  { value: 'ALL', label: 'All words' },
  { value: 'ANY', label: 'Any word' },
  { value: 'PHRASE', label: 'Exact phrase' },
];

type Candidate = {
  source: SourceKey;
  externalId: string;
  title: string;
  creator: string | null;
  date: string | null;
  category: string;
  documentType: string | null;
  format: string;
  summary: string | null;
  permalink: string;
  publicDomain: boolean;
  inLibrary: { id: string; title: string } | null;
  possibleDuplicates: { id: string; title: string; source: string }[];
};

const keyOf = (candidate: { source: string; externalId: string }) => `${candidate.source}:${candidate.externalId}`;

function yearValue(text: string): number | null {
  const year = Number(text);
  return Number.isInteger(year) && year >= 1000 && year <= 2100 ? year : null;
}

export function LibraryImportSearch() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('ALL');
  const [sources, setSources] = useState<SourceKey[]>(['BNF', 'DNB', 'INTERNET_ARCHIVE', 'EUROPEANA']);
  const [category, setCategory] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [pageSize, setPageSize] = useState(25);
  // The search the result list belongs to (filters edited afterwards don't
  // silently change what "next page" means).
  const [active, setActive] = useState<any | null>(null);
  const [selected, setSelected] = useState<Map<string, Candidate>>(new Map());
  const [lastImport, setLastImport] = useState<any | null>(null);

  const [runSearch, { data, loading, error }] = useLazyQuery(SEARCH, { fetchPolicy: 'network-only' });
  const [runImport, { loading: importing, error: importError }] = useMutation(IMPORT);
  const result = data?.searchLibraryImportSources ?? null;

  const rows: Candidate[] = useMemo(() => (result?.sources ?? []).flatMap((source: any) => source.candidates), [result]);
  const selectable = rows.filter((row) => !row.inLibrary);
  const allOnPageSelected = selectable.length > 0 && selectable.every((row) => selected.has(keyOf(row)));

  function search(page: number, base = active) {
    if (!base) return;
    const input = { ...base, page };
    setActive(base);
    void runSearch({ variables: { input } });
  }

  function submit() {
    const text = query.trim();
    if (!text || !sources.length) return;
    setLastImport(null);
    search(1, {
      query: text,
      mode,
      sources,
      category: category || null,
      yearFrom: yearValue(yearFrom),
      yearTo: yearValue(yearTo),
      pageSize,
    });
  }

  function toggle(row: Candidate) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(keyOf(row))) next.delete(keyOf(row));
      else next.set(keyOf(row), row);
      return next;
    });
  }

  function togglePage() {
    setSelected((current) => {
      const next = new Map(current);
      for (const row of selectable) {
        if (allOnPageSelected) next.delete(keyOf(row));
        else next.set(keyOf(row), row);
      }
      return next;
    });
  }

  async function importSelected() {
    const selections = [...selected.values()].map((row) => ({ source: row.source, externalId: row.externalId }));
    if (!selections.length) return;
    const response = await runImport({ variables: { selections, query: active?.query ?? null } }).catch(() => null);
    const outcome = response?.data?.importLibrarySelection;
    if (!outcome) return;
    setLastImport(outcome);
    // Keep only what failed ticked, so it can be retried.
    setSelected((current) => new Map([...current].filter(([key]) => outcome.failed.some((failure: any) => keyOf(failure) === key))));
    if (active) search(result?.page ?? 1);
  }

  const page = result?.page ?? 1;
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="card space-y-4 p-5" data-testid="library-import-search">
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-4 w-4 text-blue-600" /> Import from Gallica, the DNB, the Internet Archive and Europeana
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Search all four at once, page through every result and tick what belongs in the Library. Items already imported can&rsquo;t be picked twice; files are copied to our own storage in the background.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Composer, work, instrument… (e.g. Schubert Lied, sonate violon)"
            aria-label="Search query"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Match" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {MODES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!query.trim() || !sources.length || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search className="h-4 w-4" /> {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-x-5 gap-y-3 text-sm">
          <fieldset className="flex flex-wrap gap-3">
            <legend className="sr-only">Sources</legend>
            {SOURCES.map((source) => (
              <label key={source.key} className="inline-flex items-center gap-2" title={source.hint}>
                <input
                  type="checkbox"
                  checked={sources.includes(source.key)}
                  onChange={(event) =>
                    setSources((current) => (event.target.checked ? [...current, source.key] : current.filter((key) => key !== source.key)))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                {source.label}
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Type
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900">
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            From year
            <input inputMode="numeric" value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} placeholder="1700" className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            To year
            <input inputMode="numeric" value={yearTo} onChange={(event) => setYearTo(event.target.value)} placeholder="1950" className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Per page
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900">
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>{size} per source</option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</div>}
      {importError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Import failed: {importError.message}</div>}

      {lastImport && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" data-testid="library-import-result">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Imported {lastImport.imported.length}
            {lastImport.alreadyInLibrary.length ? ` · ${lastImport.alreadyInLibrary.length} already in the Library` : ''}
            {lastImport.failed.length ? ` · ${lastImport.failed.length} failed` : ''}
          </p>
          {lastImport.imported.length > 0 && <p className="mt-1 text-xs">Files and card images are being copied now - follow &ldquo;Local copies&rdquo; below.</p>}
          {lastImport.failed.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-red-700">
              {lastImport.failed.slice(0, 10).map((failure: any) => (
                <li key={keyOf(failure)}>{SOURCE_NAME[failure.source] ?? failure.source} {failure.externalId}: {failure.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            {result.sources.map((source: any) => (
              <span
                key={source.source}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${source.error ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-700'}`}
                title={source.error ?? undefined}
              >
                {source.error && <AlertTriangle className="h-3.5 w-3.5" />}
                {SOURCE_NAME[source.source]}: {source.error ? 'unavailable' : `${source.total.toLocaleString()} results`}
              </span>
            ))}
          </div>
          {result.sources
            .filter((source: any) => source.error)
            .map((source: any) => (
              <p key={source.source} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                <strong>{SOURCE_NAME[source.source]}:</strong> {source.error}
              </p>
            ))}

          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 backdrop-blur">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allOnPageSelected} disabled={!selectable.length} onChange={togglePage} className="h-4 w-4 rounded border-gray-300" />
              Select all on this page
            </label>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button type="button" onClick={() => setSelected(new Map())} className="text-sm text-gray-600 hover:text-gray-900">
                  Clear
                </button>
              )}
              <button
                type="button"
                disabled={!selected.size || importing}
                onClick={() => void importSelected()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {importing ? 'Importing…' : selected.size ? `Import ${selected.size} selected` : 'Import selected'}
              </button>
            </div>
          </div>

          {result.sources.map((source: any) =>
            source.candidates.length === 0 ? null : (
              <section key={source.source} aria-label={`${SOURCE_NAME[source.source]} results`}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {SOURCE_NAME[source.source]} · results {(page - 1) * result.pageSize + 1}–{(page - 1) * result.pageSize + source.candidates.length} of {source.total.toLocaleString()}
                </h4>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm" data-testid={`import-results-${source.source}`}>
                  {source.candidates.map((row: Candidate) => {
                    const checked = selected.has(keyOf(row));
                    return (
                      <li key={keyOf(row)} className={`flex gap-3 px-3 py-2.5 ${row.inLibrary ? 'bg-gray-50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={Boolean(row.inLibrary)}
                          onChange={() => toggle(row)}
                          aria-label={`Select ${row.title}`}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 disabled:opacity-40"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium ${row.inLibrary ? 'text-gray-500' : 'text-gray-900'}`}>{row.title}</p>
                          <p className="text-xs text-gray-500">{[row.creator, row.date, row.documentType].filter(Boolean).join(' · ')}</p>
                          {row.summary && <p className="mt-1 line-clamp-2 text-xs text-gray-600">{row.summary}</p>}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{CATEGORY_LABEL[row.category] ?? row.category}</span>
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{row.format}</span>
                            {row.publicDomain && <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-800">Public domain</span>}
                            {row.inLibrary && (
                              <Link href={`/library/${row.inLibrary.id}`} className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-800 hover:underline">
                                In library
                              </Link>
                            )}
                            {!row.inLibrary && row.possibleDuplicates.length > 0 && (
                              <span
                                className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-800"
                                title={row.possibleDuplicates.map((dup) => `${SOURCE_NAME[dup.source] ?? dup.source}${dup.id ? ' (in library)' : ' (this search)'}: ${dup.title}`).join('\n')}
                              >
                                Possible duplicate
                                {row.possibleDuplicates[0].id && (
                                  <>
                                    {' · '}
                                    <Link href={`/library/${row.possibleDuplicates[0].id}`} className="underline">
                                      see {SOURCE_NAME[row.possibleDuplicates[0].source] ?? row.possibleDuplicates[0].source.toLowerCase()} copy
                                    </Link>
                                  </>
                                )}
                              </span>
                            )}
                            <a href={row.permalink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary-600 hover:underline">
                              {SOURCE_NAME[row.source]} <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )}

          {rows.length === 0 && !result.sources.every((source: any) => source.error) && (
            <p className="text-sm text-gray-500">No results on this page. Try fewer words, &ldquo;Any word&rdquo;, or a wider year range.</p>
          )}

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 text-sm" aria-label="Result pages">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => search(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="tabular-nums text-gray-600">
                Page {page} of {totalPages.toLocaleString()}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => search(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
