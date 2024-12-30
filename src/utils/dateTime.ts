import { format, parse, setHours, setMinutes } from 'date-fns';

// Parse time string in 12-hour format
export function parseTimeSlot(timeString: string): Date {
  const parsedDate = parse(timeString, 'h:mm a', new Date());
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid time format');
  }
  return parsedDate;
}

// Format date to 12-hour time string
export function formatTimeSlot(date: Date): string {
  return format(date, 'h:mm a');
}

// Validate time string format
export function isValidTimeSlot(timeString: string): boolean {
  try {
    parseTimeSlot(timeString);
    return true;
  } catch {
    return false;
  }
}

// Set time on a date object
export function setTime(date: Date, hours: number, minutes: number): Date {
  return setMinutes(setHours(new Date(date), hours), minutes);
}