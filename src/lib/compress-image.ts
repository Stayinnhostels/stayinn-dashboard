const MAX_WIDTH = 1280;
const MAX_DATA_URL_LENGTH = 500_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Resize and compress an image file for API JSON payloads (avoids 413 / entity too large). */
export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image`);
  }

  const source = await readFileAsDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Could not load ${file.name}`));
    img.src = source;
  });
}
