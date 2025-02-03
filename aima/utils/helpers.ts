export const getFileNameFormUrl = (url?: string) => {
  // TODO: improve function to handle more complex URLs
  return url?.split(`/`).pop() || "";
};
