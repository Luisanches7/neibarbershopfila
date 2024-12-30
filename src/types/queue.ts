export interface TimeSlotData {
  time: string;
  available: boolean;
  isPeak: boolean;
  estimatedWaitTime: number; // in minutes
}

export const PEAK_HOURS = {
  morning: { start: 9, end: 11 }, // 9 AM - 11 AM
  afternoon: { start: 16, end: 19 }, // 4 PM - 7 PM
};