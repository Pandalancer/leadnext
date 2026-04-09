import assert from 'node:assert';
import { describe, it } from 'node:test';
import { isSafeUrl } from './url.ts';

describe('isSafeUrl', () => {
  it('should return false for falsy inputs', () => {
    assert.strictEqual(isSafeUrl(null), false);
    assert.strictEqual(isSafeUrl(undefined), false);
    assert.strictEqual(isSafeUrl(''), false);
  });

  it('should return true for valid local paths', () => {
    assert.strictEqual(isSafeUrl('/'), true);
    assert.strictEqual(isSafeUrl('/dashboard'), true);
    assert.strictEqual(isSafeUrl('/users/settings?theme=dark'), true);
    assert.strictEqual(isSafeUrl('/path/to/resource#section'), true);
  });

  it('should return false for protocol-relative URLs', () => {
    assert.strictEqual(isSafeUrl('//example.com'), false);
    assert.strictEqual(isSafeUrl('//evil.com/path'), false);
  });

  it('should return false for paths starting with /\\', () => {
    assert.strictEqual(isSafeUrl('/\\example.com'), false);
    assert.strictEqual(isSafeUrl('/\\evil.com'), false);
  });

  it('should return false for absolute URLs', () => {
    assert.strictEqual(isSafeUrl('http://example.com'), false);
    assert.strictEqual(isSafeUrl('https://example.com'), false);
    assert.strictEqual(isSafeUrl('ftp://example.com'), false);
  });

  it('should return false for paths not starting with a slash', () => {
    assert.strictEqual(isSafeUrl('dashboard'), false);
    assert.strictEqual(isSafeUrl('users/settings'), false);
    assert.strictEqual(isSafeUrl('?query=true'), false);
    assert.strictEqual(isSafeUrl('#hash'), false);
  });

  it('should return false for potentially dangerous URIs', () => {
    assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
    assert.strictEqual(isSafeUrl('javascript://%250Aalert(1)'), false);
    assert.strictEqual(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.strictEqual(isSafeUrl('vbscript:msgbox("hello")'), false);
  });
});
