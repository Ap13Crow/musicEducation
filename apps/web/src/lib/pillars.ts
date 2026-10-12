import { BookOpen, Calendar, Music, Users, type LucideIcon } from 'lucide-react';

/**
 * The four equal product pillars, in display order. Shared by the homepage,
 * the dashboard and the profile quick links so they never drift apart.
 * Community (feed, discussions) links the pillars; it is not a fifth one.
 */
export const PILLARS: {
  key: 'teachers' | 'courses' | 'events' | 'library';
  /** Short name for page header chips. */
  label: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Soft circular icon background + icon colour. */
  iconClass: string;
  /** Text colour for compact links. */
  textClass: string;
}[] = [
  {
    key: 'teachers',
    label: 'Teachers',
    title: 'Find a Teacher',
    description: 'Find inspiring music teachers around the world, online or in person.',
    href: '/teachers',
    icon: Users,
    iconClass: 'bg-blue-50 text-primary-600',
    textClass: 'text-primary-600',
  },
  {
    key: 'courses',
    label: 'Courses',
    title: 'Explore Courses',
    description: 'Explore music courses for every level, from beginner to advanced.',
    href: '/courses',
    icon: Music,
    iconClass: 'bg-violet-50 text-violet-600',
    textClass: 'text-violet-600',
  },
  {
    key: 'events',
    label: 'Events',
    title: 'Discover Events',
    description: 'Discover concerts, masterclasses, festivals and workshops around the world.',
    href: '/events',
    icon: Calendar,
    iconClass: 'bg-amber-50 text-secondary-600',
    textClass: 'text-secondary-600',
  },
  {
    key: 'library',
    label: 'Library',
    title: 'Explore the Library',
    description: 'Browse sheet music, recordings and books from trusted musical collections.',
    href: '/library',
    icon: BookOpen,
    iconClass: 'bg-emerald-50 text-emerald-600',
    textClass: 'text-emerald-600',
  },
];

export type PillarKey = (typeof PILLARS)[number]['key'];

export function getPillar(key: PillarKey) {
  return PILLARS.find((p) => p.key === key)!;
}
