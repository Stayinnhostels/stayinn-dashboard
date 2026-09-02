import { useState } from "react";
import { BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickRoomImageSrc, resolveRoomImageSrc } from "@/lib/room-image";

type RoomThumbnailProps = {
  images?: string[] | null;
  /** Use when showing a single known URL instead of an images array. */
  src?: string | null;
  className?: string;
  iconClassName?: string;
  alt?: string;
};

export function RoomThumbnail({
  images,
  src,
  className,
  iconClassName,
  alt = "",
}: RoomThumbnailProps) {
  const initial = src != null ? resolveRoomImageSrc(src) : pickRoomImageSrc(images);
  const [failed, setFailed] = useState(false);
  const resolved = failed ? null : initial;

  if (!resolved) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-muted", className)}>
        <BedDouble className={cn("h-12 w-12 text-muted-foreground/40", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
