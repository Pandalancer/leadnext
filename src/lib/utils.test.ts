import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getInitials } from './utils.ts';

describe('utils', () => {
  describe('getInitials', () => {
    it('should return empty string for null, undefined, or empty string', () => {
      assert.strictEqual(getInitials(null), "");
      assert.strictEqual(getInitials(undefined), "");
      assert.strictEqual(getInitials(""), "");
    });

    it('should return the first character for a single word name', () => {
      assert.strictEqual(getInitials("John"), "J");
    });

    it('should return the first character of the first two words', () => {
      assert.strictEqual(getInitials("John Doe"), "JD");
    });

    it('should only return up to two initials for multi-word names', () => {
      assert.strictEqual(getInitials("John Robert Doe"), "JR");
    });

    it('should capitalize the initials', () => {
      assert.strictEqual(getInitials("john doe"), "JD");
      assert.strictEqual(getInitials("albert"), "A");
    });

    it('should ignore leading and trailing spaces, and extra spaces between words', () => {
      assert.strictEqual(getInitials("  John   Doe  "), "JD");
      assert.strictEqual(getInitials("    Single    "), "S");
    });

    it('should handle tabs, newlines, and carriage returns as whitespace', () => {
      assert.strictEqual(getInitials("\tJohn\nDoe\r"), "JD");
      assert.strictEqual(getInitials(" \n\t John \r Doe \t\n"), "JD");
    });
  });
});
