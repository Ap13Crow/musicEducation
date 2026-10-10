'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, FolderOpen, Search, Sparkles, Star, Users } from 'lucide-react';

// Admin view of how people use the Library - totals, the most opened items,
// one row per user, and per user: what they read and listen to, what they
// keep, their tastes as learned from that, and what they are recommended.
// API: resolvers/libraryInsights.ts.

const USAGE = gql`
  query AdminLibraryUsage($query: String, $sort: LibraryUsageSort, $page: Int, $limit: Int) {
    adminLibraryUsage(query: $query, sort: $sort, page: $page, limit: $limit) {
      summary { activeUsers7d activeUsers30d itemsOpened30d completions30d xpAwarded30d favorites folders }
      topItems { opens completions item { id title creator source } }
      users {
        totalCount
        page
        limit
        nodes { userId email role displayName itemsOpened itemsCompleted xpEarned activeMinutes favorites folders lastActiveAt }
      }
    }
  }
`;

const ACTIVITY = gql`
  query AdminLibraryUserActivity($userId: ID!) {
    adminLibraryUserActivity(userId: $userId) {
      usage { userId email role displayName itemsOpened itemsCompleted xpEarned activeMinutes favorites folders lastActiveAt }
      profileInstruments
      profileStyles
      skillLevel
      historyInstruments { value share }
      historyStyles { value share }
      historyCreators
      recent { mode progress activeMinutes completedAt xpAwarded updatedAt item { id title creator } }
      favorites { id title creator }
      recommendations { score reasons item { id title creator } }
    }
  }
`;

const SORTS = [
  { value: 'RECENT', label: 'Last active' },
  { value: 'OPENED', label: 'Most items opened' },
  { value: 'COMPLETED', label: 'Most finished' },
  { value: 'TIME', label: 'Most time' },
];

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs text-gray-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function Chips({ values, tone = 'primary' }: { values: string[]; tone?: 'primary' | 'amber' | 'gray' }) {
  if (!values.length) return <span className="text-xs text-gray-400">–</span>;
  const colors = { primary: 'bg-primary-50 text-primary-700', amber: 'bg-amber-50 text-amber-800', gray: 'bg-gray-100 text-gray-700' }[tone];
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span key={value} className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>{value}</span>
      ))}
    </span>
  );
}

function UserActivity({ userId, onBack }: { userId: string; onBack(): void }) {
  const { data, loading, error } = useQuery(ACTIVITY, { variables: { userId }, fetchPolicy: 'network-only' });
  const activity = data?.adminLibraryUserActivity;
  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-900">
        <ArrowLeft className="h-4 w-4" /> All users
      </button>
      {loading && !activity && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-700">{error.message}</p>}
      {activity && (
        <>
          <div className="card p-5">
            <h3 className="text-lg font-semibold">{activity.usage.displayName ?? activity.usage.email}</h3>
            <p className="text-sm text-gray-500">
              {activity.usage.email} · {activity.usage.role.toLowerCase()} · last active {date(activity.usage.lastActiveAt)}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Opened', activity.usage.itemsOpened],
                ['Finished', activity.usage.itemsCompleted],
                ['XP earned', activity.usage.xpEarned],
                ['Minutes', activity.usage.activeMinutes],
                ['Favorites', activity.usage.favorites],
                ['Folders', activity.usage.folders],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{(value as number).toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card space-y-3 p-5 text-sm">
              <h4 className="font-semibold">Profile</h4>
              <p className="flex flex-wrap items-center gap-2"><span className="w-24 text-xs text-gray-500">Instruments</span><Chips values={activity.profileInstruments} /></p>
              <p className="flex flex-wrap items-center gap-2"><span className="w-24 text-xs text-gray-500">Styles</span><Chips values={activity.profileStyles} tone="amber" /></p>
              <p className="flex flex-wrap items-center gap-2"><span className="w-24 text-xs text-gray-500">Level</span><Chips values={activity.skillLevel ? [activity.skillLevel.toLowerCase()] : []} tone="gray" /></p>
              <h4 className="pt-2 font-semibold">Learned from reading and listening</h4>
              <p className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-xs text-gray-500">Instruments</span>
                <Chips values={activity.historyInstruments.map((tag: any) => `${tag.value} ${Math.round(tag.share * 100)}%`)} />
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-xs text-gray-500">Styles</span>
                <Chips values={activity.historyStyles.map((tag: any) => `${tag.value} ${Math.round(tag.share * 100)}%`)} tone="amber" />
              </p>
              <p className="flex flex-wrap items-center gap-2"><span className="w-24 text-xs text-gray-500">Composers</span><Chips values={activity.historyCreators} tone="gray" /></p>
            </div>

            <div className="card p-5 text-sm">
              <h4 className="mb-2 flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary-600" /> Currently recommended</h4>
              {activity.recommendations.length === 0 ? (
                <p className="text-gray-500">Nothing yet - no instruments or styles in the profile and no reading history, or the items aren&rsquo;t tagged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {activity.recommendations.map((rec: any) => (
                    <li key={rec.item.id}>
                      <Link href={`/library/${rec.item.id}`} className="font-medium text-gray-900 hover:text-primary-700">{rec.item.title}</Link>
                      <p className="text-xs text-gray-500">{[rec.item.creator, rec.reasons.join(' · '), `score ${rec.score}`].filter(Boolean).join(' · ')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <h4 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold">Reading and listening</h4>
            {activity.recent.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">No items opened yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Item</th>
                      <th className="px-4 py-2 font-medium">Mode</th>
                      <th className="px-4 py-2 font-medium">Progress</th>
                      <th className="px-4 py-2 font-medium">Minutes</th>
                      <th className="px-4 py-2 font-medium">Finished</th>
                      <th className="px-4 py-2 font-medium">Last</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activity.recent.map((row: any) => (
                      <tr key={`${row.item.id}-${row.mode}`}>
                        <td className="max-w-xs px-4 py-2">
                          <Link href={`/library/${row.item.id}`} className="line-clamp-1 hover:text-primary-700">{row.item.title}</Link>
                        </td>
                        <td className="px-4 py-2 text-xs">{row.mode === 'READ' ? 'Read' : 'Listen'}</td>
                        <td className="px-4 py-2 tabular-nums">{Math.round(row.progress * 100)}%</td>
                        <td className="px-4 py-2 tabular-nums">{row.activeMinutes}</td>
                        <td className="px-4 py-2 text-xs">{row.completedAt ? `✓ +${row.xpAwarded} XP` : '–'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{date(row.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {activity.favorites.length > 0 && (
            <div className="card p-5 text-sm">
              <h4 className="mb-2 flex items-center gap-1.5 font-semibold"><Star className="h-4 w-4 text-amber-500" /> Favorites</h4>
              <ul className="grid gap-1 sm:grid-cols-2">
                {activity.favorites.map((item: any) => (
                  <li key={item.id} className="truncate">
                    <Link href={`/library/${item.id}`} className="hover:text-primary-700">{item.title}</Link>
                    {item.creator && <span className="text-xs text-gray-500"> · {item.creator}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function LibraryUsageTab() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('RECENT');
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const { data, loading, error } = useQuery(USAGE, { variables: { query: query || null, sort, page, limit: 25 }, fetchPolicy: 'cache-and-network' });
  const usage = data?.adminLibraryUsage;

  if (userId) return <UserActivity userId={userId} onBack={() => setUserId(null)} />;

  const users = usage?.users;
  const pages = users ? Math.max(1, Math.ceil(users.totalCount / users.limit)) : 1;
  return (
    <div className="space-y-4" data-testid="admin-library-usage">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {usage && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Users} label="Active users, 7 days" value={usage.summary.activeUsers7d} />
          <Stat icon={Users} label="Active users, 30 days" value={usage.summary.activeUsers30d} />
          <Stat icon={BookOpen} label="Items opened, 30 days" value={usage.summary.itemsOpened30d} />
          <Stat icon={CheckCircle2} label="Finished, 30 days" value={usage.summary.completions30d} />
          <Stat icon={Sparkles} label="XP awarded, 30 days" value={usage.summary.xpAwarded30d} />
          <Stat icon={Star} label="Favorites" value={usage.summary.favorites} />
          <Stat icon={FolderOpen} label="Folders" value={usage.summary.folders} />
        </div>
      )}

      {usage && usage.topItems.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-2 font-semibold">Most opened</h3>
          <ol className="space-y-1 text-sm">
            {usage.topItems.map((row: any, index: number) => (
              <li key={row.item.id} className="flex gap-2">
                <span className="w-5 text-right tabular-nums text-gray-400">{index + 1}.</span>
                <Link href={`/library/${row.item.id}`} className="min-w-0 flex-1 truncate hover:text-primary-700">
                  {row.item.title}
                  {row.item.creator && <span className="text-gray-500"> · {row.item.creator}</span>}
                </Link>
                <span className="shrink-0 tabular-nums text-xs text-gray-500">{row.opens} opened · {row.completions} finished</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
          <h3 className="flex-1 font-semibold">Users</h3>
          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(input.trim());
              setPage(1);
            }}
          >
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Name or email" aria-label="Find user" className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-sm sm:w-56" />
          </form>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort users" className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
            {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        {loading && !usage ? (
          <p className="px-5 py-4 text-sm text-gray-500">Loading…</p>
        ) : !users?.nodes.length ? (
          <p className="px-5 py-4 text-sm text-gray-500">{query ? 'No user matches.' : 'No one has used the Library while signed in yet.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Opened</th>
                  <th className="px-4 py-2 font-medium">Finished</th>
                  <th className="px-4 py-2 font-medium">XP</th>
                  <th className="px-4 py-2 font-medium"><Clock className="inline h-3.5 w-3.5" /> Min</th>
                  <th className="px-4 py-2 font-medium"><Star className="inline h-3.5 w-3.5" /></th>
                  <th className="px-4 py-2 font-medium"><FolderOpen className="inline h-3.5 w-3.5" /></th>
                  <th className="px-4 py-2 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.nodes.map((row: any) => (
                  <tr key={row.userId} className="cursor-pointer hover:bg-gray-50" onClick={() => setUserId(row.userId)}>
                    <td className="px-4 py-2">
                      <button type="button" className="text-left font-medium text-gray-900 hover:text-primary-700">{row.displayName ?? row.email}</button>
                      <p className="text-xs text-gray-500">{row.email} · {row.role.toLowerCase()}</p>
                    </td>
                    <td className="px-4 py-2 tabular-nums">{row.itemsOpened}</td>
                    <td className="px-4 py-2 tabular-nums">{row.itemsCompleted}</td>
                    <td className="px-4 py-2 tabular-nums">{row.xpEarned}</td>
                    <td className="px-4 py-2 tabular-nums">{row.activeMinutes}</td>
                    <td className="px-4 py-2 tabular-nums">{row.favorites}</td>
                    <td className="px-4 py-2 tabular-nums">{row.folders}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{date(row.lastActiveAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-gray-100 p-3 text-sm">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40">Previous</button>
            <span className="text-gray-600">Page {page} of {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
