import { libraryFolderResolvers, MAX_FOLDER_DEPTH } from '../resolvers/libraryFolders';

const student = { id: 'student-1', role: 'STUDENT' } as const;
const otherStudent = { id: 'student-2', role: 'STUDENT' } as const;
const admin = { id: 'admin-1', role: 'ADMIN' } as const;

type Folder = { id: string; shortId: string; ownerId: string; parentId: string | null; name: string; isPublic: boolean; createdAt: Date };

// In-memory stand-in for the three Prisma delegates the resolvers use.
function fakePrisma(folders: Folder[], items: Record<string, { hiddenAt: Date | null }> = { i1: { hiddenAt: null } }) {
  const favorites: { userId: string; itemId: string }[] = [];
  const entries: { folderId: string; itemId: string }[] = [];
  const ownerOf = (folderId: string) => folders.find((folder) => folder.id === folderId)?.ownerId;
  return {
    favorites,
    entries,
    libraryItem: { findUnique: jest.fn(async ({ where }: any) => items[where.id] ?? null) },
    libraryFolder: {
      findUnique: jest.fn(async ({ where }: any) => folders.find((folder) => (where.id ? folder.id === where.id : folder.shortId === where.shortId)) ?? null),
      findMany: jest.fn(async ({ where }: any) =>
        folders.filter((folder) => (where.ownerId ? folder.ownerId === where.ownerId : true) && ('parentId' in where ? folder.parentId === where.parentId : true)),
      ),
      count: jest.fn(async ({ where }: any) => folders.filter((folder) => folder.ownerId === where.ownerId).length),
      create: jest.fn(async ({ data }: any) => {
        const folder = { id: `f${folders.length + 1}`, shortId: `short${folders.length + 1}`, isPublic: false, createdAt: new Date(), ...data };
        folders.push(folder);
        return folder;
      }),
      update: jest.fn(async ({ where, data }: any) => Object.assign(folders.find((folder) => folder.id === where.id)!, data)),
      delete: jest.fn(),
    },
    libraryFavorite: {
      upsert: jest.fn(async ({ create }: any) => favorites.push(create)),
      deleteMany: jest.fn(),
      findUnique: jest.fn(async ({ where }: any) =>
        favorites.find((favorite) => favorite.userId === where.userId_itemId.userId && favorite.itemId === where.userId_itemId.itemId) ?? null,
      ),
    },
    libraryFolderItem: {
      upsert: jest.fn(async ({ create }: any) => entries.push(create)),
      deleteMany: jest.fn(),
      findMany: jest.fn(async ({ where }: any) => entries.filter((entry) => entry.itemId === where.itemId && ownerOf(entry.folderId) === where.folder.ownerId)),
    },
  } as any;
}

function folder(id: string, parentId: string | null = null, ownerId: string = student.id, isPublic = false): Folder {
  return { id, shortId: `${id}short`, ownerId, parentId, name: id, isPublic, createdAt: new Date() };
}

const { Mutation, Query } = libraryFolderResolvers;

describe('Library folders', () => {
  it('requires a signed-in user', async () => {
    await expect(Mutation.createLibraryFolder(null, { name: 'Bach' }, { prisma: fakePrisma([]), user: null } as any)).rejects.toThrow('UNAUTHENTICATED');
  });

  it('creates a nested folder under the caller’s own folder, trimming the name', async () => {
    const prisma = fakePrisma([folder('root')]);
    const created = await Mutation.createLibraryFolder(null, { name: '  Bach   Partitas ', parentId: 'root' }, { prisma, user: student } as any);
    expect(created).toMatchObject({ ownerId: student.id, parentId: 'root', name: 'Bach Partitas' });
  });

  it('never touches another user’s folder', async () => {
    const prisma = fakePrisma([folder('root')]);
    await expect(Mutation.renameLibraryFolder(null, { id: 'root', name: 'x' }, { prisma, user: otherStudent } as any)).rejects.toThrow('Folder not found.');
    await expect(Mutation.createLibraryFolder(null, { name: 'x', parentId: 'root' }, { prisma, user: otherStudent } as any)).rejects.toThrow('Folder not found.');
    await expect(Query.myLibraryFolderItems(null, { folderId: 'root' }, { prisma, user: otherStudent } as any)).rejects.toThrow('Folder not found.');
  });

  it('rejects moving a folder into its own subtree', async () => {
    const prisma = fakePrisma([folder('a'), folder('b', 'a'), folder('c', 'b')]);
    await expect(Mutation.moveLibraryFolder(null, { id: 'a', parentId: 'c' }, { prisma, user: student } as any)).rejects.toThrow('into itself');
    await expect(Mutation.moveLibraryFolder(null, { id: 'a', parentId: 'a' }, { prisma, user: student } as any)).rejects.toThrow('into itself');
    await expect(Mutation.moveLibraryFolder(null, { id: 'c', parentId: null }, { prisma, user: student } as any)).resolves.toMatchObject({ parentId: null });
  });

  it('caps nesting depth', async () => {
    const chain = Array.from({ length: MAX_FOLDER_DEPTH }, (_, index) => folder(`d${index}`, index === 0 ? null : `d${index - 1}`));
    const prisma = fakePrisma(chain);
    await expect(
      Mutation.createLibraryFolder(null, { name: 'too deep', parentId: `d${MAX_FOLDER_DEPTH - 1}` }, { prisma, user: student } as any),
    ).rejects.toThrow('nested at most');
  });

  it('lets only an admin publish a folder', async () => {
    const prisma = fakePrisma([folder('s'), folder('a', null, admin.id)]);
    await expect(Mutation.setLibraryFolderPublic(null, { id: 's', isPublic: true }, { prisma, user: student } as any)).rejects.toThrow('FORBIDDEN');
    await expect(Mutation.setLibraryFolderPublic(null, { id: 'a', isPublic: true }, { prisma, user: admin } as any)).resolves.toMatchObject({ isPublic: true });
  });

  it('shows a subfolder of a public folder, but not a private folder', async () => {
    const prisma = fakePrisma([folder('pub', null, admin.id, true), folder('sub', 'pub', admin.id), folder('priv', null, admin.id)]);
    prisma.libraryFolder.findMany = jest.fn(async () => []);
    prisma.libraryFolderItem.findMany = jest.fn(async () => []);
    await expect(Query.publicLibraryFolder(null, { shortId: 'subshort' }, { prisma } as any)).resolves.toMatchObject({ name: 'sub' });
    await expect(Query.publicLibraryFolder(null, { shortId: 'privshort' }, { prisma } as any)).resolves.toBeNull();
  });

  it('stars and files an item, but refuses a hidden one', async () => {
    const prisma = fakePrisma([folder('root')], { i1: { hiddenAt: null }, gone: { hiddenAt: new Date() } });
    await expect(Mutation.setLibraryFavorite(null, { itemId: 'i1', favorite: true }, { prisma, user: student } as any)).resolves.toEqual({
      itemId: 'i1',
      isFavorite: true,
      folderIds: [],
    });
    await expect(
      Mutation.setLibraryItemInFolder(null, { folderId: 'root', itemId: 'i1', included: true }, { prisma, user: student } as any),
    ).resolves.toEqual({ itemId: 'i1', isFavorite: true, folderIds: ['root'] });
    await expect(Mutation.setLibraryFavorite(null, { itemId: 'gone', favorite: true }, { prisma, user: student } as any)).rejects.toThrow('not found');
  });
});
