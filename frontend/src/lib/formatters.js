import { format, parseISO } from 'date-fns';

// Format date like: "Saturday, September 28, 2025"
export function formatDate(dateString) {
  return format(parseISO(dateString), 'EEEE, MMMM do, yyyy');
}

// Convert single "HH:mm" to "h:mm AM/PM"
export function formatTime24to12(timeString) {
  if (!timeString) return '';
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return format(date, 'h:mm a'); // e.g. 1:23 PM
}

// Format a range: startTime + endTime
export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${formatTime24to12(startTime)} - ${formatTime24to12(endTime)}`;
}
