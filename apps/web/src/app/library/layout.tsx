import { LibraryCollectionsProvider } from '@/components/library/LibraryCollections';

// Favorites and folders are shared by the Library list, the item page and
// the sidebar - one provider for the whole /library section.
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <LibraryCollectionsProvider>{children}</LibraryCollectionsProvider>;
}
