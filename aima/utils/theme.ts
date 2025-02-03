export const LIGHT_MODE_ROUTES = [
  "/simple-websites",
  "/projects/default/simple-websites",
];

export const handleLightModeRoute = (path: string): boolean => {
  for (const lightModeRoute of LIGHT_MODE_ROUTES) {
    if (path.startsWith(lightModeRoute)) {
      return true;
    }
  }
  return false;
};
