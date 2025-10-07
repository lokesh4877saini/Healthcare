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

export function getTimeFromPosition(position) {
  const totalHalfHours = position / 30;
  const totalHours = 8 + (totalHalfHours / 2);
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  // Handle edge cases for minutes rounding
  const finalMinutes = minutes >= 55 ? 60 : minutes <= 5 ? 0 : minutes;
  const finalHours = finalMinutes === 60 ? hours + 1 : hours;

  const period = finalHours >= 12 ? 'PM' : 'AM';
  const displayHour = finalHours > 12 ? finalHours - 12 : finalHours === 0 ? 12 : finalHours;

  if (finalMinutes === 30) {
      return `${displayHour}:30 ${period}`;
  } else if (finalMinutes === 0) {
      return `${displayHour} ${period}`;
  }
  
  // Fallback for any other minute values
  return `${displayHour}:${finalMinutes.toString().padStart(2, '0')} ${period}`;
}
export function getTimePosition(timeStr) {
  const timeParts = timeStr.split(' ');
  let hourPart = timeParts[0];
  const period = timeParts[1];

  let hourNum, minutes = 0;
  if (hourPart.includes(':')) {
      const [h, m] = hourPart.split(':');
      hourNum = parseInt(h);
      minutes = parseInt(m);
  } else {
      hourNum = parseInt(hourPart);
  }

  if (period === 'PM' && hourNum !== 12) hourNum += 12;
  if (period === 'AM' && hourNum === 12) hourNum = 0;

  const totalHalfHours = ((hourNum - 8) * 2) + (minutes / 30);
  return totalHalfHours * 30;
}

// Helper to get clean time (snap to nearest 30 minutes)
export const getCleanTimeFromPosition = (position) => {
  const totalHalfHours = position / 30;
  // Snap to nearest half hour
  const snappedHalfHours = Math.round(totalHalfHours);
  const totalHours = 8 + (snappedHalfHours / 2);
  
  const hours = Math.floor(totalHours);
  const minutes = (totalHours - hours) * 60;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  if (minutes === 30) {
      return `${displayHour}:30 ${period}`;
  }
  return `${displayHour} ${period}`;
};

// Helper to calculate end time from start time and fixed duration
export const getEndTimeFromStartTime = (startTime, duration) => {
  // Parse start time
  const timeParts = startTime.split(' ');
  let hourPart = timeParts[0];
  const period = timeParts[1];

  let hourNum, minutes = 0;
  if (hourPart.includes(':')) {
      const [h, m] = hourPart.split(':');
      hourNum = parseInt(h);
      minutes = parseInt(m);
  } else {
      hourNum = parseInt(hourPart);
  }

  // Convert to 24-hour format for calculation
  if (period === 'PM' && hourNum !== 12) hourNum += 12;
  if (period === 'AM' && hourNum === 12) hourNum = 0;

  // Add duration
  let endHour = hourNum + Math.floor(duration);
  let endMinutes = minutes + ((duration % 1) * 60);
  
  // Handle minute overflow
  if (endMinutes >= 60) {
      endHour += 1;
      endMinutes -= 60;
  }

  // Convert back to 12-hour format
  const endPeriod = endHour >= 12 ? 'PM' : 'AM';
  const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

  if (endMinutes === 30) {
      return `${displayEndHour}:30 ${endPeriod}`;
  }
  return `${displayEndHour} ${endPeriod}`;
};