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
  isValidQueryNumber,
  operatorsForQueryDataType,
  queryDataTypeFromMeasurement,
} from '../../src/utils/queryDataTypeUtils';

describe('queryDataTypeFromMeasurement', () => {
  it('maps measurement types to query data types', () => {
    expect(queryDataTypeFromMeasurement('DOUBLE')).toBe('number');
    expect(queryDataTypeFromMeasurement('INTEGER')).toBe('number');
    expect(queryDataTypeFromMeasurement('BOOLEAN')).toBe('boolean');
    expect(queryDataTypeFromMeasurement('STRING')).toBe('string');
    expect(queryDataTypeFromMeasurement(undefined)).toBe('string');
  });
});

describe('operatorsForQueryDataType', () => {
  const values = (t: 'string' | 'number' | 'boolean'): unknown[] =>
    operatorsForQueryDataType(t).map((o) => o.value);

  it('offers comparison operators only for numbers', () => {
    expect(values('number')).toEqual(['<', '>', '<=', '>=', '=', '!=']);
    expect(values('string')).toEqual(['=', '!=']);
    expect(values('boolean')).toEqual(['=', '!=']);
  });
});

describe('isValidQueryNumber', () => {
  it('accepts dot-decimal numbers', () => {
    expect(isValidQueryNumber('13')).toBe(true);
    expect(isValidQueryNumber('13.5')).toBe(true);
    expect(isValidQueryNumber('-2')).toBe(true);
    expect(isValidQueryNumber(23)).toBe(true);
  });

  it('rejects comma decimals, text and empty values', () => {
    expect(isValidQueryNumber('13,5')).toBe(false);
    expect(isValidQueryNumber('abc')).toBe(false);
    expect(isValidQueryNumber('')).toBe(false);
    expect(isValidQueryNumber(undefined)).toBe(false);
  });
});
