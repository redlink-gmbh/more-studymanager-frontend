/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { QueryDataType } from '../models/InputModels';
import { MoreTableChoice } from '../models/MoreTableModel';

export const QUERY_DATA_TYPES: QueryDataType[] = [
  'string',
  'long',
  'double',
  'boolean',
];

const equalityOperators: MoreTableChoice[] = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
];

// equality on doubles is unreliable, so the backend only allows ranges for double
const rangeOperators: MoreTableChoice[] = [
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '<=', value: '<=' },
  { label: '>=', value: '>=' },
];

const comparisonOperators: MoreTableChoice[] = [
  ...rangeOperators,
  ...equalityOperators,
];

export function queryDataTypeFromMeasurement(type?: string): QueryDataType {
  if (type === 'INTEGER') return 'long';
  if (type === 'DOUBLE') return 'double';
  if (type === 'BOOLEAN') return 'boolean';
  return 'string';
}

export function operatorsForQueryDataType(
  type: QueryDataType,
): MoreTableChoice[] {
  if (type === 'long') return comparisonOperators;
  if (type === 'double') return rangeOperators;
  return equalityOperators;
}

// comma or dot as decimal separator, no thousands separators; normalized to dot by toQueryNumber before sending
export function isValidQueryNumber(
  value: unknown,
  type: 'long' | 'double',
): boolean {
  const pattern = type === 'long' ? /^\d+$/ : /^\d+([.,]\d+)?$/;
  return pattern.test(String(value ?? '').trim());
}

// numbers are stored with dot, shown with the decimal separator of the UI language
export function formatQueryValue(
  value: string | number | undefined,
  locale: string,
): string {
  return typeof value === 'number'
    ? value.toLocaleString(locale, {
        useGrouping: false,
        maximumFractionDigits: 20,
      })
    : (value ?? '');
}

export function toQueryNumber(value: unknown): number {
  return Number(
    String(value ?? '')
      .trim()
      .replace(',', '.'),
  );
}
