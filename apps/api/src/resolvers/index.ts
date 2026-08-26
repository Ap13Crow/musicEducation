import { mergeResolvers } from '@graphql-tools/merge';
import { userResolvers } from './users.js';
import { courseResolvers } from './courses.js';
import { bookingResolvers } from './bookings.js';
import { eventResolvers } from './events.js';
import { discoveryResolvers } from './discovery.js';
import { paymentResolvers } from './payments.js';
import { assessmentResolvers } from './assessments.js';
import { feedResolvers } from './feed.js';
import { reviewResolvers } from './reviews.js';
import { adminResolvers } from './admin.js';
import { teacherApplicationResolvers } from './teacherApplications.js';
import { quizResolvers } from './quizzes.js';
import { xpResolvers } from './xp.js';
import { uploadResolvers } from './uploads.js';
import { commerceResolvers } from './commerce.js';
import { externalCalendarResolvers } from './externalCalendar.js';
import { DateTimeResolver, JSONResolver } from 'graphql-scalars';

// Only DateTime and JSON are actually declared as `scalar` in schema.graphql
// (see packages/graphql-schema/src/schema.graphql) - every money field uses
// plain Float, there is no `scalar Decimal`. A resolver map entry for a
// scalar the SDL doesn't declare is a hard makeExecutableSchema error
// ("Decimal" defined in resolvers, but not in schema), so this must stay in
// sync with the SDL rather than pre-declaring resolvers for scalars that
// might get added later.
const scalarResolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
};

export const resolvers = mergeResolvers([
  { ...scalarResolvers },
  userResolvers,
  courseResolvers,
  bookingResolvers,
  eventResolvers,
  discoveryResolvers,
  paymentResolvers,
  assessmentResolvers,
  feedResolvers,
  reviewResolvers,
  adminResolvers,
  teacherApplicationResolvers,
  quizResolvers,
  xpResolvers,
  uploadResolvers,
  commerceResolvers,
  externalCalendarResolvers,
]);
