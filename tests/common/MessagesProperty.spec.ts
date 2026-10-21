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
  UnknownProperty,
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

  it('keeps pending files out of the saved properties', () => {
    const property = withMessages({}) as MessagesProperty;
    property.pendingFiles['msg-0'] = [new File(['x'], 'a.txt')];
    expect(Property.toJson([property])).toEqual({
      messages: [{ id: 'msg-0', text: 'hello' }],
    });
  });
});
