import type { Metadata } from 'next';
import { APP_URL, serverGraphql } from '@/lib/serverGraphql';
import { SOURCE_LABELS } from '../sources';
import LibraryItemView from './LibraryItemView';

const ITEM_META = `
  query LibraryItemMeta($id: ID!) {
    libraryItem(id: $id) { title creator date source shareUrl thumbnailUrl }
  }
`;

// Rich previews when a library link is shared (messengers, mail, social) -
// the page itself stays a client component.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await serverGraphql<{ libraryItem: any }>(ITEM_META, { id: params.id });
  const item = data?.libraryItem;
  if (!item) return { title: 'Library' };
  const description = [item.creator, item.date, SOURCE_LABELS[item.source]?.credit].filter(Boolean).join(' · ');
  const image = item.thumbnailUrl ? `${APP_URL}${item.thumbnailUrl}` : undefined;
  return {
    title: item.title,
    description,
    alternates: { canonical: item.shareUrl },
    openGraph: { title: item.title, description, url: item.shareUrl, siteName: 'My Music Coach', images: image ? [image] : undefined },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: item.title, description },
  };
}

export default function LibraryItemPage() {
  return <LibraryItemView />;
}
