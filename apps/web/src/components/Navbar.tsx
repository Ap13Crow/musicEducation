'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, User, LogOut, Settings, BookOpen, Music, Calendar, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = [
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Teachers', href: '/teachers', icon: Music },
    { name: 'Events', href: '/events', icon: Calendar },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary-700">
            <Music className="h-6 w-6" />
            My Music Coach
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {status === 'loading' && (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
            )}
            {status === 'unauthenticated' && (
              <>
                <button
                  onClick={() => signIn('keycloak')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Log in
                </button>
                <button
                  onClick={() => signIn('keycloak')}
                  className="btn-primary rounded-lg px-4 py-2 text-sm"
                >
                  Register
                </button>
              </>
            )}
            {status === 'authenticated' && session?.user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    {session.user.image ? (
                      <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{session.user.name ?? session.user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      {(session as any)?.roles?.includes('ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <div className="mt-3 border-t border-gray-200 pt-3">
            {status === 'unauthenticated' ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => signIn('keycloak')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Log in
                </button>
                <button
                  onClick={() => signIn('keycloak')}
                  className="btn-primary rounded-lg px-4 py-2 text-sm"
                >
                  Register
                </button>
              </div>
            ) : status === 'authenticated' ? (
              <div className="flex flex-col gap-1">
                <p className="px-3 py-1 text-xs text-gray-500">{session?.user?.email}</p>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <BookOpen className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                {(session as any)?.roles?.includes('ADMIN') && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
