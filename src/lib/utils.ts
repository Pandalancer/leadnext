/**
 * Get initials from a name string
 * @param name The name to get initials from
 * @returns Up to 2 characters representing the initials
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";

  let initials = "";
  let skipSpace = true;

  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    if (char !== " " && char !== "\t" && char !== "\n" && char !== "\r") {
      if (skipSpace) {
        initials += char;
        if (initials.length === 2) break;
        skipSpace = false;
      }
    } else {
      skipSpace = true;
    }
  }

  return initials.toUpperCase();
}
