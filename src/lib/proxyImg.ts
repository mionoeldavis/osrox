/** Rewrites an Instagram CDN URL through our server-side proxy to avoid browser blocks. */
export function proxyImg(url: string | null | undefined): string | null {
  if (!url) return null;
  return `/api/img-proxy?url=${encodeURIComponent(url)}`;
}
