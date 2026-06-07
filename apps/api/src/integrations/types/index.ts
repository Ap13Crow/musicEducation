// ─── External System Identity Mapping ───────────────────────────────────────

/** Identifiers that map a platform user to external systems. */
export interface ExternalUserIds {
  moodleUserId?: number;
  libreBookingUserId?: number;
  pretixCustomerId?: string;
}

/** Persisted mapping row stored alongside the platform User record. */
export interface ExternalIdentityRecord {
  userId: string;
  moodleUserId: number | null;
  libreBookingUserId: number | null;
  pretixCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Scheduling Adapter (replaces Calendly assumptions) ─────────────────────

export interface SchedulingSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface SchedulingBooking {
  externalId: string;
  resourceId: string;
  start: Date;
  end: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  metadata?: Record<string, unknown>;
}

export interface SchedulingAdapter {
  /** Unique adapter key, e.g. "librebooking" */
  readonly key: string;

  /** Fetch available slots for a resource in a date range. */
  getAvailability(
    resourceId: string,
    from: Date,
    to: Date,
  ): Promise<SchedulingSlot[]>;

  /** Create a booking in the external scheduling system. */
  createBooking(params: {
    resourceId: string;
    userId: string;
    start: Date;
    end: Date;
    notes?: string;
  }): Promise<SchedulingBooking>;

  /** Cancel an existing booking. */
  cancelBooking(externalId: string): Promise<void>;

  /** Get a single booking by external ID. */
  getBooking(externalId: string): Promise<SchedulingBooking | null>;
}

// ─── Event / Ticketing Adapter (pretix core) ────────────────────────────────

export interface EventOrganiser {
  slug: string;
  name: string;
}

export interface EventProduct {
  externalId: number;
  name: string;
  price: string;
  currency: string;
  available: number | null;
}

export interface EventDefinition {
  externalId: string;
  slug: string;
  name: string;
  dateFrom: Date;
  dateTo: Date | null;
  isPublic: boolean;
  products: EventProduct[];
}

export interface EventOrder {
  code: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  email: string;
  total: string;
  currency: string;
  positions: EventOrderPosition[];
}

export interface EventOrderPosition {
  id: number;
  item: number;
  attendeeName: string | null;
  checkedIn: boolean;
}

export interface CheckInResult {
  ok: boolean;
  position: number;
  type: 'entry' | 'exit';
  errorReason?: string;
}

export interface EventCoreAdapter {
  /** Unique adapter key, e.g. "pretix" */
  readonly key: string;

  // ── Organisers ──────────────────────────────────────────────
  createOrganiser(name: string, slug: string): Promise<EventOrganiser>;

  // ── Events ─────────────────────────────────────────────────
  createEvent(params: {
    organiserSlug: string;
    name: string;
    slug: string;
    dateFrom: Date;
    dateTo?: Date;
    isPublic?: boolean;
    currency?: string;
    locale?: string;
  }): Promise<EventDefinition>;

  getEvent(organiserSlug: string, eventSlug: string): Promise<EventDefinition | null>;
  listEvents(organiserSlug: string): Promise<EventDefinition[]>;

  // ── Products & Quotas ──────────────────────────────────────
  createProduct(params: {
    organiserSlug: string;
    eventSlug: string;
    name: string;
    price: string;
    currency: string;
    quota?: number;
  }): Promise<EventProduct>;

  // ── Orders ─────────────────────────────────────────────────
  getOrder(organiserSlug: string, eventSlug: string, code: string): Promise<EventOrder | null>;
  listOrders(organiserSlug: string, eventSlug: string): Promise<EventOrder[]>;

  // ── Check-in ───────────────────────────────────────────────
  checkIn(organiserSlug: string, eventSlug: string, secret: string): Promise<CheckInResult>;
}

// ─── Webhook Payloads ────────────────────────────────────────────────────────

export interface PretixWebhookPayload {
  notification_id: number;
  organizer: string;
  event: string;
  code?: string;
  action: string;
}

export interface LibreBookingWebhookPayload {
  event: string;
  reservationId?: number;
  userId?: number;
  resourceId?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Provisioning ────────────────────────────────────────────────────────────

export interface ProvisioningResult {
  system: string;
  externalId: string | number;
  success: boolean;
  error?: string;
}

export interface UserProvisioningParams {
  userId: string;
  email: string;
  displayName: string;
  role: string;
}
