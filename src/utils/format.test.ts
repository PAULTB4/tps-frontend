import { describe, it, expect } from 'vitest';
import { formatKwh, months } from './format';

describe('formatKwh', () => {
  it('should format a number with es-PE locale and kWh suffix', () => {
    expect(formatKwh(1234.5)).toBe('1,234.5 kWh');
  });

  it('should handle string numbers', () => {
    expect(formatKwh('9876')).toBe('9,876 kWh');
  });

  it('should return 0 kWh for undefined', () => {
    expect(formatKwh(undefined)).toBe('0 kWh');
  });

  it('should return 0 kWh for nullish values via default', () => {
    expect(formatKwh(null as any)).toBe('0 kWh');
  });

  it('should handle zero correctly', () => {
    expect(formatKwh(0)).toBe('0 kWh');
  });
});

describe('months', () => {
  it('should have 12 abbreviated month names in Spanish', () => {
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('Ene');
    expect(months[11]).toBe('Dic');
  });
});
