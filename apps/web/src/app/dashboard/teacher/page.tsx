'use client';

import Link from 'next/link';
import { BookOpen, CalendarClock, CalendarPlus, UserRoundCheck } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';

export default function TeacherWorkspacePage() {
  return (
    <RoleGate allow={['TEACHER', 'ADMIN']} callbackUrl="/dashboard/teacher">
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Teacher workspace</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Build your teaching practice</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Set up the profile and availability that will power lessons, courses and events as each pillar comes online.
            </p>
          </div>
        </section>
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-4">
          <WorkspaceCard href="/dashboard/profile" icon={<UserRoundCheck />} title="Teacher profile" text="Complete your public teaching profile and instruments." />
          <WorkspaceCard href="/dashboard/teacher/availability" icon={<CalendarClock />} title="Lesson availability" text="Publish the recurring times students can book." />
          <WorkspaceCard href="/dashboard/teacher/content" icon={<BookOpen />} title="Theory studio" text="Create and publish native courses." />
          <WorkspaceCard href="/dashboard/teacher/content#performance" icon={<CalendarPlus />} title="Performance studio" text="Create and publish events." />
        </div>
      </main>
    </RoleGate>
  );
}

function WorkspaceCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="card p-6 transition hover:-translate-y-0.5 hover:border-primary-300">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">{icon}</div>
      <h2 className="mt-4 font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
    </Link>
  );
}
