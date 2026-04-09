import assert from 'node:assert';
import { describe, it } from 'node:test';
import { normalizePhoneToLast10Digits } from './phone.ts';

describe('phone normalization', () => {
  it('should return last 10 digits for standard 10-digit number', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('1234567890'), '1234567890');
  });

  it('should normalize and return last 10 digits for formatted 10-digit number', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('(123) 456-7890'), '1234567890');
  });

  it('should return last 10 digits for number with country code', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('+1 1234567890'), '1234567890');
  });

  it('should return last 10 digits for number with more than 10 digits', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('112233445566'), '2233445566');
  });

  it('should return all digits if number has fewer than 10 digits', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('12345'), '12345');
  });

  it('should return empty string for empty input', () => {
    assert.strictEqual(normalizePhoneToLast10Digits(''), '');
  });

  it('should return empty string for input with no digits', () => {
    assert.strictEqual(normalizePhoneToLast10Digits('abc'), '');
  });
});
