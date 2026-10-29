export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    )
    .replace(/[\u06f0-\u06f9]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0),
    );
}
