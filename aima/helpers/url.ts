export function isValidUrl(input: string | undefined) {
  if (!input) {
    return false;
  }
  const pattern = /^(https?:\/\/)/;

  if (!pattern.test(input)) {
    return false;
  }

  try {
    new URL(input);
    return true;
  } catch (e) {
    return false;
  }
}
