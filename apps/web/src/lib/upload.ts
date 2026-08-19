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
