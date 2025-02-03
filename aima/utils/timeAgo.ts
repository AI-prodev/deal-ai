export const timeAgo = (date: string) => {
  let seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 0) {
    seconds = 0;
  }
  let interval = seconds / 31536000;
  interval = seconds / 2592000;
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? `${Math.floor(interval)} day ago`
      : `${Math.floor(interval)} days ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? `${Math.floor(interval)} hour ago`
      : `${Math.floor(interval)} hours ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) === 1
      ? `${Math.floor(interval)} minute ago`
      : `${Math.floor(interval)} minutes ago`;
  }
  return Math.floor(interval) === 1
    ? `${Math.floor(interval)} second ago`
    : `${Math.floor(interval)} seconds ago`;
};

export const convertMinutesToPrettyTime = (seconds: number | undefined) => {
  if (!seconds || seconds <= 0) {
    return "0s";
  }
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  if (!minutes || minutes == 0) {
    return "0s";
  }

  let hours = Math.floor(minutes / 60);
  let remainingMinutes = Math.floor(minutes % 60);
  let remainingSeconds = Math.round((minutes % 1) * 60);

  let timeString = "";

  if (hours > 0) {
    timeString += hours + "h ";
  }

  if (remainingMinutes > 0) {
    timeString += remainingMinutes + "m ";
  }

  if (remainingSeconds > 0) {
    timeString += remainingSeconds + "s";
  }

  return timeString.trim();
};
