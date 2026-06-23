import axios, { type AxiosInstance } from 'axios';
import type {
  SchedulingAdapter,
  SchedulingSlot,
  SchedulingBooking,
} from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * LibreBooking scheduling adapter.
 *
 * Communicates with the LibreBooking REST API to manage
 * room / resource reservations for in-person music lessons.
 */
export class LibreBookingAdapter implements SchedulingAdapter {
  readonly key = 'librebooking';
  private client: AxiosInstance;

  constructor(baseUrl: string, apiCredentials: { username: string; password: string }) {
    this.client = axios.create({
      baseURL: `${baseUrl}/Web/Services`,
      headers: { 'Content-Type': 'application/json' },
    });

    // Authenticate and attach session token
    this.authenticate(apiCredentials).catch((err) =>
      logger.error(err, 'LibreBooking: initial auth failed – will retry on next call'),
    );
  }

  // ── Internal helpers ──────────────────────────────────────────

  private async authenticate(creds: { username: string; password: string }): Promise<void> {
    const res = await this.client.post('/Authentication/Authenticate', {
      username: creds.username,
      password: creds.password,
    });
    const { sessionToken, userId } = res.data;
    this.client.defaults.headers.common['X-Booked-SessionToken'] = sessionToken;
    this.client.defaults.headers.common['X-Booked-UserId'] = userId;
    logger.info('LibreBooking: authenticated successfully');
  }

  // ── User provisioning ─────────────────────────────────────────

  async createUser(params: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    timezone?: string;
  }): Promise<{ id: number } | null> {
    try {
      const res = await this.client.post('/Users/', {
        firstName: params.firstName,
        lastName: params.lastName,
        emailAddress: params.email,
        userName: params.username,
        password: params.password,
        timezone: params.timezone ?? 'Europe/Zurich',
        language: 'en_us',
        phone: '',
        organization: '',
        position: 'teacher',
      });
      const id: number = res.data?.userId ?? res.data?.id;
      logger.info({ libreBookingUserId: id, email: params.email }, 'LibreBooking: user created');
      return { id };
    } catch (err: any) {
      if (err?.response?.status === 409) {
        logger.info({ email: params.email }, 'LibreBooking: user already exists');
        return null;
      }
      logger.error(err, 'LibreBooking: failed to create user');
      return null;
    }
  }

  // ── SchedulingAdapter implementation ─────────────────────────

  async getAvailability(
    resourceId: string,
    from: Date,
    to: Date,
  ): Promise<SchedulingSlot[]> {
    const res = await this.client.get('/Reservations/', {
      params: {
        resourceId,
        startDateTime: from.toISOString(),
        endDateTime: to.toISOString(),
      },
    });

    const reservations: Array<{ startDate: string; endDate: string }> = res.data.reservations ?? [];

    // Build free-slot list by inverting the reservations within the window
    const slots: SchedulingSlot[] = [];
    let cursor = from;
    for (const r of reservations) {
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      if (cursor < rStart) {
        slots.push({ start: cursor, end: rStart, available: true });
      }
      slots.push({ start: rStart, end: rEnd, available: false });
      cursor = rEnd;
    }
    if (cursor < to) {
      slots.push({ start: cursor, end: to, available: true });
    }
    return slots;
  }

  async createBooking(params: {
    resourceId: string;
    userId: string;
    start: Date;
    end: Date;
    notes?: string;
  }): Promise<SchedulingBooking> {
    const res = await this.client.post('/Reservations/', {
      resourceId: Number(params.resourceId),
      startDateTime: params.start.toISOString(),
      endDateTime: params.end.toISOString(),
      title: `My Music Coach Booking (user:${params.userId})`,
      description: params.notes ?? '',
    });

    return {
      externalId: String(res.data.referenceNumber),
      resourceId: params.resourceId,
      start: params.start,
      end: params.end,
      status: 'confirmed',
    };
  }

  async cancelBooking(externalId: string): Promise<void> {
    await this.client.delete(`/Reservations/${externalId}`);
    logger.info({ externalId }, 'LibreBooking: reservation cancelled');
  }

  async getBooking(externalId: string): Promise<SchedulingBooking | null> {
    try {
      const res = await this.client.get(`/Reservations/${externalId}`);
      const r = res.data;
      return {
        externalId: String(r.referenceNumber),
        resourceId: String(r.resourceId),
        start: new Date(r.startDate),
        end: new Date(r.endDate),
        status: 'confirmed',
      };
    } catch {
      return null;
    }
  }
}
