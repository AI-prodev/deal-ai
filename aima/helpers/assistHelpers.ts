export const chatWidgetPath = [
  "/apps/assist/widgets/[[...key]]",
  "/apps/assist/widgets/launcher",
  "/apps/assist/widgets/image-modal",
];

export const getAvatarBgColorFromLetters = (letter?: string) => {
  const lowercaseLetter = letter?.toLowerCase() ?? "-";

  const colors = ["primary", "secondary", "success", "danger", "warning"];
  const colorGroups = [
    { color: colors[0], range: ["a", "b", "c", "d", "e"] },
    { color: colors[1], range: ["f", "g", "h", "i", "j"] },
    { color: colors[2], range: ["k", "l", "m", "n", "o"] },
    { color: colors[3], range: ["p", "q", "r", "s", "t"] },
    { color: colors[4], range: ["u", "v", "w", "x", "y", "z"] },
  ];

  const group = colorGroups.find(group =>
    group.range.includes(lowercaseLetter)
  );

  if (group) {
    return group.color;
  }

  return "primary";
};
