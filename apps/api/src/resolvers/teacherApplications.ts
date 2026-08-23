import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isOwnedUploadUrl, type UploadPurpose } from '../lib/storage.js';
import { isValidYouTubeUrl } from '../lib/youtube.js';
import type { GraphQLContext } from '../types.js';

const MIN_TEACHER_AGE_YEARS = 18;
// Generous enough that no real applicant is ever wrongly rejected, but
// catches data-entry mistakes ("1900" instead of "2000", a typo'd decade)
// that a lower-bound-only check (>= 18) doesn't - age alone can't tell 126
// from a keying error, but nobody genuinely applying to teach is 126.
const MAX_TEACHER_AGE_YEARS = 100;

// A structured postal address, not one free-text line - avoids an
// unparseable blob in the database (can't sort/filter by city or country,
// can't validate a postal code format, can't hand it to a shipping/
// verification API later). street/houseNumber/postalCode/city/country are
// required; state is optional (only meaningful for some countries, e.g. US/
// CA/AU, and there's no single format that fits every country that has one).
// Patterns are deliberately permissive (international formats vary widely:
// "SW1A 1AA", "8001", "12345-6789", "12 bis", "221B") - this rejects garbage
// (empty, way too long, or characters no real address uses) without
// pretending to fully validate a global address format server-side.
// \p{Pd} (Unicode "dash punctuation") covers every dash a real address might
// use, not just ASCII hyphen-minus (en dash, em dash, etc.); ' and ‘/
// ’ cover both the ASCII apostrophe and the typographic quote marks
// real names use ("St John's" vs "St John’s", "Cote d'Ivoire" vs "Côte
// d’Ivoire") - an ASCII-only class would otherwise reject valid input.
const STREET_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.,'‘’\p{Pd}]{0,99}$/u;
// Requires at least one digit somewhere ((?=.*\d) lookahead) - a house/
// street number that's purely letters ("b" alone) isn't a real house
// number. Still allows "12b", "221B", "12-14", "12 bis", "12/3" etc.
const HOUSE_NUMBER_PATTERN = /^(?=.*\d)[\p{L}0-9][\p{L}0-9\s.\p{Pd}/]{0,14}$/u;
const CITY_PATTERN = /^[\p{L}][\p{L}\s.'‘’\p{Pd}]{0,99}$/u;
const COUNTRY_PATTERN = /^[\p{L}][\p{L}\s.'‘’\p{Pd}]{0,59}$/u;

// Postal-code format genuinely varies by country in ways one generic
// pattern can't catch (Switzerland is exactly 4 digits; the Netherlands is
// 4 digits + 2 letters; Poland is NN-NNN) - without this, "12" would pass
// for a Swiss address as happily as "8001" does. Keyed by the exact country
// strings this form and COUNTRIES (apps/web/become-teacher) both use.
// Sources: national postal authorities' documented formats. A Map, not a
// plain object - a plain object's lookup falls through to inherited
// Object.prototype properties for a country value like "constructor" or
// "toString" (returning a function, not undefined), which then crashes on
// pattern.test(...) instead of hitting the documented fallback below. A Map
// has no prototype-chain key collisions to worry about.
const POSTAL_CODE_PATTERNS_BY_COUNTRY = new Map<string, RegExp>([
  ['Austria', /^\d{4}$/],
  ['Belgium', /^\d{4}$/],
  ['Bulgaria', /^\d{4}$/],
  ['Canada', /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/],
  ['Croatia', /^\d{5}$/],
  ['Cyprus', /^\d{4}$/],
  ['Czechia', /^\d{3} ?\d{2}$/],
  ['Denmark', /^\d{4}$/],
  ['Estonia', /^\d{5}$/],
  ['Finland', /^\d{5}$/],
  ['France', /^\d{5}$/],
  ['Germany', /^\d{5}$/],
  ['Greece', /^\d{3} ?\d{2}$/],
  ['Hungary', /^\d{4}$/],
  ['Iceland', /^\d{3}$/],
  ['Ireland', /^[A-Za-z]\d[A-Za-z0-9] ?[A-Za-z0-9]{4}$/], // Eircode
  ['Italy', /^\d{5}$/],
  ['Latvia', /^(LV-)?\d{4}$/],
  ['Liechtenstein', /^\d{4}$/],
  ['Lithuania', /^(LT-)?\d{5}$/],
  ['Luxembourg', /^\d{4}$/],
  ['Malta', /^[A-Za-z]{3} ?\d{4}$/],
  ['Netherlands', /^\d{4} ?[A-Za-z]{2}$/],
  ['Norway', /^\d{4}$/],
  ['Poland', /^\d{2}-\d{3}$/],
  ['Portugal', /^\d{4}-\d{3}$/],
  ['Romania', /^\d{6}$/],
  ['Slovakia', /^\d{3} ?\d{2}$/],
  ['Slovenia', /^(SI-)?\d{4}$/],
  ['Spain', /^\d{5}$/],
  ['Sweden', /^\d{3} ?\d{2}$/],
  ['Switzerland', /^\d{4}$/],
  // GIR 0AA is a real, still-valid special postcode (historically
  // Girobank's) that doesn't fit the standard outward-code shape (3
  // letters, not 1-2) - excluding it would reject a genuine UK address.
  ['United Kingdom', /^(GIR ?0AA|[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2})$/i],
  ['United States', /^\d{5}(-\d{4})?$/],
]);
// Fallback for "Other" (COUNTRIES' catch-all - see apps/web/become-teacher)
// and any country name not in the map above - permissive rather than
// hard-rejecting an applicant from a country this list doesn't cover yet.
const POSTAL_CODE_FALLBACK_PATTERN = /^[\p{L}0-9][\p{L}0-9\s\p{Pd}]{0,11}$/u;

function requireAddressField(value: unknown, label: string, pattern: RegExp): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    throw new GraphQLError(`${label} is required.`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  if (!pattern.test(trimmed)) {
    throw new GraphQLError(`${label} contains characters or a format that isn't valid.`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return trimmed;
}

// Country-aware, unlike requireAddressField's single-pattern check - picks
// the right national format when this country has one, otherwise falls
// back to the generic pattern. Must run after country is resolved (see
// call site), since the pattern choice depends on it.
function requirePostalCode(value: unknown, country: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    throw new GraphQLError('Postal code is required.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  const countryPattern = POSTAL_CODE_PATTERNS_BY_COUNTRY.get(country);
  const pattern = countryPattern ?? POSTAL_CODE_FALLBACK_PATTERN;
  if (!pattern.test(trimmed)) {
    const forCountry = countryPattern ? ` for ${country}` : '';
    throw new GraphQLError(`Postal code isn't a valid format${forCountry}.`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return trimmed;
}

// state is optional - validated only when actually provided, and only for
// safe characters (not required to match any real-world region format).
// Same Unicode dash/quote allowance as the required-field patterns above.
const STATE_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.'‘’\p{Pd}]{0,59}$/u;
function optionalAddressField(value: unknown, label: string): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return null;
  if (!STATE_PATTERN.test(trimmed)) {
    throw new GraphQLError(`${label} contains characters that aren't valid.`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return trimmed;
}

// Rejects a URL the client didn't actually get from requestUploadUrl for
// this purpose and this user - without it, a client could submit an
// arbitrary external URL for a field an admin later opens (cvUrl,
// audioSampleUrl, documentUrls), or one from someone else's upload
// namespace. Also rejects everything once storage isn't configured, so a
// stray URL can't sneak past the "uploads disabled" state.
function requireOwnedUploadUrl(url: string, purpose: UploadPurpose, userId: string, label: string): string {
  if (!isOwnedUploadUrl(url, purpose, userId)) {
    throw new GraphQLError(`${label} must come from requestUploadUrl(purpose: ${purpose}).`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return url;
}

// Full identity verification is a later phase; this is the quality/legal
// floor for a self-employed teacher applying now - exact age, not just
// "born 18 years ago or earlier" (accounts for the birthday not having
// happened yet this year).
export function calculateAge(birthdate: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - birthdate.getFullYear();
  const monthDiff = asOf.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

export const teacherApplicationResolvers = {
  Query: {
    async myTeacherApplication(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.teacherApplication.findUnique({ where: { userId: user.id }, include: { user: { include: { profile: true } } } });
    },

    async teacherApplications(_: unknown, { status, page = 1, limit = 50 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const where: any = {};
      if (status) where.status = status;
      return prisma.teacherApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        // Oldest-pending-first — reviewers work through a queue, not a feed.
        orderBy: { createdAt: 'asc' },
        // Preloaded so the User field resolver below doesn't re-fetch per row.
        include: { user: { include: { profile: true } } },
      });
    },
  },

  Mutation: {
    async applyForTeacher(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        throw new GraphQLError('You already have teacher access.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const existing = await prisma.teacherApplication.findUnique({ where: { userId: user.id } });
      if (existing?.status === 'PENDING') {
        throw new GraphQLError('Your application is already pending review.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (!input.birthdate) {
        throw new GraphQLError('Date of birth is required to apply.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const birthdate = new Date(input.birthdate);
      if (Number.isNaN(birthdate.getTime())) {
        throw new GraphQLError('Date of birth is invalid.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const age = calculateAge(birthdate);
      if (age < MIN_TEACHER_AGE_YEARS) {
        throw new GraphQLError(`You must be at least ${MIN_TEACHER_AGE_YEARS} years old to apply as a teacher.`, { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (age > MAX_TEACHER_AGE_YEARS) {
        throw new GraphQLError('Date of birth is invalid.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Required - this becomes the public profile's presentation video once
      // approved. A YouTube link, not an upload, so the site stays light.
      if (!input.videoUrl || !isValidYouTubeUrl(input.videoUrl)) {
        throw new GraphQLError('A YouTube link to a presentation or performance video is required to apply.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Structured address, validated field-by-field - see the pattern
      // constants above for why most of these are permissive rather than
      // country-specific. Country resolves first: postal code's format
      // depends on it (see requirePostalCode).
      const street = requireAddressField(input.street, 'Street', STREET_PATTERN);
      const houseNumber = requireAddressField(input.houseNumber, 'House number', HOUSE_NUMBER_PATTERN);
      const city = requireAddressField(input.city, 'City', CITY_PATTERN);
      const country = requireAddressField(input.country, 'Country', COUNTRY_PATTERN);
      const postalCode = requirePostalCode(input.postalCode, country);
      const state = optionalAddressField(input.state, 'State/region');

      // The name that will show on the public teacher profile once approved -
      // update it now rather than waiting for approval, so the applicant sees
      // it reflected immediately.
      const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
      if (fullName) {
        await prisma.userProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, displayName: fullName, instruments: [], musicStyles: [] },
          update: { displayName: fullName },
        });
      }

      // Each non-null URL must be one requestUploadUrl actually minted for
      // this user and this purpose - otherwise a client could submit any
      // external URL for a field an admin later opens in a new tab. Only
      // touch these columns when the client actually sent the field:
      // undefined means "no change" (the web wizard always re-sends the
      // application's existing URLs, but the resolver shouldn't rely on
      // that - a client that omits the field on a resubmission, e.g. to
      // only edit the headline, must not wipe out a previously uploaded
      // CV/recording/documents), while an explicit null/[] is a deliberate
      // clear.
      const cvUrl = input.cvUrl !== undefined
        ? (input.cvUrl ? requireOwnedUploadUrl(input.cvUrl, 'TEACHER_APPLICATION_CV', user.id, 'CV') : null)
        : undefined;
      const audioSampleUrl = input.audioSampleUrl !== undefined
        ? (input.audioSampleUrl ? requireOwnedUploadUrl(input.audioSampleUrl, 'TEACHER_APPLICATION_AUDIO', user.id, 'Audio sample') : null)
        : undefined;
      const documentUrls: string[] | undefined = input.documentUrls !== undefined
        ? input.documentUrls.map((url: string) => requireOwnedUploadUrl(url, 'TEACHER_APPLICATION_DOCUMENT', user.id, 'Document'))
        : undefined;
      // The photo (and cvUrl/audioSampleUrl/documentUrls) are normally set
      // by the dedicated /teacher-application/photo (and /cv, /audio,
      // /document) REST endpoints in index.ts, not through this mutation -
      // those endpoints save straight to Postgres as a data: URL, mirroring
      // /profile/avatar, so an applicant doesn't need S3_* secrets
      // configured on this deployment at all. This still accepts a real S3
      // fileUrl here too, for a deployment that does have S3_* configured
      // and chooses to route through requestUploadUrl instead.
      const imageUrl = input.imageUrl !== undefined
        ? (input.imageUrl ? requireOwnedUploadUrl(input.imageUrl, 'TEACHER_PROFILE_IMAGE', user.id, 'Photo') : null)
        : undefined;

      // Upsert rather than create-only: a previously rejected applicant can
      // resubmit, which resets status to PENDING and clears the prior review.
      return prisma.teacherApplication.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
          street,
          houseNumber,
          postalCode,
          city,
          state,
          country,
          birthdate,
          gender: input.gender?.trim() || null,
          motivation: input.motivation?.trim() || null,
          cvUrl,
          audioSampleUrl,
          documentUrls,
          imageUrl,
          videoUrl: input.videoUrl,
        },
        update: {
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
          street,
          houseNumber,
          postalCode,
          city,
          state,
          country,
          birthdate,
          gender: input.gender?.trim() || null,
          motivation: input.motivation?.trim() || null,
          cvUrl,
          audioSampleUrl,
          documentUrls,
          imageUrl,
          videoUrl: input.videoUrl,
          status: 'PENDING',
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    },

    async reviewTeacherApplication(_: unknown, { id, approve }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const application = await prisma.teacherApplication.findUnique({ where: { id } });
      if (!application) throw new GraphQLError('Application not found.', { extensions: { code: 'NOT_FOUND' } });

      return prisma.$transaction(async (tx) => {
        const updated = await tx.teacherApplication.update({
          where: { id },
          data: { status: approve ? 'APPROVED' : 'REJECTED', reviewedBy: user!.id, reviewedAt: new Date() },
        });

        if (approve) {
          const applicant = await tx.user.update({
            where: { id: application.userId },
            data: { role: 'TEACHER' },
            include: { profile: true },
          });
          // TeacherProfile.bio stores headline as its first line and
          // teachingBio (self-presentation) as everything after it (see
          // updateTeacherProfile / the teachingBio field resolver) -
          // combine the application's two fields the same way. filter(Boolean)
          // would drop an empty/missing headline whenever bio has content,
          // collapsing bio down to just the body - and the teachingBio
          // resolver always strips bio's first line regardless, so it would
          // wrongly eat the real first line of the self-presentation text.
          // Keep the headline slot (even empty) whenever there's a body.
          const headlineLine = application.headline ?? '';
          const bodyText = application.bio ?? applicant.profile?.bio ?? '';
          const combinedBio = headlineLine || bodyText ? `${headlineLine}\n${bodyText}` : null;
          await tx.teacherProfile.upsert({
            where: { userId: application.userId },
            create: {
              userId: application.userId,
              bio: combinedBio,
              instruments: application.instruments.length > 0 ? application.instruments : (applicant.profile?.instruments ?? []),
              musicStyles: applicant.profile?.musicStyles ?? [],
              languages: [],
              isAvailable: true,
              experienceYears: application.experienceYears,
              introVideoUrl: application.videoUrl,
              publicImageUrl: application.imageUrl,
            },
            // A resubmission-then-reapproval refreshes the bio/video/photo
            // (the teacher may have edited any of them) but leaves
            // introVideoVisible alone - that's the teacher's own toggle, not
            // something re-approval should silently reset. Only overwrite
            // publicImageUrl when the reapproved application actually has an
            // image - never blank out a photo the teacher already has live
            // just because a resubmission happened to omit it.
            update: {
              bio: combinedBio,
              experienceYears: application.experienceYears,
              introVideoUrl: application.videoUrl,
              ...(application.imageUrl ? { publicImageUrl: application.imageUrl } : {}),
            },
          });
        }

        return updated;
      });
    },
  },

  TeacherApplication: {
    async user(application: any, _: unknown, { prisma }: GraphQLContext) {
      if (application.user) return application.user;
      return prisma.user.findUnique({ where: { id: application.userId }, include: { profile: true } });
    },
    // Lightweight companions to cvUrl/audioSampleUrl/documentUrls - see the
    // schema comment on those fields for why a caller that only needs
    // existence/count should use these instead.
    hasCv(application: any) {
      return Boolean(application.cvUrl);
    },
    hasAudioSample(application: any) {
      return Boolean(application.audioSampleUrl);
    },
    documentCount(application: any) {
      return application.documentUrls?.length ?? 0;
    },
  },
};
