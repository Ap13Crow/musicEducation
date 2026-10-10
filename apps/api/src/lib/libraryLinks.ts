import QRCode from 'qrcode';

// Permanent public links for Library items (/l/<shortId>) and their files
// (/l/<shortId>/<n>, 1-based). The web app resolves them (apps/web/src/app/l),
// so they survive any change to internal ids or routes - safe to print as a
// QR code or share outside mymusic.coach.
export const SHORT_ID_PATTERN = /^[a-z0-9]{6,32}$/;

function appOrigin(): string {
  return (process.env.FRONTEND_URL ?? 'https://mymusic.coach').replace(/\/$/, '');
}

export function libraryShareUrl(shortId: string, fileNumber?: number): string {
  return `${appOrigin()}/l/${shortId}${fileNumber ? `/${fileNumber}` : ''}`;
}

// Public (admin-shared) folder - /f/<shortId>.
export function libraryFolderShareUrl(shortId: string): string {
  return `${appOrigin()}/f/${shortId}`;
}

export async function libraryQrCode(url: string, format: 'svg' | 'png'): Promise<string | Buffer> {
  // Error-correction level M survives a smudged print; the 4-module quiet
  // zone is what scanners need around the code.
  const options = { errorCorrectionLevel: 'M' as const, margin: 4 };
  return format === 'svg'
    ? QRCode.toString(url, { ...options, type: 'svg' })
    : QRCode.toBuffer(url, { ...options, type: 'png', width: 1024 });
}
