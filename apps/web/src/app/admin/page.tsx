'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  Users, BookOpen, Calendar, DollarSign, Settings, Shield,
  Key, Brain, Video, CreditCard, BarChart3, UserCog, ChevronRight,
  Save, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'content' | 'api-keys' | 'settings';

const SAMPLE_STATS = {
  totalUsers: 1247,
  totalTeachers: 42,
  totalCourses: 86,
  totalEvents: 23,
  totalBookings: 534,
  totalRevenue: 48750.0,
};

const SAMPLE_USERS = [
  { id: '1', displayName: 'Anna Keller', email: 'anna@example.com', role: 'TEACHER', createdAt: '2024-06-15' },
  { id: '2', displayName: 'Marco De Luca', email: 'marco@example.com', role: 'TEACHER', createdAt: '2024-07-02' },
  { id: '3', displayName: 'Sarah K.', email: 'sarah@example.com', role: 'STUDENT', createdAt: '2024-08-10' },
  { id: '4', displayName: 'Thomas M.', email: 'thomas@example.com', role: 'STUDENT', createdAt: '2024-09-22' },
  { id: '5', displayName: 'Admin User', email: 'admin@musicedu.app', role: 'ADMIN', createdAt: '2024-01-01' },
];

const API_KEY_FIELDS = [
  { key: 'CALENDLY_ACCESS_TOKEN', label: 'Calendly Access Token', icon: Calendar, description: 'For booking scheduling integration' },
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
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <BookOpen className="h-4 w-4 text-primary-600" />
            <span>Review pending courses</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <UserCog className="h-4 w-4 text-primary-600" />
            <span>Review teacher applications</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Review flagged content</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors">
            <BarChart3 className="h-4 w-4 text-primary-600" />
            <span>View analytics</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const users = SAMPLE_USERS.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!u.displayName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
      </div>

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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.displayName}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                    user.role === 'TEACHER' ? 'bg-purple-50 text-purple-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={user.role}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentTab() {
  const [heroTitle, setHeroTitle] = useState('Your Classical Music Education Platform');
  const [heroSubtitle, setHeroSubtitle] = useState('Theory courses, live lessons, and live performances — all in one place.');
  const [statsEnabled, setStatsEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" /> Homepage Content
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
          <textarea
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="input w-full"
            rows={2}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={statsEnabled}
              onChange={(e) => setStatsEnabled(e.target.checked)}
              className="rounded border-gray-300 text-primary-600"
            />
            Show statistics section
          </label>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold">SEO Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea className="input w-full" rows={2} defaultValue="Learn classical music through theory courses, live lessons with certified teachers, and discover performances near you." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <input type="text" className="input w-full" defaultValue="classical music, music education, online lessons, music theory" />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save SEO Settings
        </button>
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
                  <button className="btn-primary text-sm px-3">
                    <Save className="h-4 w-4" />
                  </button>
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
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security Settings
        </h3>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
            Require email verification for new accounts
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
            Enable rate limiting on API endpoints
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
            Force HTTPS in production
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session timeout (minutes)</label>
          <input type="number" className="input w-40" defaultValue={30} min={5} max={1440} />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Security Settings
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="h-4 w-4" /> Keycloak Configuration
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keycloak Issuer URL</label>
          <input type="text" className="input w-full" defaultValue="http://localhost:8080/realms/musicedu" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
          <input type="text" className="input w-full" defaultValue="musicedu-web" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Redirect URIs</label>
          <textarea className="input w-full" rows={2} defaultValue={"http://localhost:3000/*\nhttps://musicedu.app/*"} />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Keycloak Settings
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold">Platform Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
          <select className="input w-40">
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
          <select className="input w-40">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
            Allow teacher self-registration
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
            Enable AI-powered assessments
          </label>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Platform Settings
        </button>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
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
            {activeTab === 'api-keys' && <ApiKeysTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
