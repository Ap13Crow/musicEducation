import { createRequire } from 'node:module';
const { PrismaClient } = createRequire('/app/apps/api/package.json')('@prisma/client');
const prisma = new PrismaClient();
const terms = (process.env.TERMS || '').split(',');
for (const t of terms) {
  const items = await prisma.libraryItem.findMany({
    where: { category: 'AUDIO_RECORDING', OR: [{ title: { contains: t, mode: 'insensitive' } }, { creator: { contains: t, mode: 'insensitive' } }] },
    select: { id: true, source: true, title: true, creator: true, date: true, mirroredAt: true }, take: 60,
  });
  console.log('==', t, items.length);
  for (const i of items) console.log(i.id, i.source, '|', i.title.slice(0, 70), '|', (i.creator || '').slice(0, 50), '|', i.date, '|', i.mirroredAt ? 'mirrored' : '');
}
await prisma.$disconnect();
