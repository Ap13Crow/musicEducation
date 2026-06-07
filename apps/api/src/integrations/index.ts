/**
 * Integration layer — owns all external-system communication.
 *
 * Re-exports adapters, webhook handlers, provisioning and sync utilities
 * so the rest of the API can import from `./integrations/index.js`.
 */

// Adapter interfaces & types
export * from './types/index.js';

// Concrete adapters
export { LibreBookingAdapter } from './adapters/librebooking.js';
export { PretixAdapter } from './adapters/pretix.js';
export { MoodleAdapter } from './adapters/moodle.js';

// Webhook handlers
export { createPretixWebhookHandler } from './webhooks/pretix-webhook.js';
export { createLibreBookingWebhookHandler } from './webhooks/librebooking-webhook.js';

// Provisioning
export { provisionUser } from './provisioning/user-provisioning.js';

// Sync jobs
export { provisionEventToPretix, syncPretixOrders } from './sync/event-sync.js';
