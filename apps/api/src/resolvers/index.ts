import { mergeResolvers } from '@graphql-tools/merge';
import { authResolvers } from './auth.js';
import { userResolvers } from './users.js';
import { courseResolvers } from './courses.js';
import { bookingResolvers } from './bookings.js';
import { eventResolvers } from './events.js';
import { paymentResolvers } from './payments.js';
import { assessmentResolvers } from './assessments.js';
import { feedResolvers } from './feed.js';
import { reviewResolvers } from './reviews.js';
import { recommendationResolvers } from './recommendations.js';
import { DateTimeResolver, JSONResolver } from 'graphql-scalars';

const scalarResolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Decimal: {
    serialize: (value: any) => value?.toString() ?? null,
    parseValue: (value: any) => parseFloat(value),
    parseLiteral: (ast: any) => parseFloat(ast.value),
  },
};

export const resolvers = mergeResolvers([
  { ...scalarResolvers },
  authResolvers,
  userResolvers,
  courseResolvers,
  bookingResolvers,
  eventResolvers,
  paymentResolvers,
  assessmentResolvers,
  feedResolvers,
  reviewResolvers,
  recommendationResolvers,
]);
