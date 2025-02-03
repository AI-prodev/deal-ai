export const formatBytes = (bytes: number) => {
  const roundToOneDecimal = (num: number) => {
    const rounded = Math.round(num * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  };

  if (bytes >= 1024 * 1024 * 1024 * 1024) {
    const tb = bytes / (1024 * 1024 * 1024 * 1024);
    return roundToOneDecimal(tb) + " TB";
  } else if (bytes >= 1024 * 1024 * 1024) {
    const gb = bytes / (1024 * 1024 * 1024);
    return roundToOneDecimal(gb) + " GB";
  } else if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return roundToOneDecimal(mb) + " MB";
  } else if (bytes >= 1024) {
    const kb = bytes / 1024;
    return roundToOneDecimal(kb) + " KB";
  } else {
    return bytes + " bytes";
  }
};
