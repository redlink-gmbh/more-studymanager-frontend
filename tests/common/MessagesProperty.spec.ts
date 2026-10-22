/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache License, Version 2.0.
 */
import { describe, expect, it } from 'vitest';
import {
  InfoMessage,
  MESSAGE_MAX_LENGTH,
  MessagesProperty,
  Property,
  UnknownProperty
} from '../../src/models/InputModels';

const json = {
  id: 'messages',
  type: 'OBJECT',
  name: 'observation.factory.info.configProps.messagesName',
  description: 'observation.factory.info.configProps.messagesDesc',
  defaultValue: [],
};

const withMessages = (...messages: Partial<InfoMessage>[]): Property<any> =>
  Property.fromJson(json).setValue(
    messages.map((m, i) => ({ id: `msg-${i}`, text: 'hello', ...m })),
  );

describe('MessagesProperty', () => {
  it('is created for the OBJECT property with id messages only', () => {
    expect(Property.fromJson(json)).toBeInstanceOf(MessagesProperty);
    expect(Property.fromJson({ ...json, id: 'other' })).toBeInstanceOf(
      UnknownProperty,
    );
  });

  it('accepts no messages and valid messages', () => {
    expect(Property.fromJson(json).setValue([]).validate()).toBeUndefined();
    expect(
      withMessages({ priority: 'HIGH', attachments: ['a'] }, {}).validate(),
    ).toBeUndefined();
  });

  it('rejects empty, too long and wrongly prioritized messages', () => {
    expect(withMessages({ text: '  ' }).validate()).toBeDefined();
    expect(
      withMessages({ text: 'x'.repeat(MESSAGE_MAX_LENGTH + 1) }).validate(),
    ).toBeDefined();
    expect(withMessages({ priority: 'CRITICAL' }).validate()).toBeDefined();
  });

  it('does not share messages with the factory default or the given value', () => {
    const factoryJson = { ...json, defaultValue: [] };
    const created = Property.fromJson(factoryJson).setValue(undefined);
    created.value.push({ id: 'msg-0', text: 'hello' });
    expect(factoryJson.defaultValue).toEqual([]);
    expect(Property.fromJson(factoryJson).setValue(undefined).value).toEqual(
      [],
    );

    const stored = [{ id: 'msg-0', text: 'hello', attachments: ['a'] }];
    const edited = Property.fromJson(json).setValue(stored);
    edited.value[0].text = 'changed';
    edited.value[0].attachments.push('b');
    expect(stored).toEqual([
      { id: 'msg-0', text: 'hello', attachments: ['a'] },
    ]);
  });

  it('validates publishAfter', () => {
    const day = { value: 1, unit: 'DAY' as const };
    expect(
      withMessages(
        { publishAfter: { offset: day } },
        { publishAfter: { offset: day, time: '09:00' } },
        { publishAfter: { offset: { value: 0, unit: 'HOUR' } } },
      ).validate(),
    ).toBeUndefined();
    expect(
      withMessages({
        publishAt: '2026-10-22T18:00:00Z',
        publishAfter: { offset: day },
      }).validate(),
    ).toBeDefined();
    expect(
      withMessages({
        publishAfter: { offset: { value: -1, unit: 'DAY' } },
      }).validate(),
    ).toBeDefined();
    expect(
      withMessages({
        publishAfter: { offset: { value: 1, unit: 'MONTH' } },
      }).validate(),
    ).toBeDefined();
  });

  it('does not share publishAfter with the given value', () => {
    const stored = [
      { id: 'msg-0', text: 'hello', publishAfter: { offset: { value: 1 } } },
    ];
    const edited = Property.fromJson(json).setValue(stored);
    edited.value[0].publishAfter.offset.value = 5;
    edited.value[0].publishAfter.time = '09:00';
    expect(stored[0].publishAfter).toEqual({ offset: { value: 1 } });
  });

  it('keeps pending files out of the saved properties', () => {
    const property = withMessages({}) as MessagesProperty;
    property.pendingFiles['msg-0'] = [new File(['x'], 'a.txt')];
    expect(Property.toJson([property])).toEqual({
      messages: [{ id: 'msg-0', text: 'hello' }],
    });
  });
});
