// Format date like: "Saturday, September 28, 2025"
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return '';

  // Day names and month names for formatting
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();

  // Get ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const year = date.getFullYear();

  return `${dayName}, ${monthName} ${dayOfMonth}${getOrdinal(dayOfMonth)}, ${year}`;
}

// Convert single "HH:mm" (24-hour) to "h:mm AM/PM"
function formatTime24to12(timeString) {
  if (!timeString) return '';

  const [hourStr, minuteStr] = timeString.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return '';

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  // Pad minute with leading zero if needed
  const minuteFormatted = minute < 10 ? '0' + minute : minute;

  return `${hour}:${minuteFormatted} ${ampm}`;
}

// Format a range: startTime + endTime
function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${formatTime24to12(startTime)} - ${formatTime24to12(endTime)}`;
}

module.exports = {
  formatDate,
  formatTime24to12,
  formatTimeRange,
};
