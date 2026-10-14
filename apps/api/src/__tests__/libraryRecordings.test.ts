import { canUseInTeaching, cleanLabels, rightsLabels, requireRecordingOwner } from '../lib/libraryRecordings';
import { libraryRecordingResolvers as r } from '../resolvers/libraryRecordings';

const teacher = { id: 'teacher-1', role: 'TEACHER' };
const otherTeacher = { id: 'teacher-2', role: 'TEACHER' };
const admin = { id: 'admin-1', role: 'ADMIN' };
const student = { id: 'student-1', role: 'STUDENT' };

const ownUpload = { source: 'UPLOAD', uploadedById: 'teacher-1' };
const otherUpload = { source: 'UPLOAD', uploadedById: 'teacher-2' };
const open78 = { source: 'INTERNET_ARCHIVE', uploadedById: null };

describe('who may use a recording in teaching', () => {
  it('lets admins use every recording', () => {
    expect([ownUpload, otherUpload, open78].every((item) => canUseInTeaching(admin, item))).toBe(true);
  });

  it('lets a teacher use the open Library and only their own uploads', () => {
    expect(canUseInTeaching(teacher, ownUpload)).toBe(true);
    expect(canUseInTeaching(teacher, open78)).toBe(true);
    expect(canUseInTeaching(teacher, otherUpload)).toBe(false);
  });

  it('never lets students or visitors', () => {
    expect(canUseInTeaching(student, open78)).toBe(false);
    expect(canUseInTeaching(null, open78)).toBe(false);
  });

  it('lets only the uploader or an admin edit an upload', () => {
    expect(() => requireRecordingOwner(teacher, ownUpload)).not.toThrow();
    expect(() => requireRecordingOwner(admin, otherUpload)).not.toThrow();
    expect(() => requireRecordingOwner(otherTeacher, ownUpload)).toThrow('Only the teacher');
    expect(() => requireRecordingOwner(admin, open78 as any)).toThrow('not found');
  });
});

describe('recording labels', () => {
  it('requires work, composer and performers and cleans the rest', () => {
    const labels = cleanLabels({
      title: '  Nocturne   op. 9 no. 2 ',
      composer: 'Chopin',
      performers: 'Anna Muster, piano',
      date: '',
      instruments: ['Piano', 'Piano', ' '],
      skillLevels: ['ADVANCED'],
    });
    expect(labels).toMatchObject({
      title: 'Nocturne op. 9 no. 2',
      creator: 'Chopin',
      performers: 'Anna Muster, piano',
      documentType: 'Performed by Anna Muster, piano',
      date: null,
      instruments: ['Piano'],
      skillLevels: ['ADVANCED'],
    });
    expect(() => cleanLabels({ title: 'x', composer: 'y', performers: ' ' })).toThrow('performers');
    expect(() => cleanLabels({ title: 'x', composer: 'y', performers: 'z', skillLevels: ['GURU'] })).toThrow('level');
  });

  it('credits the rights holder while under copyright', () => {
    expect(rightsLabels('PROTECTED', 'Anna Muster', '2024-05-12')).toEqual({
      license: 'All rights reserved - used by mymusic.coach with permission',
      attribution: '© 2024 Anna Muster',
    });
    expect(rightsLabels('PUBLIC_DOMAIN', null, null).license).toBe('Public Domain');
  });
});

describe('event recordings', () => {
  function fakePrisma(item: any) {
    return {
      event: { findUnique: jest.fn(async () => ({ id: 'e1', publisherId: 'teacher-1' })) },
      libraryItem: { findUnique: jest.fn(async () => ({ id: 'i1', category: 'AUDIO_RECORDING', hiddenAt: null, ...item })) },
      eventRecording: {
        findUnique: jest.fn(async () => null),
        count: jest.fn(async () => 0),
        create: jest.fn(async ({ data }: any) => ({ id: 'r1', ...data })),
      },
    } as any;
  }

  it('presents a teacher’s own upload on their event', async () => {
    const prisma = fakePrisma(ownUpload);
    await r.Mutation.addEventRecording(null, { eventId: 'e1', itemId: 'i1' }, { prisma, user: teacher } as any);
    expect(prisma.eventRecording.create).toHaveBeenCalledWith(expect.objectContaining({ data: { eventId: 'e1', itemId: 'i1', order: 0 } }));
  });

  it('refuses another teacher’s upload, and another teacher’s event', async () => {
    await expect(r.Mutation.addEventRecording(null, { eventId: 'e1', itemId: 'i1' }, { prisma: fakePrisma(otherUpload), user: teacher } as any)).rejects.toThrow('another teacher');
    await expect(r.Mutation.addEventRecording(null, { eventId: 'e1', itemId: 'i1' }, { prisma: fakePrisma(otherUpload), user: otherTeacher } as any)).rejects.toThrow('Access denied');
  });

  it('lets an admin present any recording on any event', async () => {
    const prisma = fakePrisma(otherUpload);
    await r.Mutation.addEventRecording(null, { eventId: 'e1', itemId: 'i1' }, { prisma, user: admin } as any);
    expect(prisma.eventRecording.create).toHaveBeenCalled();
  });

  it('shows the rights grant only to the uploader and admins', () => {
    const item = { rightsGrant: '[2026-10-14] I confirm…', uploadedById: 'teacher-1' };
    expect(r.LibraryItem.rightsGrant(item, null, { user: teacher } as any)).toBe(item.rightsGrant);
    expect(r.LibraryItem.rightsGrant(item, null, { user: admin } as any)).toBe(item.rightsGrant);
    expect(r.LibraryItem.rightsGrant(item, null, { user: otherTeacher } as any)).toBeNull();
    expect(r.LibraryItem.rightsGrant(item, null, { user: null } as any)).toBeNull();
  });
});
