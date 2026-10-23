/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache License, Version 2.0.
 */
import { describe, expect, it } from 'vitest';
import { prepareAttachment } from '../../src/utils/fileUtils';

describe('prepareAttachment', () => {
  it('returns files within the limit unchanged', async () => {
    const file = new File(['12345'], 'small.pdf', { type: 'application/pdf' });
    expect(await prepareAttachment(file, 5)).toBe(file);
  });

  it('rejects non-image files above the limit', async () => {
    const file = new File(['123456'], 'video.mp4', { type: 'video/mp4' });
    await expect(prepareAttachment(file, 5)).rejects.toThrow();
  });
});
