import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_WIDTH = 1280;
const MAX_DATA_URL_LENGTH = 500_000;
const RENDER_SCALE = 2;

export type CnicPdfPages = {
  front: string;
  back: string;
};

function canvasToCompressedJpeg(canvas: HTMLCanvasElement): string {
  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

async function renderPageToDataUrl(pdf: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(RENDER_SCALE, MAX_WIDTH / Math.max(base.width, 1));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process PDF page");

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvasToCompressedJpeg(canvas);
}

/**
 * Renders page 1 → front and page 2 → back as JPEG data URLs.
 * Requires a PDF with at least 2 pages.
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
    if (pdf.numPages < 2) {
      throw new Error("PDF must have at least 2 pages (page 1 = front, page 2 = back)");
    }

    const [front, back] = await Promise.all([
      renderPageToDataUrl(pdf, 1),
      renderPageToDataUrl(pdf, 2),
    ]);

    return { front, back };
  } finally {
    await pdf.destroy();
  }
}
