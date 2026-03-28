export function normalizePhoneToLast10Digits(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.slice(-10);
}

