import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { cn } from "@/lib/utils";

/**
 * Compact photo viewer for the room page: a centred glass modal (not full screen)
 * with the photo, previous / next, and a thumbnail strip. Arrow keys move between photos.
 */
export function RoomPhotoModal({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number | null;
  title: string;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const open = index != null && Boolean(images[index]);
  const i = index ?? 0;
  const count = images.length;
  const go = (d: number) => onIndexChange((i + d + count) % count);

  useEffect(() => {
    if (!open || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndexChange((i + 1) % count);
      if (e.key === "ArrowLeft") onIndexChange((i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, i, count, onIndexChange]);

  const arrow =
    "glass-3 absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-5";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed top-1/2 left-1/2 z-50 flex w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-[24px] p-4 font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center gap-3 px-1">
            <Dialog.Title className="min-w-0 flex-1 truncate text-card-title text-ink">{title}</Dialog.Title>
            <span className="text-label font-medium text-ink-2">
              {i + 1} of {count}
            </span>
            <Dialog.Close
              aria-label="Close"
              className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-glass-inset">
            <RoomThumbnail key={i} src={images[i]} className="absolute inset-0 object-contain animate-in fade-in-0 duration-200" iconClassName="size-14" alt={`${title} photo ${i + 1}`} />
            {count > 1 ? (
              <>
                <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={cn(arrow, "left-3")}>
                  <ChevronLeft aria-hidden />
                </button>
                <button type="button" aria-label="Next photo" onClick={() => go(1)} className={cn(arrow, "right-3")}>
                  <ChevronRight aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          {count > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {images.map((src, j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => onIndexChange(j)}
                  aria-label={`Show photo ${j + 1}`}
                  aria-current={j === i || undefined}
                  className={cn(
                    "size-14 shrink-0 cursor-pointer overflow-hidden rounded-[10px] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-brand-border",
                    j === i ? "ring-2 ring-brand ring-offset-1 ring-offset-glass-3" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <RoomThumbnail src={src} iconClassName="size-5" />
                </button>
              ))}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
