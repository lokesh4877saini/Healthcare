import { format, parseISO } from 'date-fns';

export function formatDate(dateString) {
  return format(parseISO(dateString), 'EEEE, MMMM do, yyyy');
}

export function formatTime24to12(timeString) {
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return format(date, 'h:mm a'); // example: 1:23 PM
}
