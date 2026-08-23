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

// Fallback used only when storageConfigured is false (no S3_* secrets on
// this deployment yet) and only for the public teacher photo - see
// requireInlineTeacherPhoto in apps/api/src/lib/storage.ts for why. Resizes
// and JPEG-compresses the image in-browser via <canvas> so the resulting
// data: URL comfortably fits the server's inline-photo size cap, then
// returns it directly - there's no separate PUT step, the caller submits
// this string as imageUrl/publicImageUrl like any other value.
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
    // photo, and requireInlineTeacherPhoto accepts it.
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}
