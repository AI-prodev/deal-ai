export const getEmbedUrl = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length == 11) {
    return `//www.youtube.com/embed/${match[2]}`;
  } else {
    return "error";
  }
};
