// Client-side date utility functions

// Check if ad is expiring within 2 days
export function isExpiringWithin2Days(endDate: string): boolean {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2 && diffDays >= 0;
}

// Get days until expiration
export function getDaysUntilExpiration(endDate: string): number {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}