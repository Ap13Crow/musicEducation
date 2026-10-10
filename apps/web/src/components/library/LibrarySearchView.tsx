'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { Library, Search, SlidersHorizontal, X } from 'lucide-react';
import { CARD_FIELDS, CATEGORY_LABELS, ItemGrid, LoadingGrid } from './LibraryCards';

// The public Library search (API: lib/librarySearch.ts). Everything lives in
// the URL - a search can be bookmarked or sent to someone - and the facet
// counts always reflect every other active filter.

const PAGE_SIZE = 24;

const SEARCH_LIBRARY = gql`
  query SearchLibrary($input: LibrarySearchInput!) {
    searchLibrary(input: $input) {
      nodes { ${CARD_FIELDS} }
      totalCount
      page
      hasNextPage
      fuzzy
      suggestion
      facets {
        sources { value count }
        categories { value count }
        formats { value count }
        centuries { value count }
        licenses { value count }
        availability { value count }
      }
    }
  }
`;

const SOURCE_NAMES: Record<string, string> = {
  BNF: 'Gallica (BnF)',
  DNB: 'Deutsche Nationalbibliothek',
  OPENSCORE: 'OpenScore',
  MUTOPIA: 'Mutopia',
  MUSOPEN: 'Musopen',
};
const FORMAT_NAMES: Record<string, string> = { MUSICXML: 'Interactive score', PDF: 'PDF', AUDIO: 'Audio', SCANS: 'Page scans' };
const LICENSE_NAMES: Record<string, string> = {
  PUBLIC_DOMAIN: 'Public domain / CC0',
  CC_BY: 'CC BY',
  CC_BY_SA: 'CC BY-SA',
  FREE_ACCESS: 'Free access (DNB)',
  BNF_TERMS: 'BnF reuse terms',
  OTHER: 'Other',
};
const centuryName = (value: string) => (value === 'unknown' ? 'Undated' : `${value}00s`);

type FacetKey = 'src' | 'cat' | 'fmt' | 'cent' | 'lic';
const FACETS: { key: FacetKey; title: string; field: string; name: (value: string) => string; sort?: (a: string, b: string) => number }[] = [
  { key: 'cat', title: 'Type', field: 'categories', name: (value) => CATEGORY_LABELS[value] ?? value },
  { key: 'fmt', title: 'Format', field: 'formats', name: (value) => FORMAT_NAMES[value] ?? value },
  { key: 'src', title: 'Source', field: 'sources', name: (value) => SOURCE_NAMES[value] ?? value },
  {
    key: 'cent',
    title: 'Period',
    field: 'centuries',
    name: centuryName,
    sort: (a, b) => (a === 'unknown' ? 1 : b === 'unknown' ? -1 : Number(a) - Number(b)),
  },
  { key: 'lic', title: 'Licence', field: 'licenses', name: (value) => LICENSE_NAMES[value] ?? value },
];

const MATCHES = [
  { value: 'ALL', label: 'All words' },
  { value: 'ANY', label: 'Any word' },
  { value: 'PHRASE', label: 'Exact phrase' },
];
const FIELDS = [
  { value: 'ANY', label: 'Everything' },
  { value: 'TITLE', label: 'Title' },
  { value: 'CREATOR', label: 'Composer / author' },
];
const SORTS = [
  { value: 'RELEVANCE', label: 'Best match' },
  { value: 'NEWEST', label: 'Recently added' },
  { value: 'TITLE', label: 'Title A–Z' },
  { value: 'YEAR_ASC', label: 'Oldest first' },
  { value: 'YEAR_DESC', label: 'Newest first' },
];

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : []);
const year = (value: string | null) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1000 && number <= 2100 ? number : null;
};

export function LibrarySearchView({ liveApiEnabled }: { liveApiEnabled: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = params.get('q') ?? '';
  const match = params.get('match') ?? 'ALL';
  const field = params.get('in') ?? 'ANY';
  const caseSensitive = params.get('case') === '1';
  const sort = params.get('sort') ?? 'RELEVANCE';
  const showAll = params.get('all') === '1';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const selected: Record<FacetKey, string[]> = {
    src: list(params.get('src')),
    cat: list(params.get('cat')),
    fmt: list(params.get('fmt')),
    cent: list(params.get('cent')),
    lic: list(params.get('lic')),
  };
  const yearFrom = year(params.get('from'));
  const yearTo = year(params.get('to'));

  const [input, setInput] = useState(query);
  const [from, setFrom] = useState(yearFrom ? String(yearFrom) : '');
  const [to, setTo] = useState(yearTo ? String(yearTo) : '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    setFrom(yearFrom ? String(yearFrom) : '');
    setTo(yearTo ? String(yearTo) : '');
  }, [yearFrom, yearTo]);

  // Every change goes through the URL; any change but paging restarts at page 1.
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in changes)) next.delete('page');
    const text = next.toString();
    router.push(text ? `${pathname}?${text}` : pathname, { scroll: 'page' in changes });
  }

  const variables = useMemo(
    () => ({
      input: {
        query: query || null,
        match,
        field,
        caseSensitive,
        sources: selected.src,
        categories: selected.cat,
        formats: selected.fmt,
        centuries: selected.cent,
        licenses: selected.lic,
        yearFrom,
        yearTo,
        availableOnly: !showAll,
        sort,
        page,
        limit: PAGE_SIZE,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.toString()],
  );
  const { data, previousData, loading, error } = useQuery(SEARCH_LIBRARY, { variables, skip: !liveApiEnabled });
  const result = (data ?? previousData)?.searchLibrary;
  const facets = result?.facets;
  const atSourceOnly = facets?.availability?.find((entry: any) => entry.value === 'AT_SOURCE')?.count ?? 0;

  const activeChips = [
    ...FACETS.flatMap((facet) => selected[facet.key].map((value) => ({ key: facet.key, value, label: facet.name(value) }))),
  ];
  const hasFilters = activeChips.length > 0 || yearFrom || yearTo || query;
  const filterCount = activeChips.length + (yearFrom || yearTo ? 1 : 0);

  function toggleFacet(key: FacetKey, value: string) {
    const current = selected[key];
    const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
    update({ [key]: next.join(',') || null });
  }

  function clearAll() {
    setInput('');
    router.push(pathname);
  }

  if (!liveApiEnabled) return null;

  return (
    <>
      <form
        className="mb-3"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: input.trim() || null });
        }}
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder='Title, composer, instrument… e.g. Schubert "Gute Nacht" -Liszt'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Search the Library"
              className="input w-full pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700">
          <label className="inline-flex items-center gap-1.5">
            Match
            <select value={match} onChange={(event) => update({ match: event.target.value === 'ALL' ? null : event.target.value })} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
              {MATCHES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5">
            in
            <select value={field} onChange={(event) => update({ in: event.target.value === 'ANY' ? null : event.target.value })} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
              {FIELDS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={caseSensitive} onChange={(event) => update({ case: event.target.checked ? '1' : null })} className="h-4 w-4 rounded border-gray-300" />
            Match case
          </label>
          <label className="inline-flex items-center gap-1.5 sm:ml-auto">
            Sort
            <select value={sort} onChange={(event) => update({ sort: event.target.value === 'RELEVANCE' ? null : event.target.value })} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
              {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </form>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        className="mb-3 inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:border-primary-300"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filters{filterCount ? ` (${filterCount})` : ''}
      </button>

      {filtersOpen && facets && (
        <div className="mb-4 grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="library-facets">
          {FACETS.map((facet) => {
            const values: { value: string; count: number }[] = [...(facets[facet.field] ?? [])];
            if (facet.sort) values.sort((a, b) => facet.sort!(a.value, b.value));
            // Keep a selected value visible even when nothing else matches it.
            for (const value of selected[facet.key]) if (!values.some((entry) => entry.value === value)) values.push({ value, count: 0 });
            if (!values.length) return null;
            return (
              <fieldset key={facet.key}>
                <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{facet.title}</legend>
                <ul className="space-y-1">
                  {values.map((entry) => (
                    <li key={entry.value}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selected[facet.key].includes(entry.value)}
                          onChange={() => toggleFacet(facet.key, entry.value)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="flex-1">{facet.name(entry.value)}</span>
                        <span className="tabular-nums text-xs text-gray-400">{entry.count.toLocaleString()}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
          <fieldset>
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Years</legend>
            <form
              className="flex items-center gap-2 text-sm"
              onSubmit={(event) => {
                event.preventDefault();
                update({ from: year(from) ? from : null, to: year(to) ? to : null });
              }}
            >
              <input inputMode="numeric" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="from" aria-label="From year" className="w-20 rounded-md border border-gray-300 px-2 py-1" />
              –
              <input inputMode="numeric" value={to} onChange={(event) => setTo(event.target.value)} placeholder="to" aria-label="To year" className="w-20 rounded-md border border-gray-300 px-2 py-1" />
              <button type="submit" className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50">Apply</button>
            </form>
            <p className="mt-1 text-xs text-gray-400">Undated items are left out of a year range.</p>
          </fieldset>
        </div>
      )}

      {(activeChips.length > 0 || yearFrom || yearTo) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={`${chip.key}:${chip.value}`}
              type="button"
              onClick={() => toggleFacet(chip.key, chip.value)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
            >
              {chip.label} <X className="h-3 w-3" />
            </button>
          ))}
          {(yearFrom || yearTo) && (
            <button
              type="button"
              onClick={() => update({ from: null, to: null })}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
            >
              {yearFrom ?? '…'}–{yearTo ?? '…'} <X className="h-3 w-3" />
            </button>
          )}
          <button type="button" onClick={clearAll} className="text-xs text-gray-600 hover:text-gray-900">Clear all</button>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The library catalogue is currently unavailable. Please try again shortly.
        </p>
      )}

      {result && (
        <div className="mb-4 space-y-1 text-sm">
          <p className="text-gray-500" aria-live="polite">
            {result.totalCount.toLocaleString()} {result.totalCount === 1 ? 'result' : 'results'}
            {query ? <> for &ldquo;{query}&rdquo;</> : null}
            {loading ? ' · updating…' : ''}
          </p>
          {result.fuzzy && (
            <p className="text-amber-800">No exact matches - showing items with similar words.</p>
          )}
          {result.suggestion && (
            <p className="text-gray-700">
              Did you mean{' '}
              <button type="button" onClick={() => update({ q: result.suggestion })} className="font-medium text-primary-700 underline hover:text-primary-900">
                {result.suggestion}
              </button>
              ?
            </p>
          )}
          {!showAll && atSourceOnly > 0 && (
            <p className="text-gray-500">
              {atSourceOnly.toLocaleString()} more {atSourceOnly === 1 ? 'item' : 'items'} can only be opened at Gallica or the DNB until we hold a copy.{' '}
              <button type="button" onClick={() => update({ all: '1' })} className="text-primary-700 underline hover:text-primary-900">
                Show them too
              </button>
            </p>
          )}
          {showAll && (
            <p className="text-gray-500">
              Including items that open at the source.{' '}
              <button type="button" onClick={() => update({ all: null })} className="text-primary-700 underline hover:text-primary-900">
                Only show what opens here
              </button>
            </p>
          )}
        </div>
      )}

      {!result && loading ? (
        <LoadingGrid />
      ) : result && result.nodes.length > 0 ? (
        <ItemGrid
          items={result.nodes}
          hideCount
          pageInfo={{ hasPreviousPage: page > 1, hasNextPage: result.hasNextPage, totalCount: result.totalCount }}
          page={page}
          setPage={(next) => update({ page: next > 1 ? String(next) : null })}
        />
      ) : result ? (
        <div className="py-16 text-center">
          <Library className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">{hasFilters ? 'Nothing matches this search.' : 'The library is being filled - check back soon.'}</p>
          {caseSensitive && <p className="mt-1 text-sm text-gray-500">&ldquo;Match case&rdquo; is on - try turning it off.</p>}
          {hasFilters && (
            <button type="button" onClick={clearAll} className="mt-2 text-sm text-primary-600 hover:text-primary-800">
              Clear search and filters
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}
