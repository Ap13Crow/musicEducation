import { NextRequest } from 'next/server';
import { proxyAuthenticatedPost } from '@/lib/apiProxy';

export async function POST(req: NextRequest) {
  return proxyAuthenticatedPost(req, '/teacher-application/audio');
}
