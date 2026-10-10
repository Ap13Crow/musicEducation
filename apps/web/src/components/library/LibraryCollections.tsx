'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useSession } from 'next-auth/react';

// Signed-in user's Library favorites and nested folders, shared by the
// sidebar, the cards' star / "add to folder" menus and the item page.

export type LibraryFolder = {
  id: string;
  shortId: string;
  name: string;
  parentId: string | null;
  isPublic: boolean;
  shareUrl: string | null;
  itemCount: number;
};

export type ItemState = { itemId: string; isFavorite: boolean; folderIds: string[] };

const FOLDER_FIELDS = 'id shortId name parentId isPublic shareUrl itemCount';

const MY_FOLDERS = gql`
  query MyLibraryFolders { myLibraryFolders { ${FOLDER_FIELDS} } }
`;
const ITEM_STATES = gql`
  query MyLibraryItemStates($itemIds: [ID!]!) { myLibraryItemStates(itemIds: $itemIds) { itemId isFavorite folderIds } }
`;
const SET_FAVORITE = gql`
  mutation SetLibraryFavorite($itemId: ID!, $favorite: Boolean!) {
    setLibraryFavorite(itemId: $itemId, favorite: $favorite) { itemId isFavorite folderIds }
  }
`;
const SET_IN_FOLDER = gql`
  mutation SetLibraryItemInFolder($folderId: ID!, $itemId: ID!, $included: Boolean!) {
    setLibraryItemInFolder(folderId: $folderId, itemId: $itemId, included: $included) { itemId isFavorite folderIds }
  }
`;
const CREATE_FOLDER = gql`
  mutation CreateLibraryFolder($name: String!, $parentId: ID) { createLibraryFolder(name: $name, parentId: $parentId) { ${FOLDER_FIELDS} } }
`;
const RENAME_FOLDER = gql`
  mutation RenameLibraryFolder($id: ID!, $name: String!) { renameLibraryFolder(id: $id, name: $name) { ${FOLDER_FIELDS} } }
`;
const MOVE_FOLDER = gql`
  mutation MoveLibraryFolder($id: ID!, $parentId: ID) { moveLibraryFolder(id: $id, parentId: $parentId) { ${FOLDER_FIELDS} } }
`;
const DELETE_FOLDER = gql`
  mutation DeleteLibraryFolder($id: ID!) { deleteLibraryFolder(id: $id) }
`;
const SET_PUBLIC = gql`
  mutation SetLibraryFolderPublic($id: ID!, $isPublic: Boolean!) { setLibraryFolderPublic(id: $id, isPublic: $isPublic) { ${FOLDER_FIELDS} } }
`;

type CollectionsValue = {
  signedIn: boolean;
  folders: LibraryFolder[];
  states: Record<string, ItemState>;
  loadStates(itemIds: string[]): void;
  toggleFavorite(itemId: string): Promise<void>;
  toggleInFolder(folderId: string, itemId: string): Promise<void>;
  addToFolder(folderId: string, itemId: string): Promise<void>;
  createFolder(name: string, parentId?: string | null): Promise<LibraryFolder | null>;
  renameFolder(id: string, name: string): Promise<void>;
  moveFolder(id: string, parentId: string | null): Promise<void>;
  deleteFolder(id: string): Promise<void>;
  setFolderPublic(id: string, isPublic: boolean): Promise<void>;
  favoritesVersion: number;
  error: string | null;
  clearError(): void;
};

const CollectionsContext = createContext<CollectionsValue | null>(null);

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message.replace(/^[A-Z_]+: /, '') : 'Something went wrong.';
}

export function LibraryCollectionsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const client = useApolloClient();
  const { data, refetch } = useQuery(MY_FOLDERS, { skip: !signedIn, fetchPolicy: 'cache-and-network' });
  const [states, setStates] = useState<Record<string, ItemState>>({});
  // Bumped on every star change so the Favorites view refetches its list.
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [setFavoriteMutation] = useMutation(SET_FAVORITE);
  const [setInFolderMutation] = useMutation(SET_IN_FOLDER);
  const [createMutation] = useMutation(CREATE_FOLDER);
  const [renameMutation] = useMutation(RENAME_FOLDER);
  const [moveMutation] = useMutation(MOVE_FOLDER);
  const [deleteMutation] = useMutation(DELETE_FOLDER);
  const [publicMutation] = useMutation(SET_PUBLIC);

  const folders: LibraryFolder[] = data?.myLibraryFolders ?? [];

  const storeState = useCallback((state: ItemState) => setStates((current) => ({ ...current, [state.itemId]: state })), []);

  const loadStates = useCallback(
    (itemIds: string[]) => {
      if (!signedIn || itemIds.length === 0) return;
      client
        .query({ query: ITEM_STATES, variables: { itemIds }, fetchPolicy: 'network-only' })
        .then(({ data: result }) => {
          setStates((current) => {
            const next = { ...current };
            for (const state of result?.myLibraryItemStates ?? []) next[state.itemId] = state;
            return next;
          });
        })
        .catch(() => undefined);
    },
    [client, signedIn],
  );

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
    try {
      setError(null);
      return await action();
    } catch (caught) {
      setError(messageOf(caught));
      return null;
    }
  }, []);

  const value = useMemo<CollectionsValue>(
    () => ({
      signedIn,
      folders,
      states,
      loadStates,
      favoritesVersion,
      error,
      clearError: () => setError(null),
      async toggleFavorite(itemId) {
        const favorite = !states[itemId]?.isFavorite;
        // Optimistic: the star flips immediately, the server answer settles it.
        storeState({ itemId, folderIds: states[itemId]?.folderIds ?? [], isFavorite: favorite });
        const result = await run(() => setFavoriteMutation({ variables: { itemId, favorite } }));
        if (result?.data) storeState(result.data.setLibraryFavorite);
        else storeState({ itemId, folderIds: states[itemId]?.folderIds ?? [], isFavorite: !favorite });
        setFavoritesVersion((version) => version + 1);
      },
      async toggleInFolder(folderId, itemId) {
        const included = !(states[itemId]?.folderIds ?? []).includes(folderId);
        const result = await run(() => setInFolderMutation({ variables: { folderId, itemId, included } }));
        if (result?.data) storeState(result.data.setLibraryItemInFolder);
        await refetch();
      },
      async addToFolder(folderId, itemId) {
        const result = await run(() => setInFolderMutation({ variables: { folderId, itemId, included: true } }));
        if (result?.data) storeState(result.data.setLibraryItemInFolder);
        await refetch();
      },
      async createFolder(name, parentId) {
        const result = await run(() => createMutation({ variables: { name, parentId: parentId ?? null } }));
        await refetch();
        return result?.data?.createLibraryFolder ?? null;
      },
      async renameFolder(id, name) {
        await run(() => renameMutation({ variables: { id, name } }));
        await refetch();
      },
      async moveFolder(id, parentId) {
        await run(() => moveMutation({ variables: { id, parentId } }));
        await refetch();
      },
      async deleteFolder(id) {
        await run(() => deleteMutation({ variables: { id } }));
        await refetch();
      },
      async setFolderPublic(id, isPublic) {
        await run(() => publicMutation({ variables: { id, isPublic } }));
        await refetch();
      },
    }),
    [signedIn, folders, states, loadStates, favoritesVersion, error, storeState, run, refetch,
      setFavoriteMutation, setInFolderMutation, createMutation, renameMutation, moveMutation, deleteMutation, publicMutation],
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useLibraryCollections(): CollectionsValue {
  const value = useContext(CollectionsContext);
  if (!value) throw new Error('useLibraryCollections must be used inside LibraryCollectionsProvider');
  return value;
}

// Loads the star/folder state for the items currently on screen.
export function useItemStates(itemIds: string[]) {
  const { loadStates, signedIn } = useLibraryCollections();
  const key = itemIds.join(',');
  useEffect(() => {
    if (signedIn && key) loadStates(key.split(','));
  }, [key, signedIn, loadStates]);
}

// Folder tree helpers - the API returns a flat, name-sorted list.
export function childFolders(folders: LibraryFolder[], parentId: string | null): LibraryFolder[] {
  return folders.filter((folder) => folder.parentId === parentId);
}

export function folderPath(folders: LibraryFolder[], id: string | null): LibraryFolder[] {
  const path: LibraryFolder[] = [];
  let current = folders.find((folder) => folder.id === id);
  for (let guard = 0; current && guard < 20; guard += 1) {
    path.unshift(current);
    current = folders.find((folder) => folder.id === current!.parentId);
  }
  return path;
}

export function isDescendant(folders: LibraryFolder[], ancestorId: string, candidateId: string): boolean {
  return folderPath(folders, candidateId).some((folder) => folder.id === ancestorId);
}
