import { DomainValidationError } from './errors';

export function requiredText(value: string, field: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new DomainValidationError(`${field} must be a string`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new DomainValidationError(`${field} must not be empty`);
  }

  if (normalized.length > maxLength) {
    throw new DomainValidationError(`${field} must not exceed ${maxLength} characters`);
  }

  return normalized;
}

export function uuidV4(value: string, field: string): string {
  if (!UUID_V4_PATTERN.test(value)) {
    throw new DomainValidationError(`${field} must be a UUID v4`);
  }

  return value;
}

export function positiveInteger(value: number, field: string, max: number): number {
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new DomainValidationError(`${field} must be an integer between 1 and ${max}`);
  }

  return value;
}

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
