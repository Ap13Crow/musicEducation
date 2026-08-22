// Regression coverage for the reported defects:
//   "Cannot return null for non-nullable field Query.storageConfigured"
//   "Cannot return null for non-nullable field Query.teacherApplications"
//
// Root cause: apps/api/src/index.ts built its own, narrower mergeResolvers()
// call inline instead of importing the complete map from resolvers/index.ts,
// silently omitting uploadResolvers/teacherApplicationResolvers (and
// quizResolvers/xpResolvers/recommendationResolvers). A field with no
// resolver in the map falls back to reading a same-named property off the
// root value (always undefined here) - for a non-null schema field that
// produces exactly this error. These tests build the schema the same way
// index.ts now does (typeDefs + the resolvers/index.ts barrel) and execute
// real queries against it, so a future regression that re-narrows the
// resolver map fails here rather than only in a deployed environment.

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { readFileSync } from 'fs';
import { join } from 'path';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '../resolvers/index';

const typeDefs = readFileSync(
  join(__dirname, '../../../../packages/graphql-schema/src/schema.graphql'),
  'utf-8',
);
const schema = makeExecutableSchema({ typeDefs, resolvers });

function fakePrisma(overrides: Record<string, any> = {}) {
  return {
    teacherApplication: { findMany: jest.fn().mockResolvedValue([]) },
    ...overrides,
  } as any;
}

describe('index.ts wires the complete resolvers/index.ts map', () => {
  it('imports the same way this test builds the schema (guards against a future narrower inline mergeResolvers() in index.ts)', () => {
    const indexSource = readFileSync(join(__dirname, '../index.ts'), 'utf-8');
    expect(indexSource).toMatch(/import\s*\{\s*resolvers\s*\}\s*from\s*['"]\.\/resolvers\/index\.js['"]/);
  });

  it('Query.storageConfigured resolves to a real boolean, never null, for any caller including an unauthenticated one', async () => {
    const result = await graphql({
      schema,
      source: '{ storageConfigured }',
      contextValue: { prisma: fakePrisma(), user: null },
    });
    expect(result.errors).toBeUndefined();
    expect(typeof result.data?.storageConfigured).toBe('boolean');
  });

  it('Query.teacherApplications resolves to [] (not null) for an admin when none match', async () => {
    const result = await graphql({
      schema,
      source: '{ teacherApplications(status: PENDING) { id } }',
      contextValue: { prisma: fakePrisma(), user: { id: 'admin-1', role: 'ADMIN' } },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.teacherApplications).toEqual([]);
  });

  it('Query.teacherApplications still enforces ADMIN-only access (the fix must not have loosened authorization)', async () => {
    const result = await graphql({
      schema,
      source: '{ teacherApplications { id } }',
      contextValue: { prisma: fakePrisma(), user: { id: 'student-1', role: 'STUDENT' } },
    });
    expect(result.errors?.[0]?.message).toMatch(/FORBIDDEN/);
  });
});
