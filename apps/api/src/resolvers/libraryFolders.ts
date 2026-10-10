import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { SHORT_ID_PATTERN, libraryFolderShareUrl } from '../lib/libraryLinks.js';
import type { GraphQLContext } from '../types.js';

// Favorites and nested folders for the Library - every signed-in role keeps
// its own; only an ADMIN may publish a folder (read-only, /f/<shortId>).
// Folder ids from the client are always re-checked against ownerId, so one
// user can never read or change another user's folder by guessing an id.

export const MAX_FOLDER_NAME_LENGTH = 80;
export const MAX_FOLDERS_PER_USER = 500;
export const MAX_FOLDER_DEPTH = 8;
const MAX_STATE_ITEMS = 200;

type FolderRow = { id: string; shortId: string; ownerId: string; parentId: string | null; name: string; isPublic: boolean; createdAt: Date };

function badInput(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

function notFound(): GraphQLError {
  return new GraphQLError('Folder not found.', { extensions: { code: 'NOT_FOUND' } });
}

function cleanName(name: string): string {
  const trimmed = (name ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) throw badInput('A folder needs a name.');
  if (trimmed.length > MAX_FOLDER_NAME_LENGTH) throw badInput(`Folder names can be at most ${MAX_FOLDER_NAME_LENGTH} characters.`);
  return trimmed;
}

function pageArgs(page?: number | null, limit?: number | null) {
  const safeLimit = Math.max(1, Math.min(limit ?? 24, 100));
  const safePage = Math.max(1, page ?? 1);
  return { skip: (safePage - 1) * safeLimit, take: safeLimit, page: safePage };
}

async function ownFolder(prisma: GraphQLContext['prisma'], userId: string, id: string): Promise<FolderRow> {
  const folder = await prisma.libraryFolder.findUnique({ where: { id } });
  if (!folder || folder.ownerId !== userId) throw notFound();
  return folder;
}

// Depth of a folder counted from the top level (a top-level folder is 1).
async function folderDepth(prisma: GraphQLContext['prisma'], id: string): Promise<number> {
  let depth = 0;
  let current: string | null = id;
  while (current && depth <= MAX_FOLDER_DEPTH + 1) {
    const row: { parentId: string | null } | null = await prisma.libraryFolder.findUnique({ where: { id: current }, select: { parentId: true } });
    if (!row) break;
    depth += 1;
    current = row.parentId;
  }
  return depth;
}

// Height of the subtree under a folder (the folder alone is 1) - from the
// owner's full folder list, already loaded for the cycle check.
function subtreeHeight(folders: Pick<FolderRow, 'id' | 'parentId'>[], id: string): number {
  const children = folders.filter((folder) => folder.parentId === id);
  return 1 + Math.max(0, ...children.map((child) => subtreeHeight(folders, child.id)));
}

function isInSubtree(folders: Pick<FolderRow, 'id' | 'parentId'>[], rootId: string, candidateId: string): boolean {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  let current: string | null | undefined = candidateId;
  for (let guard = 0; current && guard < 1000; guard += 1) {
    if (current === rootId) return true;
    current = byId.get(current)?.parentId;
  }
  return false;
}

async function itemState(prisma: GraphQLContext['prisma'], userId: string, itemId: string) {
  const [favorite, entries] = await Promise.all([
    prisma.libraryFavorite.findUnique({ where: { userId_itemId: { userId, itemId } } }),
    prisma.libraryFolderItem.findMany({ where: { itemId, folder: { ownerId: userId } }, select: { folderId: true } }),
  ]);
  return { itemId, isFavorite: Boolean(favorite), folderIds: entries.map((entry: { folderId: string }) => entry.folderId) };
}

async function requireVisibleItem(prisma: GraphQLContext['prisma'], itemId: string) {
  const item = await prisma.libraryItem.findUnique({ where: { id: itemId }, select: { hiddenAt: true } });
  if (!item || item.hiddenAt) throw new GraphQLError('Library item not found.', { extensions: { code: 'NOT_FOUND' } });
}

// A folder is publicly visible when it or any ancestor is public - publishing
// a folder publishes its whole subtree.
async function publicFolderByShortId(prisma: GraphQLContext['prisma'], shortId: string): Promise<FolderRow | null> {
  const folder = await prisma.libraryFolder.findUnique({ where: { shortId } });
  if (!folder) return null;
  let current: FolderRow | null = folder;
  for (let guard = 0; current && guard <= MAX_FOLDER_DEPTH + 1; guard += 1) {
    if (current.isPublic) return folder;
    current = current.parentId ? await prisma.libraryFolder.findUnique({ where: { id: current.parentId } }) : null;
  }
  return null;
}

// One page of items through a join table (favorites or folder entries).
type JoinDelegate = { findMany(args: any): Promise<any[]>; count(args: any): Promise<number> };

async function itemPage(delegate: JoinDelegate, where: any, orderBy: any, page?: number | null, limit?: number | null) {
  const { skip, take, page: safePage } = pageArgs(page, limit);
  const [rows, totalCount] = await Promise.all([
    delegate.findMany({ where, orderBy, skip, take, include: { item: true } }),
    delegate.count({ where }),
  ]);
  return {
    nodes: rows.map((row: { item: unknown }) => row.item),
    pageInfo: { hasNextPage: skip + rows.length < totalCount, hasPreviousPage: safePage > 1, totalCount },
  };
}

export const libraryFolderResolvers = {
  LibraryFolder: {
    shareUrl: (folder: FolderRow) => (folder.isPublic ? libraryFolderShareUrl(folder.shortId) : null),
    itemCount: (folder: FolderRow & { _count?: { items: number } }, _: unknown, { prisma }: GraphQLContext) =>
      folder._count?.items ?? prisma.libraryFolderItem.count({ where: { folderId: folder.id, item: { hiddenAt: null } } }),
  },

  Query: {
    async myLibraryFolders(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.libraryFolder.findMany({
        where: { ownerId: user.id },
        orderBy: [{ name: 'asc' }],
        include: { _count: { select: { items: { where: { item: { hiddenAt: null } } } } } },
      });
    },

    async myLibraryFavorites(_: unknown, { page, limit }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return itemPage(prisma.libraryFavorite, { userId: user.id, item: { hiddenAt: null } }, { createdAt: 'desc' }, page, limit);
    },

    async myLibraryFolderItems(_: unknown, { folderId, page, limit }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await ownFolder(prisma, user.id, folderId);
      return itemPage(prisma.libraryFolderItem, { folderId, item: { hiddenAt: null } }, { addedAt: 'desc' }, page, limit);
    },

    async myLibraryItemStates(_: unknown, { itemIds }: { itemIds: string[] }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const ids = Array.from(new Set(itemIds)).slice(0, MAX_STATE_ITEMS);
      if (ids.length === 0) return [];
      const [favorites, entries] = await Promise.all([
        prisma.libraryFavorite.findMany({ where: { userId: user.id, itemId: { in: ids } }, select: { itemId: true } }),
        prisma.libraryFolderItem.findMany({ where: { itemId: { in: ids }, folder: { ownerId: user.id } }, select: { itemId: true, folderId: true } }),
      ]);
      const favoriteIds = new Set(favorites.map((favorite: { itemId: string }) => favorite.itemId));
      return ids.map((itemId) => ({
        itemId,
        isFavorite: favoriteIds.has(itemId),
        folderIds: entries.filter((entry: { itemId: string }) => entry.itemId === itemId).map((entry: { folderId: string }) => entry.folderId),
      }));
    },

    async publicLibraryFolder(_: unknown, { shortId }: { shortId: string }, { prisma }: GraphQLContext) {
      if (!SHORT_ID_PATTERN.test(shortId)) return null;
      const folder = await publicFolderByShortId(prisma, shortId);
      if (!folder) return null;
      const [children, entries] = await Promise.all([
        prisma.libraryFolder.findMany({
          where: { parentId: folder.id },
          orderBy: { name: 'asc' },
          include: { _count: { select: { items: { where: { item: { hiddenAt: null } } } } } },
        }),
        prisma.libraryFolderItem.findMany({ where: { folderId: folder.id, item: { hiddenAt: null } }, orderBy: { addedAt: 'desc' }, take: 500, include: { item: true } }),
      ]);
      return {
        shortId: folder.shortId,
        name: folder.name,
        shareUrl: libraryFolderShareUrl(folder.shortId),
        subfolders: children.map((child: FolderRow & { _count: { items: number } }) => ({ shortId: child.shortId, name: child.name, itemCount: child._count.items })),
        items: entries.map((entry: { item: unknown }) => entry.item),
      };
    },
  },

  Mutation: {
    async setLibraryFavorite(_: unknown, { itemId, favorite }: { itemId: string; favorite: boolean }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      if (favorite) {
        await requireVisibleItem(prisma, itemId);
        await prisma.libraryFavorite.upsert({
          where: { userId_itemId: { userId: user.id, itemId } },
          create: { userId: user.id, itemId },
          update: {},
        });
      } else {
        await prisma.libraryFavorite.deleteMany({ where: { userId: user.id, itemId } });
      }
      return itemState(prisma, user.id, itemId);
    },

    async createLibraryFolder(_: unknown, { name, parentId }: { name: string; parentId?: string | null }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const folderName = cleanName(name);
      if (parentId) {
        await ownFolder(prisma, user.id, parentId);
        if ((await folderDepth(prisma, parentId)) >= MAX_FOLDER_DEPTH) throw badInput(`Folders can be nested at most ${MAX_FOLDER_DEPTH} levels deep.`);
      }
      if ((await prisma.libraryFolder.count({ where: { ownerId: user.id } })) >= MAX_FOLDERS_PER_USER) {
        throw badInput(`You can have at most ${MAX_FOLDERS_PER_USER} folders.`);
      }
      return prisma.libraryFolder.create({ data: { ownerId: user.id, parentId: parentId ?? null, name: folderName } });
    },

    async renameLibraryFolder(_: unknown, { id, name }: { id: string; name: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await ownFolder(prisma, user.id, id);
      return prisma.libraryFolder.update({ where: { id }, data: { name: cleanName(name) } });
    },

    async moveLibraryFolder(_: unknown, { id, parentId }: { id: string; parentId?: string | null }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await ownFolder(prisma, user.id, id);
      if (parentId) {
        await ownFolder(prisma, user.id, parentId);
        const folders = await prisma.libraryFolder.findMany({ where: { ownerId: user.id }, select: { id: true, parentId: true } });
        if (isInSubtree(folders, id, parentId)) throw badInput('A folder cannot be moved into itself or one of its subfolders.');
        if ((await folderDepth(prisma, parentId)) + subtreeHeight(folders, id) > MAX_FOLDER_DEPTH) {
          throw badInput(`Folders can be nested at most ${MAX_FOLDER_DEPTH} levels deep.`);
        }
      }
      return prisma.libraryFolder.update({ where: { id }, data: { parentId: parentId ?? null } });
    },

    async deleteLibraryFolder(_: unknown, { id }: { id: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await ownFolder(prisma, user.id, id);
      // Subfolders and entries go with it (ON DELETE CASCADE); items stay.
      await prisma.libraryFolder.delete({ where: { id } });
      return true;
    },

    async setLibraryItemInFolder(_: unknown, { folderId, itemId, included }: { folderId: string; itemId: string; included: boolean }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await ownFolder(prisma, user.id, folderId);
      if (included) {
        await requireVisibleItem(prisma, itemId);
        await prisma.libraryFolderItem.upsert({
          where: { folderId_itemId: { folderId, itemId } },
          create: { folderId, itemId },
          update: {},
        });
      } else {
        await prisma.libraryFolderItem.deleteMany({ where: { folderId, itemId } });
      }
      return itemState(prisma, user.id, itemId);
    },

    async setLibraryFolderPublic(_: unknown, { id, isPublic }: { id: string; isPublic: boolean }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      await ownFolder(prisma, user!.id, id);
      return prisma.libraryFolder.update({ where: { id }, data: { isPublic } });
    },
  },
};
