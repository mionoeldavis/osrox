/** Formats a number with comma thousands separators, e.g. 1247893 → "1,247,893". */
export function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
