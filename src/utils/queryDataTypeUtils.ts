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
  'number',
  'boolean',
];

const equalityOperators: MoreTableChoice[] = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
];

const comparisonOperators: MoreTableChoice[] = [
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '<=', value: '<=' },
  { label: '>=', value: '>=' },
  ...equalityOperators,
];

export function queryDataTypeFromMeasurement(type?: string): QueryDataType {
  if (type === 'DOUBLE' || type === 'INTEGER') return 'number';
  if (type === 'BOOLEAN') return 'boolean';
  return 'string';
}

export function operatorsForQueryDataType(
  type: QueryDataType,
): MoreTableChoice[] {
  return type === 'number' ? comparisonOperators : equalityOperators;
}

// dot as decimal separator only, matches what the backend can parse as Double
export function isValidQueryNumber(value: unknown): boolean {
  return /^-?\d+(\.\d+)?$/.test(String(value ?? '').trim());
}
