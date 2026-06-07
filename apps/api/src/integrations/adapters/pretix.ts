import axios, { type AxiosInstance } from 'axios';
import type {
  EventCoreAdapter,
  EventOrganiser,
  EventDefinition,
  EventProduct,
  EventOrder,
  EventOrderPosition,
  CheckInResult,
} from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * pretix event-ticketing adapter.
 *
 * Wraps the pretix REST API to manage organisers, events, products,
 * orders and check-in from the musicEducation platform.
 */
export class PretixAdapter implements EventCoreAdapter {
  readonly key = 'pretix';
  private client: AxiosInstance;

  constructor(baseUrl: string, apiToken: string) {
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        Authorization: `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── Organisers ──────────────────────────────────────────────

  async createOrganiser(name: string, slug: string): Promise<EventOrganiser> {
    const res = await this.client.post('/organizers/', { name, slug });
    return { slug: res.data.slug, name: res.data.name };
  }

  // ── Events ─────────────────────────────────────────────────

  async createEvent(params: {
    organiserSlug: string;
    name: string;
    slug: string;
    dateFrom: Date;
    dateTo?: Date;
    isPublic?: boolean;
    currency?: string;
    locale?: string;
  }): Promise<EventDefinition> {
    const locale = params.locale ?? 'en';
    const res = await this.client.post(
      `/organizers/${params.organiserSlug}/events/`,
      {
        name: { [locale]: params.name },
        slug: params.slug,
        date_from: params.dateFrom.toISOString(),
        date_to: params.dateTo?.toISOString() ?? null,
        is_public: params.isPublic ?? true,
        currency: params.currency ?? 'CHF',
        locale,
        locales: [locale],
      },
    );

    logger.info({ slug: res.data.slug }, 'pretix: event created');
    return this.mapEvent(res.data, params.organiserSlug);
  }

  async getEvent(organiserSlug: string, eventSlug: string): Promise<EventDefinition | null> {
    try {
      const res = await this.client.get(
        `/organizers/${organiserSlug}/events/${eventSlug}/`,
      );
      return this.mapEvent(res.data, organiserSlug);
    } catch {
      return null;
    }
  }

  async listEvents(organiserSlug: string): Promise<EventDefinition[]> {
    const res = await this.client.get(
      `/organizers/${organiserSlug}/events/`,
    );
    return (res.data.results ?? []).map((e: Record<string, unknown>) =>
      this.mapEvent(e, organiserSlug),
    );
  }

  // ── Products & Quotas ──────────────────────────────────────

  async createProduct(params: {
    organiserSlug: string;
    eventSlug: string;
    name: string;
    price: string;
    currency: string;
    quota?: number;
  }): Promise<EventProduct> {
    const locale = 'en';
    const itemRes = await this.client.post(
      `/organizers/${params.organiserSlug}/events/${params.eventSlug}/items/`,
      {
        name: { [locale]: params.name },
        default_price: params.price,
        tax_rule: null,
      },
    );

    const itemId: number = itemRes.data.id;

    // Create a quota for this product if specified
    if (params.quota != null) {
      await this.client.post(
        `/organizers/${params.organiserSlug}/events/${params.eventSlug}/quotas/`,
        {
          name: `${params.name} quota`,
          size: params.quota,
          items: [itemId],
        },
      );
    }

    return {
      externalId: itemId,
      name: params.name,
      price: params.price,
      currency: params.currency,
      available: params.quota ?? null,
    };
  }

  // ── Orders ─────────────────────────────────────────────────

  async getOrder(
    organiserSlug: string,
    eventSlug: string,
    code: string,
  ): Promise<EventOrder | null> {
    try {
      const res = await this.client.get(
        `/organizers/${organiserSlug}/events/${eventSlug}/orders/${code}/`,
      );
      return this.mapOrder(res.data);
    } catch {
      return null;
    }
  }

  async listOrders(organiserSlug: string, eventSlug: string): Promise<EventOrder[]> {
    const res = await this.client.get(
      `/organizers/${organiserSlug}/events/${eventSlug}/orders/`,
    );
    return (res.data.results ?? []).map((o: Record<string, unknown>) =>
      this.mapOrder(o),
    );
  }

  // ── Check-in ───────────────────────────────────────────────

  async checkIn(
    organiserSlug: string,
    eventSlug: string,
    secret: string,
  ): Promise<CheckInResult> {
    // Use the first check-in list available
    const listsRes = await this.client.get(
      `/organizers/${organiserSlug}/events/${eventSlug}/checkinlists/`,
    );
    const listId = listsRes.data.results?.[0]?.id;
    if (!listId) {
      return { ok: false, position: 0, type: 'entry', errorReason: 'No check-in list configured' };
    }

    try {
      const res = await this.client.post(
        `/organizers/${organiserSlug}/events/${eventSlug}/checkinlists/${listId}/positions/${secret}/redeem/`,
        { type: 'entry' },
      );
      return {
        ok: res.data.status === 'ok',
        position: Number(secret),
        type: 'entry',
        errorReason: res.data.status !== 'ok' ? res.data.reason : undefined,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown check-in error';
      return { ok: false, position: 0, type: 'entry', errorReason: message };
    }
  }

  // ── Private mapping helpers ────────────────────────────────

  private mapEvent(data: Record<string, unknown>, _organiserSlug: string): EventDefinition {
    const name = data.name as Record<string, string>;
    return {
      externalId: String(data.slug),
      slug: String(data.slug),
      name: Object.values(name)[0] ?? '',
      dateFrom: new Date(data.date_from as string),
      dateTo: data.date_to ? new Date(data.date_to as string) : null,
      isPublic: Boolean(data.is_public),
      products: [],
    };
  }

  private mapOrder(data: Record<string, unknown>): EventOrder {
    const positions = (data.positions as Array<Record<string, unknown>>) ?? [];
    return {
      code: String(data.code),
      status: this.mapOrderStatus(String(data.status)),
      email: String(data.email),
      total: String(data.total),
      currency: String((data as Record<string, string>).currency ?? 'CHF'),
      positions: positions.map((p) => ({
        id: Number(p.id),
        item: Number(p.item),
        attendeeName: (p.attendee_name as string) ?? null,
        checkedIn: Boolean((p.checkins as unknown[])?.length),
      })),
    };
  }

  private mapOrderStatus(status: string): EventOrder['status'] {
    const map: Record<string, EventOrder['status']> = {
      n: 'pending',
      p: 'paid',
      c: 'cancelled',
      e: 'refunded', // expired → treat as refunded
    };
    return map[status] ?? 'pending';
  }
}
