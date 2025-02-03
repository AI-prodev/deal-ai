export function formatVersionDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs = Math.round(diffMs / (60000 * 60));
  const diffDays = Math.round(diffMs / (60000 * 60 * 24));

  let timeAgo = "";
  if (diffDays > 1) {
    timeAgo = `${diffDays} days ago`;
  } else if (diffHrs > 1) {
    timeAgo = `${diffHrs} hours ago`;
  } else {
    timeAgo = `${diffMins} minutes ago`;
  }

  return `${formattedDate} (${timeAgo})`;
}

export function formatLiveCallDate(isoString: string) {
  const date = new Date(isoString);

  // Use the browser's locale
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  };

  const localDate = date.toLocaleDateString(locale, dateOptions);
  const localTimeWithZone = date.toLocaleTimeString(locale, timeOptions);

  const timeZone = localTimeWithZone.split(" ").slice(-1).join(" ");

  const localTime = localTimeWithZone.replace(` ${timeZone}`, "");

  return `${localDate} • ${localTime.toLowerCase()} ${timeZone}`;
}

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
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getNextFirstSaturday(inputDateString: string) {
  const inputDate = new Date(inputDateString);

  // Get the first day of the current month
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // 0-indexed (0 for January, 11 for December)
  const firstDayOfMonth = new Date(year, month, 1);

  // Calculate the first Saturday of the month
  let firstSaturday = new Date(firstDayOfMonth);
  firstSaturday.setDate(firstSaturday.getDate() + (6 - firstSaturday.getDay()));

  // If the input date is after the first Saturday, calculate for the next month
  if (inputDate >= firstSaturday) {
    const nextMonth = new Date(year, month + 1, 1);
    firstSaturday = new Date(nextMonth);
    firstSaturday.setDate(
      firstSaturday.getDate() + (6 - firstSaturday.getDay())
    );
  }

  // Format the date back into 'YYYY-MM-DD'
  const yyyy = firstSaturday.getFullYear();
  const mm = String(firstSaturday.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
  const dd = String(firstSaturday.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function getNextThirdSaturday(inputDateString: string) {
  // Parse the input date
  const inputDate = new Date(inputDateString);

  // Get the first day of the current month
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // 0-indexed (0 for January, 11 for December)
  const firstDayOfMonth = new Date(year, month, 1);

  // Calculate the first Saturday of the month
  let thirdSaturday = new Date(firstDayOfMonth);
  thirdSaturday.setDate(
    thirdSaturday.getDate() + (6 - thirdSaturday.getDay()) + 14
  ); // +14 days for the 3rd Saturday

  // If the input date is after the third Saturday, calculate for the next month
  if (inputDate >= thirdSaturday) {
    const nextMonth = new Date(year, month + 1, 1);
    thirdSaturday = new Date(nextMonth);
    thirdSaturday.setDate(
      thirdSaturday.getDate() + (6 - thirdSaturday.getDay()) + 14
    );
  }

  // Format the date back into 'YYYY-MM-DD'
  const yyyy = thirdSaturday.getFullYear();
  const mm = String(thirdSaturday.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
  const dd = String(thirdSaturday.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Adds 1 as getMonth() is zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
