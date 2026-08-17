'use client';

import Link from 'next/link';
import { AlertCircle, Home, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function AuthenticationErrorPage() {
  return <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-6">
    <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
      <h1 className="mt-4 font-serif text-2xl font-bold text-gray-900">The sign-in flow could not be completed</h1>
      <p className="mt-2 text-sm text-gray-600">Your account is safe. Return to the website or start a fresh sign-in.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2"><Home className="h-4 w-4" />Home</Link>
        <button onClick={()=>void signIn('keycloak',{callbackUrl:'/dashboard'},{prompt:'login',max_age:'0'})} className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2"><LogIn className="h-4 w-4" />Sign in again</button>
      </div>
    </section>
  </main>;
}
