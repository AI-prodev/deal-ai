const hex2rgba = ({
  hex,
  backgroundOpacity = 100,
}: {
  hex: string;
  backgroundOpacity?: number;
}) => {
  const hexValue = hex.replace("#", "");
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${backgroundOpacity ? backgroundOpacity / 100 : 1})`;
};

export default hex2rgba;
