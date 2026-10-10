import { createRequire } from 'node:module';
const { PrismaClient } = createRequire('/app/apps/api/package.json')('@prisma/client');
const prisma = new PrismaClient();
for (const id of (process.env.IDS || '').split(',')) {
  const i = await prisma.libraryItem.findUnique({ where: { id }, select: { id: true, title: true, creator: true, date: true, description: true, mirroredAt: true, documentType: true } });
  console.log(JSON.stringify(i).slice(0, 600));
}
await prisma.$disconnect();
