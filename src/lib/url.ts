/**
 * Checks if a URL is safe for redirection.
 * A safe URL must be a relative path starting with a single '/' and not followed by another '/' or '\'.
 * This prevents open redirect vulnerabilities.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Ensure it starts with / and not // or /\
  return /^\/(?!\/|\\)/.test(url);
}
