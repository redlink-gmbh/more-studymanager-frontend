/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/**
 * Returns the file if it fits the upload limit, a downscaled JPEG for too large images,
 * and rejects any other file that is too large.
 */
export async function prepareAttachment(
  file: File,
  maxSize: number = MAX_ATTACHMENT_SIZE,
): Promise<File> {
  if (file.size <= maxSize) {
    return file;
  }
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} is larger than ${maxSize} bytes`);
  }
  return shrinkImage(file, maxSize);
}

async function shrinkImage(file: File, maxSize: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, Math.sqrt(maxSize / file.size));
  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    // JPEG has no transparency, so fill transparent areas white instead of black
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    if (blob && blob.size <= maxSize) {
      return new File([blob], file.name.replace(/\.[^.]*$/, '') + '.jpg', {
        type: 'image/jpeg',
      });
    }
    scale *= 0.8;
  }
  throw new Error(`${file.name} could not be reduced below ${maxSize} bytes`);
}
