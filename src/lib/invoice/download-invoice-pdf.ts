const UNSUPPORTED_COLOR = /\boklch\s*\(|\blab\s*\(|\blch\s*\(/i;

function stripClassNames(root: HTMLElement) {
  root.className = "";
  root.querySelectorAll("[class]").forEach((node) => {
    if (node instanceof HTMLElement) node.className = "";
  });
}

function sanitizeClonedStyles(clonedDoc: Document, root: HTMLElement) {
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());

  const all = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const node of all) {
    if (!(node instanceof HTMLElement)) continue;
    node.className = "";
    const color = node.style.color;
    const bg = node.style.backgroundColor;
    const border = node.style.borderColor;
    if (UNSUPPORTED_COLOR.test(color)) node.style.color = "#000000";
    if (UNSUPPORTED_COLOR.test(bg)) node.style.backgroundColor = "transparent";
    if (UNSUPPORTED_COLOR.test(border)) node.style.borderColor = "#000000";
  }
}

/**
 * Renders invoice in a blank iframe so html2canvas never parses dashboard CSS (oklch, etc.).
 * PDF libraries load on demand so booking detail stays a small initial chunk.
 */
export async function downloadInvoicePdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument;
  const iframeWin = iframe.contentWindow;
  if (!iframeDoc || !iframeWin) {
    document.body.removeChild(iframe);
    throw new Error("Could not create PDF render frame");
  }

  iframeDoc.open();
  iframeDoc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#ffffff"></body></html>',
  );
  iframeDoc.close();

  const clone = element.cloneNode(true) as HTMLElement;
  stripClassNames(clone);
  iframeDoc.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeClonedStyles(clonedDoc, clonedElement);
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
