// BnF's SRU catalogue search and Gallica IIIF metadata are open, unauthenticated
// APIs - no credential gates reading them, same as browsing the public BnF/
// Gallica websites. What does require authorization is reusing an actual
// digitized master (a score image, an audio file) on a commercial platform:
// BnF charges a reuse fee and requires a signed declaration for that (see
// https://www.bnf.fr/en/order-reproduction-commercial-use). This flag is the
// single switch for that - unset, every import mutation rejects with
// NOT_CONFIGURED while search/preview stays fully usable, the same shape as
// Classictic's isConfigured() gate.
export function bnfCommercialReuseConfigured(): boolean {
  return process.env.BNF_COMMERCIAL_LICENSE_ACCEPTED === 'true';
}

// Showing Gallica scans/recordings on the free, no-login public Library
// (read-only, credited "Source gallica.bnf.fr / BnF") - separate from the
// commercial licence above, which importing into paid courses still needs.
// Gallica's terms make non-commercial reuse free with that credit and
// commercial reuse (anything "generating revenue directly") licensed; which
// side the public Library falls on is the operator's call, so this is its
// own switch, off by default. A signed commercial licence covers it too.
export function bnfLibraryMediaEnabled(): boolean {
  return process.env.BNF_LIBRARY_MEDIA_ENABLED === 'true' || bnfCommercialReuseConfigured();
}

// Gallica (not catalogue.bnf.fr) 403s a request with no/empty User-Agent -
// confirmed live: an unidentified request is rejected, an honest one
// naming this service is accepted. Not a workaround for a block, just
// identifying the caller like any well-behaved API consumer should. A
// signed commercial agreement may specify a different required UA/quota
// once BNF_COMMERCIAL_LICENSE_ACCEPTED is real - revisit this then.
export const GALLICA_USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; course-content integration)';

/** Exact credit line BnF's reuse terms require on anything imported from Gallica. */
export function bnfAttribution(workTitle?: string | null): string {
  return workTitle
    ? `${workTitle} — source: gallica.bnf.fr / Bibliothèque nationale de France`
    : 'Source: gallica.bnf.fr / Bibliothèque nationale de France';
}
