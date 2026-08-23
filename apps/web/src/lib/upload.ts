// Shared client-side half of the presigned-upload flow: call
// requestUploadUrl for a fileUrl+uploadUrl pair, PUT the raw file straight
// to object storage, then hand the caller back the fileUrl to persist via
// whatever mutation owns the record (applyForTeacher, addLessonSlide, …).
// Credentials never pass through the browser - the presigned URL is the
// only thing that does.
export async function uploadFileToStorage(
  requestUploadUrl: (filename: string, contentType: string) => Promise<{ uploadUrl: string; fileUrl: string }>,
  file: File,
): Promise<string> {
  const { uploadUrl, fileUrl } = await requestUploadUrl(file.name, file.type);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}). Please try again.`);
  }
  return fileUrl;
}

// Used for every teacher-application/profile photo (become-teacher wizard,
// teacher profile editor) - same mechanism as the personal account avatar
// (see saveCroppedPhoto in apps/web/src/app/dashboard/profile/page.tsx and
// POST /profile/avatar in apps/api/src/index.ts): resized/JPEG-compressed
// in-browser via <canvas>, then POSTed straight to Postgres as a data: URL.
// Not a fallback for when S3 isn't configured - this is the only path,
// same as the account avatar never goes through S3 either.
export async function resizeImageToDataUrl(file: File, maxDimension = 480, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot process images for upload.');
    ctx.drawImage(bitmap, 0, 0, width, height);
    // Always JPEG, regardless of source format - smallest encoding for a
    // photo, and the server's TEACHER_PHOTO_PATTERN accepts it.
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}

// Used for CV/document/audio-sample uploads (become-teacher wizard step
// 4/5) - these aren't images to resize, just read as-is and base64-encode
// via FileReader, then POSTed to Postgres the same way as the photo. No
// S3 involved, matching the rest of this file's approach.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}
