
export const compressImage = (file: File): Promise<{ thumbnail: string; full: string }> => {
  const MAX_DIMENSION_FULL = 1920;
  const MAX_DIMENSION_THUMB = 400;
  const QUALITY = 0.8;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onerror = reject;
      img.onload = () => {
        const createImage = (maxDimension: number): string => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', QUALITY);
        };

        try {
          const full = createImage(MAX_DIMENSION_FULL);
          const thumbnail = createImage(MAX_DIMENSION_THUMB);
          resolve({ thumbnail, full });
        } catch (error) {
          reject(error);
        }
      };
    };
  });
};
