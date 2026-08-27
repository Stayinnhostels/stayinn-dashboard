/** ISO ID-1 / CNIC card ratio (width ÷ height). Used only for ID card crop. */
export const CNIC_ASPECT_RATIO = 85.6 / 53.98;

/** ISO A4 portrait ratio (width ÷ height) — B-Form is a full page, not a short card. */
export const FULL_PAGE_ASPECT_RATIO = 210 / 297;

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

/** Higher-contrast grayscale copy used only for OCR — preview stays the original photo. */
export async function prepareCnicImageForOcr(dataUrl: string): Promise<string> {
  const image = await loadImage(dataUrl);
  const minW = 1200;
  const scale = Math.min(2.2, Math.max(1, minW / Math.max(image.width, 1)));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const c = Math.max(0, Math.min(255, (y - 128) * 1.3 + 140));
    d[i] = d[i + 1] = d[i + 2] = c;
  }
  ctx.putImageData(img, 0, 0);
  let quality = 0.88;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (out.length > 900_000 && quality > 0.5) {
    quality -= 0.08;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function rotatedBoundingBox(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Crop using pixel area from react-easy-crop (supports rotation).
 * Compresses for API storage — ID card uploads only.
 *
 * `pixelCrop` is relative to the *rotated* bounding box react-easy-crop
 * reports, so the rotated image must first be drawn onto a canvas sized to
 * that exact bounding box (not a padded/worst-case square) before cropping —
 * otherwise the crop rect lands on the wrong region whenever rotation isn't
 * a multiple of 180°.
 */
export async function cropCnicImageToDataUrl(
  imageSrc: string,
  pixelCrop: CnicCropArea,
  rotation = 0,
): Promise<string> {
  const image = await loadImage(imageSrc);
  const { width: bBoxWidth, height: bBoxHeight } = rotatedBoundingBox(
    image.width,
    image.height,
    rotation,
  );

  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = Math.round(bBoxWidth);
  rotatedCanvas.height = Math.round(bBoxHeight);
  const rotatedCtx = rotatedCanvas.getContext("2d");
  if (!rotatedCtx) throw new Error("Could not process image");

  rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  rotatedCtx.rotate((rotation * Math.PI) / 180);
  rotatedCtx.translate(-image.width / 2, -image.height / 2);
  rotatedCtx.drawImage(image, 0, 0);

  const scale = Math.min(1, MAX_WIDTH / Math.max(pixelCrop.width, 1));
  const outW = Math.max(1, Math.round(pixelCrop.width * scale));
  const outH = Math.max(1, Math.round(pixelCrop.height * scale));

  const output = document.createElement("canvas");
  output.width = outW;
  output.height = outH;
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("Could not process image");
  outCtx.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  let quality = 0.82;
  let dataUrl = output.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
    quality -= 0.08;
    dataUrl = output.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}
