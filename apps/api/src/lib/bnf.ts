import { GraphQLError } from 'graphql';
import { bnfCommercialReuseConfigured } from '@my-music-coach/bnf-gallica';

export { bnfCommercialReuseConfigured };

// Search/preview (searchBnfCatalogue, bnfManifest) stay usable regardless -
// BnF's catalogue/Gallica metadata APIs are open. Only the two import
// mutations call this, same shape as externalCalendar.ts's
// isProviderConfigured() throwing NOT_CONFIGURED.
export function assertBnfCommercialReuseConfigured(): void {
  if (!bnfCommercialReuseConfigured()) {
    throw new GraphQLError(
      'Importing BnF/Gallica content requires a signed BnF commercial-reuse license - not configured on this deployment yet. Search and preview remain available.',
      { extensions: { code: 'NOT_CONFIGURED' } },
    );
  }
}
