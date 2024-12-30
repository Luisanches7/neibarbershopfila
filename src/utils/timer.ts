export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
}

export function calculateRemainingTime(endTime: string | null): number {
  if (!endTime) return 0;
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, Math.floor((end - now) / 1000));
  return diff;
}

export function calculateWaitTime(position: number): number {
  return position * 45 * 60; // 45 minutes in seconds per customer
}