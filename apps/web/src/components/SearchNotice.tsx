// What every search bar says about its results (the API's SearchInfo, see
// apps/api/src/lib/siteSearch.ts): that only similar words matched, and a
// "did you mean" the visitor can click. Same wording on every page.

export interface SearchInfo {
  fuzzy: boolean;
  suggestion?: string | null;
}

export const SEARCH_INFO_FIELDS = 'search { fuzzy suggestion }';

export function SearchNotice({ info, onSuggestion, className = '' }: { info?: SearchInfo | null; onSuggestion: (text: string) => void; className?: string }) {
  if (!info || (!info.fuzzy && !info.suggestion)) return null;
  const suggestion = info.suggestion;
  return (
    <div className={`space-y-1 text-sm ${className}`} aria-live="polite">
      {info.fuzzy && <p className="text-amber-800">No exact matches - showing items with similar words.</p>}
      {suggestion && (
        <p className="text-gray-700">
          Did you mean{' '}
          <button type="button" onClick={() => onSuggestion(suggestion)} className="font-medium text-primary-700 underline hover:text-primary-900">
            {suggestion}
          </button>
          ?
        </p>
      )}
    </div>
  );
}
