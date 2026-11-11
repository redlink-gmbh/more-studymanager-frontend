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
  formatQueryValue,
  isValidQueryNumber,
  operatorsForQueryDataType,
  queryDataTypeFromMeasurement,
  toQueryNumber,
} from '../../src/utils/queryDataTypeUtils';
import { QueryDataType } from '../../src/models/InputModels';

describe('queryDataTypeFromMeasurement', () => {
  it('maps measurement types to query data types', () => {
    expect(queryDataTypeFromMeasurement('DOUBLE')).toBe('double');
    expect(queryDataTypeFromMeasurement('INTEGER')).toBe('long');
    expect(queryDataTypeFromMeasurement('BOOLEAN')).toBe('boolean');
    expect(queryDataTypeFromMeasurement('STRING')).toBe('string');
    expect(queryDataTypeFromMeasurement(undefined)).toBe('string');
  });
});

describe('operatorsForQueryDataType', () => {
  const values = (t: QueryDataType): unknown[] =>
    operatorsForQueryDataType(t).map((o) => o.value);

  it('offers comparison operators for long, only ranges for double', () => {
    expect(values('long')).toEqual(['<', '>', '<=', '>=', '=', '!=']);
    expect(values('double')).toEqual(['<', '>', '<=', '>=']);
    expect(values('string')).toEqual(['=', '!=']);
    expect(values('boolean')).toEqual(['=', '!=']);
  });
});

describe('isValidQueryNumber', () => {
  it('accepts dot-decimal numbers for double', () => {
    expect(isValidQueryNumber('13', 'double')).toBe(true);
    expect(isValidQueryNumber('13.5', 'double')).toBe(true);
    expect(isValidQueryNumber('-2', 'double')).toBe(false);
    expect(isValidQueryNumber(23, 'double')).toBe(true);
  });

  it('accepts only non-negative whole numbers for long', () => {
    expect(isValidQueryNumber('13', 'long')).toBe(true);
    expect(isValidQueryNumber(-2, 'long')).toBe(false);
    expect(isValidQueryNumber('13.5', 'long')).toBe(false);
  });

  it('accepts comma decimals for double only', () => {
    expect(isValidQueryNumber('13,5', 'double')).toBe(true);
    expect(isValidQueryNumber('13,5', 'long')).toBe(false);
  });

  it('rejects thousands separators, text and empty values', () => {
    expect(isValidQueryNumber('1.234,5', 'double')).toBe(false);
    expect(isValidQueryNumber('1,234.5', 'double')).toBe(false);
    expect(isValidQueryNumber('abc', 'long')).toBe(false);
    expect(isValidQueryNumber('', 'double')).toBe(false);
    expect(isValidQueryNumber(undefined, 'long')).toBe(false);
  });
});

describe('formatQueryValue', () => {
  it('shows numbers with the decimal separator of the locale', () => {
    expect(formatQueryValue(13.5, 'de')).toBe('13,5');
    expect(formatQueryValue(13.5, 'en')).toBe('13.5');
    expect(formatQueryValue(1234.12345, 'de')).toBe('1234,12345');
    expect(formatQueryValue('13.5', 'de')).toBe('13.5');
    expect(formatQueryValue(undefined, 'de')).toBe('');
  });
});

describe('toQueryNumber', () => {
  it('normalizes comma and dot decimals to a number', () => {
    expect(toQueryNumber('13,5')).toBe(13.5);
    expect(toQueryNumber(' 13.5 ')).toBe(13.5);
    expect(toQueryNumber(23)).toBe(23);
  });
});
