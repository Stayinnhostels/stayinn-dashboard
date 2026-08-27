import { getDocument, GlobalWorkerOptions, type PDFPageProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_WIDTH = 1600;
const MAX_DATA_URL_LENGTH = 900_000;
const RENDER_SCALE = 2.4;

export type CnicPdfPages = {
  front: string;
  back: string;
  front_text: string;
  back_text: string;
};

type PdfTextItem = {
  str?: string;
  transform?: number[];
};

function canvasToCompressedJpeg(canvas: HTMLCanvasElement): string {
  let quality = 0.9;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

function sliceCanvas(
  source: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(w));
  out.height = Math.max(1, Math.round(h));
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not process PDF page");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, x, y, w, h, 0, 0, out.width, out.height);
  return out;
}

/** Trim near-white margins so a small card on an A4 scan is large enough to read. */
function cropToContent(source: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = source.getContext("2d");
  if (!ctx) return source;
  const { width, height } = source;
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luma < 248 && data[i + 3] > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX - minX < 40 || maxY - minY < 40) return source;
  const padX = Math.round((maxX - minX) * 0.03);
  const padY = Math.round((maxY - minY) * 0.03);
  const x = Math.max(0, minX - padX);
  const y = Math.max(0, minY - padY);
  const w = Math.min(width - x, maxX - minX + padX * 2);
  const h = Math.min(height - y, maxY - minY + padY * 2);
  if (w >= width * 0.95 && h >= height * 0.95) return source;
  return sliceCanvas(source, x, y, w, h);
}

function splitTwoCards(source: HTMLCanvasElement): { front: HTMLCanvasElement; back: HTMLCanvasElement } | null {
  const { width, height } = source;
  if (height >= width * 1.15) {
    const mid = Math.floor(height / 2);
    return {
      front: sliceCanvas(source, 0, 0, width, mid),
      back: sliceCanvas(source, 0, mid, width, height - mid),
    };
  }
  if (width >= height * 2.1) {
    const mid = Math.floor(width / 2);
    return {
      front: sliceCanvas(source, 0, 0, mid, height),
      back: sliceCanvas(source, mid, 0, width - mid, height),
    };
  }
  return null;
}

async function renderPageToCanvas(page: PDFPageProxy): Promise<HTMLCanvasElement> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(RENDER_SCALE, MAX_WIDTH / Math.max(base.width, 1));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process PDF page");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  return cropToContent(canvas);
}

function itemsToText(items: PdfTextItem[], yMin?: number, yMax?: number): string {
  const rows = new Map<number, { x: number; str: string }[]>();
  for (const item of items) {
    const str = item.str?.trim();
    const transform = item.transform;
    if (!str || !transform) continue;
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    if (yMin != null && y < yMin) continue;
    if (yMax != null && y >= yMax) continue;
    const key = Math.round(y / 4) * 4;
    const row = rows.get(key) ?? [];
    row.push({ x, str });
    rows.set(key, row);
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) =>
      parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(" "),
    )
    .join("\n")
    .trim();
}

async function pageText(page: PDFPageProxy, yMin?: number, yMax?: number): Promise<string> {
  const content = await page.getTextContent();
  const items = content.items.filter((item): item is PdfTextItem => "str" in item);
  return itemsToText(items, yMin, yMax);
}

/**
 * Renders CNIC pages as JPEG data URLs.
 * 2+ pages: page 1 = front, page 2 = back.
 * 1 page: splits stacked/side-by-side cards, or treats a single card as the front.
 */
export async function extractCnicPagesFromPdf(file: File): Promise<CnicPdfPages> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error(`${file.name} is not a PDF`);
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;

  try {
    if (pdf.numPages < 1) {
      throw new Error("This PDF has no pages");
    }

    if (pdf.numPages >= 2) {
      const [frontPack, backPack] = await Promise.all(
        [1, 2].map(async (pageNumber) => {
          const page = await pdf.getPage(pageNumber);
          const text = await pageText(page);
          const canvas = await renderPageToCanvas(page);
          return { canvas, text };
        }),
      );
      return {
        front: canvasToCompressedJpeg(frontPack.canvas),
        back: canvasToCompressedJpeg(backPack.canvas),
        front_text: frontPack.text,
        back_text: backPack.text,
      };
    }

    const page = await pdf.getPage(1);
    const view = page.view;
    const midY = (view[1] + view[3]) / 2;
    const canvas = await renderPageToCanvas(page);
    const split = splitTwoCards(canvas);
    if (split) {
      const [front_text, back_text] = [
        await pageText(page, midY),
        await pageText(page, undefined, midY),
      ];
      return {
        front: canvasToCompressedJpeg(split.front),
        back: canvasToCompressedJpeg(split.back),
        front_text,
        back_text,
      };
    }

    const front_text = await pageText(page);
    return {
      front: canvasToCompressedJpeg(canvas),
      back: "",
      front_text,
      back_text: "",
    };
  } finally {
    await pdf.destroy();
  }
}
