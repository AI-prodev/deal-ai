export const convertImageToBlob = async (
  base64String: string
): Promise<Blob | null> => {
  return new Promise(resolve => {
    fetch(base64String)
      .then(response => {
        if (!response.ok) {
          console.error("Failed to fetch the image:", base64String);
          resolve(null);
        } else {
          response.blob().then(blob => {
            resolve(blob);
          });
        }
      })
      .catch(error => {
        console.error("Error converting image to Blob:", base64String, error);
        resolve(null);
      });
  });
};
