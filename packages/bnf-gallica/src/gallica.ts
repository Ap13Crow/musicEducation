import type { BnfFetchedAsset, BnfManifest, BnfManifestPage } from './types.js';
import { BnfRequestError } from './types.js';
import { GALLICA_USER_AGENT } from './config.js';
import { fetchWithRetry } from './retry.js';

const REQUEST_TIMEOUT_MS = 30_000;
// Gallica rate-limits aggressively (confirmed live: a second image request
// seconds after the first 429'd) - every fetch here is server-initiated and
// one-shot per teacher action (search a manifest, import one page/track),
// never a loop over many pages, so this budget is generous on purpose.
const FETCH_MAX_BYTES = 50 * 1024 * 1024;

async function fetchWithTimeout(url: string, accept?: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    // fetchWithRetry already backs off and retries a 429 internally - this
    // check only fires once those retries are exhausted.
    const response = await fetchWithRetry(url, {
      signal: controller.signal,
      headers: { 'User-Agent': GALLICA_USER_AGENT, ...(accept ? { Accept: accept } : {}) },
    });
    if (response.status === 429) {
      throw new BnfRequestError('Gallica rate-limited this request (HTTP 429) - try again shortly.');
    }
    if (!response.ok) {
      throw new BnfRequestError(`Gallica request failed: HTTP ${response.status} for ${url}`);
    }
    return response;
  } catch (error) {
    if (error instanceof BnfRequestError) throw error;
    throw new BnfRequestError(`Gallica request failed for ${url}.`, error);
  } finally {
    clearTimeout(timeout);
  }
}

// Canvas @id looks like ".../ark:/12148/{ark}/canvas/f{n}" - the only place
// the page number is actually spelled out in the manifest.
const CANVAS_PAGE_PATTERN = /\/canvas\/f(\d+)$/i;

export async function getManifest(ark: string): Promise<BnfManifest> {
  const response = await fetchWithTimeout(`https://gallica.bnf.fr/iiif/ark:/12148/${encodeURIComponent(ark)}/manifest.json`);
  let manifest: any;
  try {
    manifest = await response.json();
  } catch (error) {
    throw new BnfRequestError(`Gallica returned an unparseable IIIF manifest for ark ${ark}.`, error);
  }

  const canvases: any[] = manifest?.sequences?.[0]?.canvases ?? [];
  const pages: BnfManifestPage[] = [];
  canvases.forEach((canvas, index) => {
    const pageNumber = Number(canvas?.['@id']?.match(CANVAS_PAGE_PATTERN)?.[1]) || index + 1;
    const imageUrl = canvas?.images?.[0]?.resource?.['@id'];
    const thumbnailUrl = canvas?.thumbnail?.['@id'] ?? imageUrl;
    if (!imageUrl) return;
    pages.push({
      pageNumber,
      label: canvas?.label && canvas.label !== 'null' ? String(canvas.label) : null,
      imageUrl,
      thumbnailUrl,
      audioUrl: `https://gallica.bnf.fr/ark:/12148/${ark}/f${pageNumber}.audio`,
    });
  });

  return {
    ark,
    title: String(manifest?.label ?? ark),
    permalink: manifest?.related ?? `https://gallica.bnf.fr/ark:/12148/${ark}`,
    pages,
  };
}

async function fetchAsset(url: string): Promise<BnfFetchedAsset> {
  const response = await fetchWithTimeout(url);
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > FETCH_MAX_BYTES) {
    throw new BnfRequestError(`Gallica asset at ${url} is larger (${contentLength} bytes) than the ${FETCH_MAX_BYTES}-byte import limit.`);
  }
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > FETCH_MAX_BYTES) {
    throw new BnfRequestError(`Gallica asset at ${url} exceeded the ${FETCH_MAX_BYTES}-byte import limit.`);
  }
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream';
  return { bytes: Buffer.from(arrayBuffer), contentType };
}

/** Downloads one page's full-resolution image - server-side only, never hotlinked to students (see package README/docs). */
export async function fetchPageImage(page: BnfManifestPage): Promise<BnfFetchedAsset> {
  const asset = await fetchAsset(page.imageUrl);
  // Gallica's IIIF image service always serves JPEG for `native.jpg` requests
  // (confirmed live) - normalize a generic/missing content-type rather than
  // trust it blindly, since this bypasses storage.ts's normal client-supplied
  // contentType check.
  return asset.contentType.startsWith('image/') ? asset : { ...asset, contentType: 'image/jpeg' };
}

/** Downloads one page/track's digitized audio file - server-side only. */
export async function fetchPageAudio(page: BnfManifestPage): Promise<BnfFetchedAsset> {
  const asset = await fetchAsset(page.audioUrl);
  return asset.contentType.startsWith('audio/') ? asset : { ...asset, contentType: 'audio/mpeg' };
}
