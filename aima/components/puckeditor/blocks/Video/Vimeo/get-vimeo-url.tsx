export const getVimeoUrl = (url: string) => {
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const match = url.match(vimeoRegex);

  if (match) {
    const videoId = match[1];

    return `https://player.vimeo.com/video/${videoId}`;
  }

  return "error";
};
