import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Download, Minus, Plus, RotateCw, ScanSearch, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type IdImage = { src: string; label: string };

const MIN = 1;
const MAX = 5;
const STEP = 0.5;

const iconBtn =
  "flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent [&_svg]:size-[18px]";

function fileName(label: string, owner?: string, src?: string) {
  const ext = /^data:image\/(\w+)/.exec(src ?? "")?.[1]?.replace("jpeg", "jpg") ?? "jpg";
  const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${[slug(label), owner ? slug(owner) : ""].filter(Boolean).join("-")}.${ext}`;
}

/**
 * Glass image viewer for ID documents (CNIC front/back, B-Form, passport).
 * Centered modal on desktop, full-height sheet on phones. Zoom (wheel, buttons,
 * double-click), drag to pan, rotate, download, and ←/→ between images.
 */
export function IdImageViewer({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  owner,
}: {
  images: IdImage[];
  index: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Whose document it is — shown under the title and used in the download name. */
  owner?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number } | null>(null);
  const count = images.length;
  const cur = images[Math.min(Math.max(index, 0), Math.max(count - 1, 0))];

  useEffect(() => {
    setZoom(1);
    setRotate(0);
    setOffset({ x: 0, y: 0 });
  }, [index, open]);

  const zoomTo = (z: number) => {
    const next = Math.min(MAX, Math.max(MIN, Math.round(z * 100) / 100));
    setZoom(next);
    if (next === MIN) setOffset({ x: 0, y: 0 });
  };
  const go = (d: number) => count > 1 && onIndexChange((index + d + count) % count);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "+" || e.key === "=") zoomTo(zoom + STEP);
    else if (e.key === "-") zoomTo(zoom - STEP);
    else if (e.key === "0") zoomTo(1);
    else if (e.key.toLowerCase() === "r") setRotate((r) => r + 90);
    else return;
    e.preventDefault();
  }
  function onWheel(e: WheelEvent<HTMLDivElement>) {
    zoomTo(zoom * (e.deltaY > 0 ? 0.88 : 1.14));
  }
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= MIN) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setOffset({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y });
  }
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  if (!cur) return null;
  const changed = zoom !== 1 || rotate % 360 !== 0 || offset.x !== 0 || offset.y !== 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          className={cn(
            "glass-3 fixed inset-x-0 bottom-0 z-[60] flex h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:h-[min(860px,calc(100svh-48px))] md:w-[min(1120px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:data-[state=open]:fade-in-0 md:data-[state=open]:zoom-in-95 md:data-[state=open]:slide-in-from-bottom-0",
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink-3/40 md:hidden" aria-hidden />

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-glass-divider py-3 pr-3 pl-5 md:py-3.5 md:pl-6">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text sm:flex"><ScanSearch className="size-5" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-[17px] leading-6 font-semibold text-ink">{cur.label}</Dialog.Title>
              <p className="truncate text-label text-ink-2">{[owner, count > 1 ? `${index + 1} of ${count}` : null].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="hidden items-center gap-0.5 rounded-[14px] bg-glass-inset p-0.5 sm:flex">
                <button type="button" className={iconBtn} onClick={() => zoomTo(zoom - STEP)} disabled={zoom <= MIN} aria-label="Zoom out"><Minus /></button>
                <button type="button" onClick={() => zoomTo(1)} className="h-9 min-w-[52px] cursor-pointer rounded-[12px] px-1 text-label font-medium text-ink-2 tabular-nums hover:bg-glass-2 hover:text-ink" aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
                <button type="button" className={iconBtn} onClick={() => zoomTo(zoom + STEP)} disabled={zoom >= MAX} aria-label="Zoom in"><Plus /></button>
              </div>
              <button type="button" className={iconBtn} onClick={() => setRotate((r) => r + 90)} aria-label="Rotate"><RotateCw /></button>
              <a href={cur.src} download={fileName(cur.label, owner, cur.src)} className={iconBtn} aria-label="Download"><Download /></a>
              <span className="mx-1 h-6 w-px bg-glass-divider" aria-hidden />
              <Dialog.Close className={iconBtn} aria-label="Close"><X /></Dialog.Close>
            </div>
          </div>

          {/* Stage */}
          <div className="relative min-h-0 flex-1 p-3 md:p-4">
            <div
              className={cn(
                "relative flex size-full touch-none items-center justify-center overflow-hidden rounded-[20px] bg-glass-inset select-none",
                zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
              )}
              onWheel={onWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => zoomTo(zoom > 1 ? 1 : 2.5)}
            >
              <img
                key={cur.src}
                src={cur.src}
                alt={`${cur.label}${owner ? ` for ${owner}` : ""}`}
                draggable={false}
                className="max-h-[calc(100%-32px)] max-w-[calc(100%-32px)] rounded-[12px] object-contain shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] transition-transform duration-150 ease-out"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotate}deg)` }}
              />
              {changed ? (
                <button type="button" onClick={() => { zoomTo(1); setRotate(0); }} className="glass-3 absolute top-3 left-3 cursor-pointer rounded-full px-3 py-1.5 text-label font-medium text-ink">Reset view</button>
              ) : null}
            </div>
            {count > 1 ? (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="glass-3 absolute top-1/2 left-6 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink hover:brightness-105 md:left-8"><ChevronLeft className="size-5" aria-hidden /></button>
                <button type="button" onClick={() => go(1)} aria-label="Next image" className="glass-3 absolute top-1/2 right-6 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink hover:brightness-105 md:right-8"><ChevronRight className="size-5" aria-hidden /></button>
              </>
            ) : null}
          </div>

          {/* Footer: thumbnails + hint */}
          <div className="flex items-center gap-3 border-t border-glass-divider px-5 py-3 md:px-6">
            {count > 1 ? (
              <div className="flex gap-2">
                {images.map((im, i) => (
                  <button
                    key={im.label}
                    type="button"
                    onClick={() => onIndexChange(i)}
                    aria-label={im.label}
                    aria-current={i === index}
                    className={cn("flex cursor-pointer items-center gap-2 rounded-[12px] border p-1 pr-3 text-label font-medium", i === index ? "border-brand-border bg-brand-tint text-brand-text" : "border-glass-divider text-ink-2 hover:bg-glass-inset")}
                  >
                    <img src={im.src} alt="" className="h-8 w-12 rounded-[8px] object-cover" />
                    {im.label}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="ml-auto hidden text-label text-ink-3 lg:block">Scroll or double-click to zoom · drag to move{count > 1 ? " · ← → to switch" : ""}</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
