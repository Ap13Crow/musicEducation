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
import { graphql, isObjectType } from 'graphql';
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

// Phase 8 release-readiness audit: a Query/Mutation field declared in the
// SDL with no matching entry in the merged resolver map falls back to the
// same "read a same-named property off an empty root value" trap described
// above - it just hasn't been hit by a real query yet. Caught
// Query.reviews exactly this way (declared `ReviewConnection!`, no
// resolver at all, invisible because the current frontend only ever reads
// the nested Course.reviews/Event.reviews fields instead). This test
// fails loudly the moment a future schema.graphql edit outruns its
// resolver, rather than waiting for a client to discover it.
describe('every root Query/Mutation field has a matching resolver', () => {
  it('has no field in the SDL without a resolver function, and no resolver for a field the SDL no longer declares', () => {
    const missing: string[] = [];
    const orphaned: string[] = [];

    for (const typeName of ['Query', 'Mutation'] as const) {
      const type = schema.getType(typeName);
      const sdlFields = type && isObjectType(type) ? type.getFields() : {};
      const resolverMap = (resolvers as any)[typeName] ?? {};

      for (const fieldName of Object.keys(sdlFields)) {
        if (typeof resolverMap[fieldName] !== 'function') missing.push(`${typeName}.${fieldName}`);
      }
      for (const fieldName of Object.keys(resolverMap)) {
        if (!(fieldName in sdlFields)) orphaned.push(`${typeName}.${fieldName}`);
      }
    }

    expect(missing).toEqual([]);
    expect(orphaned).toEqual([]);
  });
});
