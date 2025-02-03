export function getInitialsAndColor(name: string) {
  const initials = name.charAt(0).toUpperCase();
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return { initials, bgColor };
}
