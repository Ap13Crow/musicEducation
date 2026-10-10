'use client';

import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CheckCircle2, Mail, Trash2, UserPlus } from 'lucide-react';

// Course builder: invite people to a course free of charge by email. Anyone
// with an account is enrolled at once; everyone gets an email with the link
// and is enrolled for free when they press "Enroll" (API: resolvers/
// courseAccess.ts). Students who booked lessons with you, and your
// subscribers, need no invitation.

const INVITATIONS = gql`
  query CourseInvitationsForBuilder($courseId: ID!) { courseInvitations(courseId: $courseId) { id email enrolledAt createdAt } }
`;
const INVITE = gql`
  mutation InviteToCourse($courseId: ID!, $emails: [String!]!) { inviteToCourse(courseId: $courseId, emails: $emails) { id } }
`;
const REVOKE = gql`
  mutation RevokeCourseInvitation($id: ID!) { revokeCourseInvitation(id: $id) }
`;

export function CourseInvitationsCard({ courseId }: { courseId: string }) {
  const { data, refetch } = useQuery(INVITATIONS, { variables: { courseId }, fetchPolicy: 'cache-and-network' });
  const [invite, { loading, error }] = useMutation(INVITE);
  const [revoke] = useMutation(REVOKE);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<number | null>(null);
  const invitations: any[] = data?.courseInvitations ?? [];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const emails = text.split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean);
    if (!emails.length) return;
    const result = await invite({ variables: { courseId, emails } }).catch(() => null);
    if (result?.data) {
      setSent(emails.length);
      setText('');
      await refetch();
    }
  }

  return (
    <section className="card space-y-4 p-6" data-testid="course-invitations">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold"><UserPlus className="h-5 w-5 text-primary-600" /> Invite students</h2>
        <p className="mt-1 text-sm text-gray-600">
          Invited people take this course free of charge. Students who booked lessons with you and your subscribers already have it
          for free; members of mymusic.coach Plus too.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={text}
          onChange={(event) => { setText(event.target.value); setSent(null); }}
          rows={3}
          placeholder="anna@example.org, ben@example.org"
          aria-label="Email addresses"
          className="input w-full text-base sm:text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading || !text.trim()} className="btn-primary inline-flex items-center gap-2">
            <Mail className="h-4 w-4" /> {loading ? 'Sending…' : 'Send invitations'}
          </button>
          {sent !== null && <span className="text-sm text-green-700">{sent} invitation{sent === 1 ? '' : 's'} sent.</span>}
        </div>
        {error && <p className="text-sm text-red-700">{error.message}</p>}
      </form>
      {invitations.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate">{invitation.email}</span>
              {invitation.enrolledAt ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> enrolled</span>
              ) : (
                <span className="text-xs text-gray-500">invited {new Date(invitation.createdAt).toLocaleDateString()}</span>
              )}
              <button
                type="button"
                aria-label={`Remove invitation for ${invitation.email}`}
                title="Remove invitation (an enrolled student keeps the course)"
                onClick={() => void revoke({ variables: { id: invitation.id } }).then(() => refetch())}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
