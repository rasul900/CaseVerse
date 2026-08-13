/** Steam CDN via steamapis (redirects to steamcommunity economy image). */
export function steamImg(marketHashName: string): string {
  return `https://api.steamapis.com/image/item/730/${encodeURIComponent(marketHashName)}`;
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
