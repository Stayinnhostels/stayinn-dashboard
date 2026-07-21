/** ISO ID-1 / CNIC card ratio (width ÷ height). Used only for ID card crop. */
export const CNIC_ASPECT_RATIO = 85.6 / 53.98;

export type CnicCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image`);
  }
  return readFileAsDataUrl(file);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/**
 * Crop using pixel area from react-easy-crop (supports rotation).
 * Compresses for API storage — ID card uploads only.
 */
export async function cropCnicImageToDataUrl(
  imageSrc: string,
  pixelCrop: CnicCropArea,
  rotation = 0,
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  const scale = Math.min(1, MAX_WIDTH / Math.max(pixelCrop.width, 1));
  const outW = Math.max(1, Math.round(pixelCrop.width * scale));
  const outH = Math.max(1, Math.round(pixelCrop.height * scale));

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(
    data,
    Math.round(-safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(-safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  const output = document.createElement("canvas");
  output.width = outW;
  output.height = outH;
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("Could not process image");
  outCtx.drawImage(canvas, 0, 0, outW, outH);

  let quality = 0.82;
  let dataUrl = output.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
    quality -= 0.08;
    dataUrl = output.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}
