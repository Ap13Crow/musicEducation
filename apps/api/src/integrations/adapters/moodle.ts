import axios, { type AxiosInstance } from 'axios';
import { logger } from '../../utils/logger.js';

/**
 * Moodle REST-API adapter.
 *
 * Handles user provisioning and basic course management.
 * The Moodle instance is the authoritative LMS; the platform
 * calls Moodle for enrolments & progress but does NOT replicate
 * all course data locally.
 */
export class MoodleAdapter {
  private client: AxiosInstance;
  private token: string;

  constructor(baseUrl: string, wsToken: string) {
    this.token = wsToken;
    // With sslproxy=true Moodle compares scheme+host against wwwroot.
    // X-Forwarded-Proto: https makes is_https() return true.
    // Host: <public hostname> makes the reconstructed URL match wwwroot so
    // Moodle doesn't issue an HTML redirect when called from the internal network.
    const moodleHost = (process.env.MOODLE_PUBLIC_HOST ?? 'learn.mymusic.coach');
    this.client = axios.create({
      baseURL: `${baseUrl}/webservice/rest`,
      params: { wstoken: this.token, moodlewsrestformat: 'json' },
      headers: {
        'X-Forwarded-Proto': 'https',
        Host: moodleHost,
      },
    });
  }

  // ── User provisioning ──────────────────────────────────────

  async createUser(params: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  }): Promise<number> {
    const res = await this.client.post('/server.php', null, {
      params: {
        ...this.client.defaults.params,
        wsfunction: 'core_user_create_users',
        'users[0][username]': params.username,
        'users[0][email]': params.email,
        'users[0][firstname]': params.firstName,
        'users[0][lastname]': params.lastName,
        // Password can be empty when using OIDC-only auth
        'users[0][password]': params.password ?? `OIDC_${Date.now()}`,
        'users[0][auth]': 'oidc', // Use OIDC auth plugin
      },
    });
    const userId: number = res.data?.[0]?.id;
    logger.info({ moodleUserId: userId }, 'Moodle: user created');
    return userId;
  }

  async getUserByEmail(email: string): Promise<{ id: number; username: string } | null> {
    const res = await this.client.post('/server.php', null, {
      params: {
        ...this.client.defaults.params,
        wsfunction: 'core_user_get_users',
        'criteria[0][key]': 'email',
        'criteria[0][value]': email,
      },
    });
    const user = res.data?.users?.[0];
    return user ? { id: user.id, username: user.username } : null;
  }

  // ── Course management ──────────────────────────────────────

  async enrolUser(userId: number, courseId: number, roleId: number = 5): Promise<void> {
    await this.client.post('/server.php', null, {
      params: {
        ...this.client.defaults.params,
        wsfunction: 'enrol_manual_enrol_users',
        'enrolments[0][roleid]': roleId,
        'enrolments[0][userid]': userId,
        'enrolments[0][courseid]': courseId,
      },
    });
    logger.info({ userId, courseId }, 'Moodle: user enrolled');
  }

  async listCourses(): Promise<
    Array<{ id: number; shortname: string; fullname: string; visible: number }>
  > {
    const res = await this.client.post('/server.php', null, {
      params: {
        ...this.client.defaults.params,
        wsfunction: 'core_course_get_courses',
      },
    });
    return (res.data ?? [])
      .filter((c: any) => c.id > 1) // exclude Moodle's built-in site course (id=1)
      .map((c: { id: number; shortname: string; fullname: string; visible: number }) => ({
        id: c.id,
        shortname: c.shortname,
        fullname: c.fullname,
        visible: c.visible ?? 1,
      }));
  }

  // ── Health ─────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.post('/server.php', null, {
        params: {
          ...this.client.defaults.params,
          wsfunction: 'core_webservice_get_site_info',
        },
      });
      return !!res.data?.sitename;
    } catch {
      return false;
    }
  }
}
