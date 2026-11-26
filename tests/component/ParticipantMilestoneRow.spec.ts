/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ParticipantMilestoneRow from '../../src/components/ParticipantMilestoneRow.vue';

vi.mock('vue-i18n', () => ({
  useI18n: (): Record<string, unknown> => ({ t: (key: string) => key }),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: (): Record<string, unknown> => ({ add: vi.fn() }),
}));

vi.mock('../../src/stores/globalStore', () => ({
  useGlobalStore: (): Record<string, unknown> => ({
    getDateFormat: 'dd/mm/yy',
  }),
}));

vi.mock('../../src/api/participantMilestoneQueries', () => ({
  useCreateParticipantMilestone: (): Record<string, unknown> => ({}),
  useUpdateParticipantMilestone: (): Record<string, unknown> => ({}),
  useDeleteParticipantMilestone: (): Record<string, unknown> => ({}),
}));

function render(essential: boolean, existing?: object): string {
  return mount(ParticipantMilestoneRow, {
    props: {
      studyId: 1,
      participantId: 1,
      index: 0,
      milestone: {
        milestoneId: 1,
        studyId: 1,
        name: 'Baseline',
        orderIndex: 0,
        createdAt: '',
        essential,
      },
      existing,
    },
    global: { stubs: { Calendar: true, Button: true } },
  }).text();
}

const hint = 'participants.milestones.essentialMissing';

describe('ParticipantMilestoneRow essential hint', () => {
  it('shows the hint for an essential milestone without a date', () => {
    expect(render(true)).toContain(hint);
  });

  it('hides the hint once a date is set', () => {
    expect(
      render(true, {
        participantMilestoneId: 1,
        milestoneId: 1,
        dateTime: '2026-01-01T00:00:00Z',
      }),
    ).not.toContain(hint);
  });

  it('hides the hint for a non-essential milestone', () => {
    expect(render(false)).not.toContain(hint);
  });
});
