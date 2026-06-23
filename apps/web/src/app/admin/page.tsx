'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { keycloakAdminUrl } from '@/lib/external-links';
import { useSession, signIn } from 'next-auth/react';
import {
  Users, BookOpen, Calendar, DollarSign, Settings, Shield,
  Key, Brain, Video, CreditCard, BarChart3, UserCog, ChevronRight,
  Eye, EyeOff, AlertTriangle,
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'content' | 'integrations' | 'api-keys' | 'settings';

// Identity/config defaults shown in the admin UI. Driven by NEXT_PUBLIC_* env
// so they reflect the deployment; defaults target the production domain.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.mymusic.coach';
const KEYCLOAK_ISSUER_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'https://auth.mymusic.coach/realms/mymusic-coach';
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'mymusic-coach-web';
const KEYCLOAK_REDIRECT_URIS = `${APP_URL}/*`;

// Derive realm name from issuer and build the correct realm-specific console URL.
// jens@apel.us has realm-admin on mymusic-coach — NOT master realm access.
const KEYCLOAK_REALM = KEYCLOAK_ISSUER_URL.split('/realms/').pop() ?? 'mymusic-coach';
const KEYCLOAK_USERS_URL = `${keycloakAdminUrl}/#/${KEYCLOAK_REALM}/users`;

const SAMPLE_STATS = {
  totalUsers: 1247,
  totalTeachers: 42,
  totalCourses: 86,
  totalEvents: 23,
  totalBookings: 534,
  totalRevenue: 48750.0,
};


const API_KEY_FIELDS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', icon: Brain, description: 'For AI-powered assessment reports' },
  { key: 'CLAUDE_API_KEY', label: 'Claude/Anthropic API Key', icon: Brain, description: 'Alternative AI provider for analysis' },
  { key: 'DEEPSEEK_API_KEY', label: 'DeepSeek API Key', icon: Brain, description: 'AI model for music analysis' },
  { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', icon: CreditCard, description: 'Payment processing' },
  { key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret', icon: CreditCard, description: 'Stripe webhook verification' },
  { key: 'ZOOM_API_KEY', label: 'Zoom API Key', icon: Video, description: 'Video lesson integration' },
  { key: 'ZOOM_API_SECRET', label: 'Zoom API Secret', icon: Video, description: 'Zoom authentication' },
];

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const stats = SAMPLE_STATS;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
        <StatCard icon={UserCog} label="Teachers" value={stats.totalTeachers} color="bg-purple-100 text-purple-600" />
        <StatCard icon={BookOpen} label="Courses" value={stats.totalCourses} color="bg-green-100 text-green-600" />
        <StatCard icon={Calendar} label="Events" value={stats.totalEvents} color="bg-amber-100 text-amber-600" />
        <StatCard icon={BarChart3} label="Bookings" value={stats.totalBookings} color="bg-pink-100 text-pink-600" />
        <StatCard icon={DollarSign} label="Revenue" value={`CHF ${stats.totalRevenue.toLocaleString()}`} color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-semibold">Quick Links</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <a href="https://learn.mymusic.coach/admin/" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <BookOpen className="h-4 w-4 text-primary-600" />
            <span>Moodle — courses &amp; users</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </a>
          <a href="https://booking.mymusic.coach/Web/" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <UserCog className="h-4 w-4 text-primary-600" />
            <span>LibreBooking — resources &amp; schedules</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </a>
          <a href="https://tickets.mymusic.coach/control/" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <BarChart3 className="h-4 w-4 text-primary-600" />
            <span>pretix — events &amp; tickets</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </a>
          <a href={KEYCLOAK_USERS_URL} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <Shield className="h-4 w-4 text-red-600" />
            <span>User Management</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
}

const GET_ADMIN_USERS = gql`
  query AdminUsers($role: Role, $search: String) {
    adminUsers(role: $role, search: $search, limit: 100) {
      id
      displayName
      email
      role
      createdAt
    }
  }
`;

const SET_USER_ROLE = gql`
  mutation AdminSetRole($userId: ID!, $role: Role!) {
    adminSetRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

const SYNC_KEYCLOAK_ROLES = gql`
  mutation SyncKeycloakRoles {
    syncKeycloakRoles { created skipped total }
  }
`;

function UsersTab() {
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    variables: { role: roleFilter || undefined, search: searchQuery || undefined },
    fetchPolicy: 'cache-and-network',
  });
  const [setRole] = useMutation(SET_USER_ROLE, { refetchQueries: [{ query: GET_ADMIN_USERS, variables: { role: roleFilter || undefined, search: searchQuery || undefined } }] });
  const [syncRoles, { loading: syncing }] = useMutation(SYNC_KEYCLOAK_ROLES);

  const users: { id: string; displayName: string; email: string; role: string; createdAt: string }[] =
    data?.adminUsers ?? [];

  async function handleSyncKeycloak() {
    setSyncMsg(null);
    try {
      const { data: d } = await syncRoles();
      const r = d?.syncKeycloakRoles;
      setSyncMsg(`Keycloak sync: ${r?.created ?? 0} roles updated, ${r?.total ?? 0} users scanned.`);
      refetch();
      setTimeout(() => setSyncMsg(null), 6000);
    } catch (e: any) {
      setSyncMsg(`Sync failed: ${e.message}`);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setChangingRole(userId);
    try {
      await setRole({ variables: { userId, role } });
    } finally {
      setChangingRole(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="TEACHER">Teachers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button
          onClick={handleSyncKeycloak}
          disabled={syncing}
          title="Pull role changes made in Keycloak into the platform database"
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {syncing ? 'Syncing…' : 'Sync Keycloak roles'}
        </button>
      </div>

      {syncMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-800">{syncMsg}</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load users: {error.message}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && !error && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No users found.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.displayName}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={changingRole === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer focus:ring-1 focus:ring-primary-400 ${
                      user.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                      user.role === 'TEACHER' ? 'bg-purple-50 text-purple-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={KEYCLOAK_USERS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary-600 hover:underline"
                  >
                    Edit in Keycloak
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">Deep Integrations</p>
        <p className="mt-1">
          Complex configurations like setting up a complex quiz structure or detailed event parameters.
          These use secure, SSO-authenticated iframe integrations with custom CSS to strip away native headers and sidebars.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-2 font-semibold">Moodle Course Management</h3>
          <p className="mb-4 text-sm text-gray-600">Advanced quiz and assignment configuration.</p>
          <div className="h-64 border rounded bg-gray-100 flex items-center justify-center text-sm text-gray-500">
            [Moodle iframe injected here]
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-2 font-semibold">Pretix Event Management</h3>
          <p className="mb-4 text-sm text-gray-600">Detailed ticketing and quota configuration.</p>
          <div className="h-64 border rounded bg-gray-100 flex items-center justify-center text-sm text-gray-500">
            [Pretix iframe injected here]
          </div>
        </div>
      </div>
    </div>
  );
}

const SYNC_MOODLE_COURSES = gql`
  mutation SyncCoursesFromMoodle {
    syncCoursesFromMoodle { created skipped total }
  }
`;

function ContentTab() {
  const [syncMoodle, { loading: syncing }] = useMutation(SYNC_MOODLE_COURSES);
  const [syncResult, setSyncResult] = useState<{ created: number; skipped: number; total: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSyncMoodle() {
    setSyncResult(null);
    setSyncError(null);
    try {
      const { data } = await syncMoodle();
      setSyncResult(data?.syncCoursesFromMoodle ?? null);
    } catch (e: any) {
      setSyncError(e.message ?? 'Sync failed');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">Content is managed in the native admin interfaces</p>
        <p className="mt-1">Courses and learning materials → Moodle. Booking resources and schedules → LibreBooking. Events and tickets → pretix. Use the Quick Links above to navigate directly.</p>
      </div>

      {/* Moodle course sync */}
      <div className="card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Sync Courses from Moodle</p>
            <p className="text-xs text-gray-500 mt-0.5">Import courses created in Moodle into the platform catalog. New courses are imported as DRAFT — publish them here once ready.</p>
            {syncResult && (
              <p className="mt-2 text-xs text-green-700">
                Done: {syncResult.created} imported, {syncResult.skipped} already synced (of {syncResult.total} Moodle courses).
              </p>
            )}
            {syncError && <p className="mt-2 text-xs text-red-600">{syncError}</p>}
          </div>
          <button
            onClick={handleSyncMoodle}
            disabled={syncing}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href="https://learn.mymusic.coach/course/management.php" target="_blank" rel="noopener noreferrer"
           className="card flex items-center gap-3 p-4 transition-colors hover:border-primary-300">
          <BookOpen className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">Manage Courses</p>
            <p className="text-xs text-gray-500">Create and edit courses in Moodle</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 shrink-0" />
        </a>
        <a href="https://tickets.mymusic.coach/control/" target="_blank" rel="noopener noreferrer"
           className="card flex items-center gap-3 p-4 transition-colors hover:border-primary-300">
          <Calendar className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">Manage Events</p>
            <p className="text-xs text-gray-500">Create events and ticket categories in pretix</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 shrink-0" />
        </a>
        <a href="https://booking.mymusic.coach/Web/admin/manage_resources.php" target="_blank" rel="noopener noreferrer"
           className="card flex items-center gap-3 p-4 transition-colors hover:border-primary-300">
          <UserCog className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">Manage Resources</p>
            <p className="text-xs text-gray-500">Rooms and instruments in LibreBooking</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 shrink-0" />
        </a>
        <a href="https://booking.mymusic.coach/Web/admin/manage_schedules.php" target="_blank" rel="noopener noreferrer"
           className="card flex items-center gap-3 p-4 transition-colors hover:border-primary-300">
          <BarChart3 className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">Manage Schedules</p>
            <p className="text-xs text-gray-500">Timetables and availability in LibreBooking</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 shrink-0" />
        </a>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});

  function toggleVisibility(key: string) {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Security Notice</p>
            <p className="mt-1">API keys are stored securely as environment variables. Changes here update the configuration and require a service restart to take effect. Never share API keys publicly.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {API_KEY_FIELDS.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900">{label}</label>
                <p className="text-xs text-gray-500 mb-2">{description}</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visibleKeys[key] ? 'text' : 'password'}
                      placeholder={`Enter ${label}...`}
                      value={keyValues[key] ?? ''}
                      onChange={(e) => setKeyValues((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="input w-full pr-10 text-sm"
                      autoComplete="off"
                    />
                    <button
                      onClick={() => toggleVisibility(key)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      type="button"
                      aria-label={visibleKeys[key] ? 'Hide' : 'Show'}
                    >
                      {visibleKeys[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">Platform configuration</p>
        <p className="mt-1">Security, identity and platform settings are managed via environment variables and the Keycloak admin console. Changes take effect on the next container restart.</p>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="h-4 w-4" /> Identity Provider
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Issuer URL</dt>
            <dd className="font-mono text-gray-800 break-all">{KEYCLOAK_ISSUER_URL}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Client ID</dt>
            <dd className="font-mono text-gray-800">{KEYCLOAK_CLIENT_ID}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Redirect URIs</dt>
            <dd className="font-mono text-gray-800 break-all">{KEYCLOAK_REDIRECT_URIS}</dd>
          </div>
        </dl>
        <a
          href={KEYCLOAK_USERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
        >
          <Shield className="h-3.5 w-3.5" /> Open User Management
        </a>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold">Platform Defaults</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Currency</dt>
            <dd className="text-gray-800">CHF (Swiss Franc)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Timezone</dt>
            <dd className="text-gray-800">Europe/Zurich</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-40 shrink-0 font-medium text-gray-600">Languages</dt>
            <dd className="text-gray-800">English, Deutsch, Français, Italiano</dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">Edit <code>.env</code> and restart containers to change platform defaults.</p>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'integrations', label: 'Deep Integrations', icon: Brain },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const isAdmin = (session as any)?.roles?.includes('ADMIN');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="card max-w-md p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="mb-2 text-xl font-bold">Admin Access Required</h1>
          <p className="mb-6 text-sm text-gray-500">You need to be signed in as an administrator to access this page.</p>
          <button onClick={() => signIn('keycloak')} className="btn-primary w-full py-3">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary-600" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500">Manage users, content, API integrations, and platform settings.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar navigation */}
          <nav className="lg:w-56 shrink-0">
            <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'content' && <ContentTab />}
            {activeTab === 'integrations' && <IntegrationsTab />}
            {activeTab === 'api-keys' && <ApiKeysTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
