export function getNextDayOfWeek(inputDateStr: string, dayIndex: number) {
  const date = new Date(inputDateStr);

  // (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  const currentDay = date.getDay();

  // Calculate how many days to add to get to the next Tuesday (dayIndex === 2)
  // If it's already Tuesday, don't add any days.
  let daysToAdd = (dayIndex - currentDay + 7) % 7;

  date.setDate(date.getDate() + daysToAdd);

  // Format the date back into YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Adds 1 as getMonth() is zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDaylightSavingTime(dateString: string) {
  const inputDate = new Date(dateString);
  const year = inputDate.getFullYear();

  const jan = new Date(year, 0, 1); // January 1st of the input year
  const jul = new Date(year, 6, 1); // July 1st of the input year

  // Standard Time offset (usually during January)
  const standardTimeOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

  // Return true if the input date's offset is less than the standard time offset
  return inputDate.getTimezoneOffset() < standardTimeOffset;
}

export function getCurrentDateFormattedLong() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const year = now.getFullYear();
    const month = monthNames[now.getMonth()];
    const day = now.getDate();

    return `${month} ${day}, ${year}`;
}
