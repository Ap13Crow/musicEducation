import { NextRequest, NextResponse } from 'next/server';
import { APP_URL, serverGraphql } from '@/lib/serverGraphql';

const PERMALINK_FILES = `
  query LibraryPermalinkFiles($shortId: String!) {
    libraryPermalink(shortId: $shortId) { itemId available }
  }
`;
const ITEM_FILES = `
  query LibraryItemFiles($id: ID!) {
    libraryItem(id: $id) { files { url } }
  }
`;

// Permanent link to one file of an item (/l/<shortId>/<n>, 1-based) - sends
// the browser to wherever that file is served today; an unavailable item or
// file falls back to the item's own permanent page.
export async function GET(_req: NextRequest, { params }: { params: { shortId: string; n: string } }) {
  const itemPage = new URL(`/l/${encodeURIComponent(params.shortId)}`, APP_URL);
  const index = Number(params.n) - 1;
  const permalink = (
    await serverGraphql<{ libraryPermalink: { itemId: string; available: boolean } | null }>(PERMALINK_FILES, { shortId: params.shortId })
  )?.libraryPermalink;
  if (!permalink?.available || !Number.isInteger(index) || index < 0) return NextResponse.redirect(itemPage);

  const files = (await serverGraphql<{ libraryItem: { files: { url: string }[] } | null }>(ITEM_FILES, { id: permalink.itemId }))
    ?.libraryItem?.files;
  const file = files?.[index];
  if (!file) return NextResponse.redirect(itemPage);
  return NextResponse.redirect(new URL(file.url, APP_URL));
}
