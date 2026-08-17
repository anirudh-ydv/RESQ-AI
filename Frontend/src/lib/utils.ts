export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .flatMap(input => {
      if (!input) return [];
      if (typeof input === 'string') return input.split(' ');
      if (typeof input === 'object') return Object.entries(input).filter(([_, v]) => v).map(([k]) => k);
      return [];
    })
    .join(' ');
}