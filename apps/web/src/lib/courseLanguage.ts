'use client';

import { useCallback, useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';

// The course language preference: which language the course catalogue shows
// first. English by default; a signed-in user's choice is stored on their
// profile (UserProfile.language), a visitor's in this browser only.

export const COURSE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
] as const;
export const DEFAULT_COURSE_LANGUAGE = 'en';
const STORAGE_KEY = 'mmc.courseLanguage';

// Languages named in their own language.
export function languageName(code?: string | null): string {
  if (!code) return '';
  return COURSE_LANGUAGES.find((language) => language.code === code)?.label ?? code.toUpperCase();
}

const isCourseLanguage = (value: unknown): value is string => COURSE_LANGUAGES.some((language) => language.code === value);

function storedLanguage(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isCourseLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

function storeLanguage(code: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page only.
  }
}

const MY_COURSE_LANGUAGE = gql`
  query MyCourseLanguage { me { id profile { language } } }
`;
const SET_COURSE_LANGUAGE = gql`
  mutation SetCourseLanguage($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id profile { language } }
  }
`;

export function useCourseLanguage(): { language: string; setLanguage: (code: string) => void; ready: boolean } {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const { data, loading } = useQuery(MY_COURSE_LANGUAGE, { skip: !signedIn });
  const [save] = useMutation(SET_COURSE_LANGUAGE);
  const [language, setLocal] = useState<string>(DEFAULT_COURSE_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === 'loading' || (signedIn && loading)) return;
    const fromProfile = data?.me?.profile?.language;
    setLocal(signedIn && isCourseLanguage(fromProfile) ? fromProfile : storedLanguage() ?? DEFAULT_COURSE_LANGUAGE);
    setReady(true);
  }, [status, signedIn, loading, data]);

  const setLanguage = useCallback(
    (code: string) => {
      if (!isCourseLanguage(code)) return;
      setLocal(code);
      storeLanguage(code);
      if (signedIn) void save({ variables: { input: { language: code } } }).catch(() => undefined);
    },
    [signedIn, save],
  );

  return { language, setLanguage, ready };
}
