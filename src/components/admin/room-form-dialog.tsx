import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ImageIcon, Loader2, Plus, X } from "lucide-react";
import { keepEscapeForEditor } from "@/components/glass/rich-text-editor-esc";
import { toast } from "sonner";
import { getRoomApi } from "@/api/rooms";
import { compressImageFile } from "@/lib/compress-image";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import {
  AmenityChip,
  GlassButton,
  GlassField,
  GlassIconButton,
  GlassInput,
  GlassSelect,
} from "@/components/glass";
import {
  ROOM_AMENITY_OPTIONS,
  ROOM_CATEGORIES,
  type Room,
  type RoomDraft,
} from "@/types/domain/room.types";

export type { RoomDraft };

/**
 * Figma 01.04 / 02.04 · Rooms — Add room. Glass-3 modal, 720 wide, sticky header and footer,
 * sections Room / Pricing / Details / Amenities / Photos. Also used for Edit room.
 */

const blank: RoomDraft = {
  title: "",
  room_number: 101,
  description: "",
  price_per_night: 0,
  price_per_night_usd: 0,
  price_per_night_pkr: 0,
  status: "draft",
  category: "2 Seater",
  capacity: 2,
  beds_total: 2,
  beds_available: 2,
  amenities: [],
  images: [],
  badge: null,
  display_order: 100,
  floor: null,
  last_cleaned_at: null,
};

const DESCRIPTION_MAX = 5000;
const TITLE_MAX = 200;

/** The editor (Tiptap) loads on demand, so the rooms page stays light until the modal opens. */
const RichTextEditor = lazy(() =>
  import("@/components/glass/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
);

function EditorFallback({ full }: { full?: boolean }) {
  return (
    <div
      className={cn(
        "glass-2 flex flex-col rounded-[14px] bg-glass-inset!",
        full ? "h-[min(511px,calc(92svh-290px))] min-h-[290px]" : "h-[183px]",
      )}
    >
      <div className="h-[41px] border-b border-glass-divider" />
      <div className="m-3.5 h-4 w-2/3 animate-pulse rounded bg-glass-1" />
    </div>
  );
}

function roomToDraft(room: Partial<Room> | null | undefined, suggestedRoomNumber = 101): RoomDraft {
  if (!room) return { ...blank, room_number: suggestedRoomNumber };
  return {
    title: room.title ?? "",
    room_number: room.room_number ?? null,
    description: room.description ?? "",
    price_per_night: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_usd: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_pkr: room.price_per_night_pkr ?? room.price_per_night ?? 0,
    status: room.status ?? "draft",
    category: room.category ?? "2 Seater",
    capacity: room.capacity ?? 1,
    beds_total: room.beds_total ?? 1,
    beds_available: room.beds_available ?? 1,
    amenities: (room.amenities ?? []).filter((a) => a.trim() && a.trim().toLowerCase() !== "none"),
    images: room.images ?? [],
    badge: room.badge ?? null,
    display_order: room.display_order ?? 100,
    floor: room.floor ?? null,
    last_cleaned_at: room.last_cleaned_at ?? null,
  };
}

function parseIntText(value: string) {
  const t = value.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isInteger(n) ? n : Number.NaN;
}

function toDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Errors = Partial<
  Record<
    | "room_number"
    | "floor"
    | "title"
    | "description"
    | "price_usd"
    | "price_pkr"
    | "category"
    | "capacity"
    | "beds_total"
    | "beds_available"
    | "display_order",
    string
  >
>;

/** Inputs in the modal sit on the inset fill (Figma), not the raised glass fill. */
const insetInput = "bg-glass-inset!";

export function RoomFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitting,
  suggestedRoomNumber = 101,
}: {
  open: boolean;
  initial: Partial<Room> | null;
  onClose: () => void;
  onSubmit: (v: RoomDraft) => void;
  submitting: boolean;
  /** Next available number when creating a new room (defaults to 101). */
  suggestedRoomNumber?: number;
}) {
  const { activeHostel } = useHostelScope();
  const [draft, setDraft] = useState<RoomDraft>(blank);
  const [text, setText] = useState({
    room_number: "101",
    floor: "",
    price_usd: "0",
    price_pkr: "0",
    capacity: "2",
    beds_total: "2",
    beds_available: "2",
    display_order: "100",
    last_cleaned: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [listingOpen, setListingOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (!open) return;
    const next = roomToDraft(initial, suggestedRoomNumber);
    setDraft(next);
    setAttempted(false);
    setListingOpen(false);
    setImageUrl("");
    setText({
      room_number:
        next.room_number != null
          ? String(next.room_number)
          : isEdit
            ? ""
            : String(suggestedRoomNumber),
      floor: next.floor != null ? String(next.floor) : "",
      price_usd: String(next.price_per_night_usd),
      price_pkr: String(next.price_per_night_pkr),
      capacity: String(next.capacity),
      beds_total: String(next.beds_total),
      beds_available: String(next.beds_available),
      display_order: String(next.display_order),
      last_cleaned: toDateInput(next.last_cleaned_at),
    });

    const roomId = initial?.id;
    const needsImages =
      Boolean(roomId) &&
      !initial?.images?.length &&
      Boolean(initial?.has_images || (initial?.image_count ?? 0) > 0);
    if (!needsImages || !roomId) {
      setLoadingImages(false);
      return;
    }
    let cancelled = false;
    setLoadingImages(true);
    void getRoomApi(roomId)
      .then((full) => {
        if (!cancelled) setDraft((d) => ({ ...d, images: full.images ?? [] }));
      })
      .catch((err) => {
        if (!cancelled)
          toast.error(err instanceof Error ? err.message : "Could not load room photos");
      })
      .finally(() => {
        if (!cancelled) setLoadingImages(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, suggestedRoomNumber]);

  const amenityOptions = useMemo(() => {
    const base: string[] = [...ROOM_AMENITY_OPTIONS];
    for (const a of draft.amenities) if (!base.includes(a)) base.push(a);
    return base.sort((a, b) => a.localeCompare(b));
  }, [draft.amenities]);

  const categoryOptions = useMemo(() => {
    const base: string[] = [...ROOM_CATEGORIES];
    if (draft.category && !base.includes(draft.category)) base.push(draft.category);
    return base;
  }, [draft.category]);

  const parsed = useMemo(() => {
    const usd = text.price_usd.trim() === "" ? Number.NaN : Number(text.price_usd);
    const pkr =
      text.price_pkr.trim() === "" ? Number.NaN : Number(text.price_pkr.replace(/,/g, ""));
    return {
      roomNumber: parseIntText(text.room_number),
      floor: parseIntText(text.floor),
      usd,
      pkr,
      capacity: parseIntText(text.capacity),
      bedsTotal: parseIntText(text.beds_total),
      bedsAvailable: parseIntText(text.beds_available),
      displayOrder: parseIntText(text.display_order),
    };
  }, [text]);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    if (
      parsed.roomNumber != null &&
      (!Number.isFinite(parsed.roomNumber) || parsed.roomNumber < 101 || parsed.roomNumber > 9999)
    )
      e.room_number = "Use a number from 101 to 9999";
    if (
      parsed.floor != null &&
      (!Number.isFinite(parsed.floor) || parsed.floor < 0 || parsed.floor > 200)
    )
      e.floor = "Use 0 (ground) to 200";
    if (!draft.title.trim()) e.title = "Title is required";
    if (draft.description.length > DESCRIPTION_MAX)
      e.description = `Keep the description under ${DESCRIPTION_MAX.toLocaleString("en-US")} characters`;
    if (!Number.isFinite(parsed.usd) || parsed.usd < 0) e.price_usd = "Enter a price of 0 or more";
    if (!Number.isFinite(parsed.pkr) || parsed.pkr < 0) e.price_pkr = "Enter a price of 0 or more";
    if (!draft.category.trim()) e.category = "Choose a category";
    if (parsed.capacity == null || !Number.isFinite(parsed.capacity) || parsed.capacity < 1)
      e.capacity = "At least 1";
    if (parsed.bedsTotal == null || !Number.isFinite(parsed.bedsTotal) || parsed.bedsTotal < 1)
      e.beds_total = "At least 1";
    else if (
      parsed.capacity != null &&
      Number.isFinite(parsed.capacity) &&
      parsed.capacity > parsed.bedsTotal
    )
      e.capacity = "Can’t exceed Beds total";
    if (
      parsed.bedsAvailable == null ||
      !Number.isFinite(parsed.bedsAvailable) ||
      parsed.bedsAvailable < 0
    )
      e.beds_available = "0 or more";
    else if (
      parsed.bedsTotal != null &&
      Number.isFinite(parsed.bedsTotal) &&
      parsed.bedsAvailable > parsed.bedsTotal
    )
      e.beds_available = "Beds available can’t exceed Beds total";
    if (
      parsed.displayOrder == null ||
      !Number.isFinite(parsed.displayOrder) ||
      parsed.displayOrder < 1
    )
      e.display_order = "1 or more";
    return e;
  }, [parsed, draft.title, draft.description, draft.category]);

  const hasErrors = Object.keys(errors).length > 0;
  const show = (k: keyof Errors) => (attempted ? errors[k] : undefined);

  function handleSubmit() {
    setAttempted(true);
    if (hasErrors) return;
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      room_number: parsed.roomNumber,
      floor: parsed.floor,
      price_per_night_usd: parsed.usd,
      price_per_night_pkr: parsed.pkr,
      price_per_night: parsed.usd,
      capacity: parsed.capacity ?? 1,
      beds_total: parsed.bedsTotal ?? 1,
      beds_available: parsed.bedsAvailable ?? 0,
      display_order: parsed.displayOrder ?? 100,
      ...(isEdit
        ? {
            last_cleaned_at: text.last_cleaned
              ? new Date(`${text.last_cleaned}T12:00:00`).toISOString()
              : null,
          }
        : {}),
    });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const urls = await Promise.all(Array.from(files).map((f) => compressImageFile(f)));
      setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add image");
    }
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("data:image/")) {
      toast.error("Enter an image link that starts with https://");
      return;
    }
    setDraft((d) => ({ ...d, images: [...d.images, url] }));
    setImageUrl("");
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const photoIds = draft.images.map((src, i) => `${i}:${src.slice(-24)}`);
  function onPhotoDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = photoIds.indexOf(String(active.id));
    const to = photoIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    setDraft((d) => ({ ...d, images: arrayMove(d.images, from, to) }));
  }

  const set = (k: keyof typeof text) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setText((t) => ({ ...t, [k]: e.target.value }));

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            titleRef.current?.focus();
          }}
          onEscapeKeyDown={keepEscapeForEditor}
          className="glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[min(92svh,1400px)] w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-glass-divider px-6 py-5">
            <div className="min-w-0">
              <Dialog.Title className="text-hero text-ink">
                {isEdit ? "Edit room" : "Add room"}
              </Dialog.Title>
              <p className="truncate text-body text-ink-2">
                {isEdit
                  ? `Update ${initial?.room_number != null ? `Room ${initial.room_number}` : (initial?.title ?? "this room")}`
                  : `Create a room for ${activeHostel?.name ?? "this property"}`}
              </p>
            </div>
            <Dialog.Close asChild>
              <GlassIconButton aria-label="Close">
                <X />
              </GlassIconButton>
            </Dialog.Close>
          </header>

          <form
            id="room-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <FormSection title="Room">
              <div className="grid gap-3 sm:grid-cols-[180px_120px_minmax(0,1fr)]">
                <GlassField label="Room number" error={show("room_number")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.room_number}
                      onChange={set("room_number")}
                      placeholder="101"
                    />
                  )}
                </GlassField>
                <GlassField label="Floor" error={show("floor")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.floor}
                      onChange={set("floor")}
                      placeholder="e.g. 3"
                    />
                  )}
                </GlassField>
                <GlassField label="Title" required error={show("title")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      ref={titleRef}
                      className={insetInput}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Private double"
                      maxLength={200}
                    />
                  )}
                </GlassField>
              </div>
              <GlassField label="Description" error={show("description")}>
                {(p) => (
                  <Suspense fallback={<EditorFallback />}>
                    <RichTextEditor
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      describedBy={p["aria-describedby"]}
                      value={draft.description}
                      onChange={(description) => setDraft((d) => ({ ...d, description }))}
                      maxLength={DESCRIPTION_MAX}
                      placeholder="What makes this room nice to stay in?"
                      onExpand={() => setListingOpen(true)}
                    />
                  </Suspense>
                )}
              </GlassField>
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid gap-3 sm:grid-cols-3">
                <GlassField label="Price / seat / month (USD)" required error={show("price_usd")}>
                  {(p) => (
                    <PrefixInput prefix="$">
                      <GlassInput
                        {...p}
                        inputMode="decimal"
                        className={cn(insetInput, "pl-8")}
                        value={text.price_usd}
                        onChange={set("price_usd")}
                      />
                    </PrefixInput>
                  )}
                </GlassField>
                <GlassField label="Price / seat / month (PKR)" required error={show("price_pkr")}>
                  {(p) => (
                    <PrefixInput prefix="Rs">
                      <GlassInput
                        {...p}
                        inputMode="decimal"
                        className={cn(insetInput, "pl-10")}
                        value={text.price_pkr}
                        onChange={set("price_pkr")}
                      />
                    </PrefixInput>
                  )}
                </GlassField>
                <GlassField label="Category" required error={show("category")}>
                  {(p) => (
                    <GlassSelect
                      {...p}
                      className={insetInput}
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </GlassSelect>
                  )}
                </GlassField>
              </div>
              <p className="text-label font-medium text-ink-3">
                Tip: PKR is not auto-converted — keep both prices in sync.
              </p>
            </FormSection>

            <FormSection title="Details">
              <div className="grid gap-3 sm:grid-cols-3">
                <GlassField label="Capacity" required error={show("capacity")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.capacity}
                      onChange={set("capacity")}
                    />
                  )}
                </GlassField>
                <GlassField label="Beds total" required error={show("beds_total")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.beds_total}
                      onChange={set("beds_total")}
                    />
                  )}
                </GlassField>
                <GlassField label="Beds available" error={show("beds_available")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.beds_available}
                      onChange={set("beds_available")}
                    />
                  )}
                </GlassField>
                <GlassField label="Status">
                  {(p) => (
                    <GlassSelect
                      {...p}
                      className={insetInput}
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value as RoomDraft["status"] })
                      }
                    >
                      <option value="available">Available</option>
                      <option value="full">Full</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="draft">Draft</option>
                    </GlassSelect>
                  )}
                </GlassField>
                <GlassField label="Display order" required error={show("display_order")}>
                  {(p) => (
                    <GlassInput
                      {...p}
                      inputMode="numeric"
                      className={insetInput}
                      value={text.display_order}
                      onChange={set("display_order")}
                    />
                  )}
                </GlassField>
                <GlassField label="Badge">
                  {(p) => (
                    <GlassInput
                      {...p}
                      className={insetInput}
                      value={draft.badge ?? ""}
                      maxLength={80}
                      onChange={(e) => setDraft({ ...draft, badge: e.target.value || null })}
                      placeholder="e.g. Most Popular"
                    />
                  )}
                </GlassField>
                {isEdit ? (
                  <GlassField label="Last cleaned">
                    {(p) => (
                      <GlassInput
                        {...p}
                        type="date"
                        className={insetInput}
                        value={text.last_cleaned}
                        onChange={set("last_cleaned")}
                      />
                    )}
                  </GlassField>
                ) : null}
              </div>
            </FormSection>

            <FormSection title="Amenities">
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((a) => (
                  <AmenityChip
                    key={a}
                    selected={draft.amenities.includes(a)}
                    onSelectedChange={(on) =>
                      setDraft((d) => ({
                        ...d,
                        amenities: on
                          ? [...d.amenities.filter((x) => x !== a), a]
                          : d.amenities.filter((x) => x !== a),
                      }))
                    }
                  >
                    {a}
                  </AmenityChip>
                ))}
              </div>
            </FormSection>

            <FormSection title="Photos">
              <p className="text-label font-medium text-ink-3">
                Add more than one photo of the room. The first photo is the cover; drag to reorder.
              </p>
              {loadingImages ? (
                <p className="flex items-center gap-2 text-label text-ink-2">
                  <Loader2 className="size-4 animate-spin" /> Loading photos…
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex size-[104px] shrink-0 flex-col items-center justify-center gap-1 rounded-[14px] border-[1.2px] border-dashed border-brand-border bg-brand-tint text-brand-text outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-brand-border"
                >
                  <Plus aria-hidden className="size-5" />
                  <span className="text-label font-medium">Add</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void handleUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onPhotoDragEnd}
                >
                  <SortableContext items={photoIds} strategy={horizontalListSortingStrategy}>
                    {draft.images.map((src, i) => (
                      <PhotoTile
                        key={photoIds[i]}
                        id={photoIds[i]}
                        src={src}
                        cover={i === 0}
                        onRemove={() =>
                          setDraft((d) => ({
                            ...d,
                            images: d.images.filter((_, idx) => idx !== i),
                          }))
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {draft.images.length < 4 ? (
                  <span
                    aria-hidden
                    className="flex size-[104px] shrink-0 items-center justify-center rounded-[14px] border border-dashed border-glass-divider bg-glass-inset text-ink-3"
                  >
                    <ImageIcon className="size-5" />
                  </span>
                ) : null}
              </div>
              <div className="flex items-end gap-2.5">
                <GlassField label="Image URL" className="min-w-0 flex-1">
                  {(p) => (
                    <GlassInput
                      {...p}
                      className={insetInput}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImageUrl();
                        }
                      }}
                      placeholder="https://"
                    />
                  )}
                </GlassField>
                <GlassButton variant="glass" onClick={addImageUrl} className="mb-0.5">
                  <Plus /> Add
                </GlassButton>
              </div>
            </FormSection>
          </form>

          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label font-medium text-ink-3">
              {attempted && hasErrors ? (
                <span className="text-danger">Fix the highlighted fields</span>
              ) : (
                "* Required"
              )}
            </p>
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton type="submit" form="room-form" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : isEdit ? <Check /> : <Plus />}
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Create room"}
            </GlassButton>
          </footer>
          <RoomListingDialog
            open={listingOpen}
            title={draft.title}
            description={draft.description}
            onClose={() => setListingOpen(false)}
            onDone={(title, description) => {
              setDraft((d) => ({ ...d, title, description }));
              setListingOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Figma 01.07 / 02.07 · Rooms — Room listing editor. Opened from the description's expand
 * button: title + full-size description editor. Done copies both back to the room form;
 * Cancel / Escape leaves the form as it was.
 */
function RoomListingDialog({
  open,
  title,
  description,
  onClose,
  onDone,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onDone: (title: string, description: string) => void;
}) {
  const [t, setT] = useState(title);
  const [d, setD] = useState(description);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (!open) return;
    setT(title);
    setD(description);
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const titleError = !t.trim() ? "Title is required" : undefined;
  const descError =
    d.length > DESCRIPTION_MAX
      ? `Keep the description under ${DESCRIPTION_MAX.toLocaleString("en-US")} characters`
      : undefined;

  function done() {
    setTried(true);
    if (titleError || descError) return;
    onDone(t, d);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={keepEscapeForEditor}
          className="glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[min(94svh,1400px)] w-[calc(100%-24px)] max-w-[880px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-glass-divider px-6 py-5">
            <div className="min-w-0">
              <Dialog.Title className="text-hero text-ink">Room listing</Dialog.Title>
              <p className="truncate text-body text-ink-2">Title and description guests see on the website</p>
            </div>
            <Dialog.Close asChild>
              <GlassIconButton aria-label="Close">
                <X />
              </GlassIconButton>
            </Dialog.Close>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <GlassField label="Title" required error={tried ? titleError : undefined}>
              {(p) => (
                <GlassInput
                  {...p}
                  className={insetInput}
                  value={t}
                  onChange={(e) => setT(e.target.value)}
                  placeholder="e.g. Private double"
                  maxLength={TITLE_MAX}
                />
              )}
            </GlassField>
            <div className="flex items-center gap-2 text-label text-ink-3">
              <span className="min-w-0 flex-1">
                Shown on room cards, bookings and the website. Keep it short — no formatting.
              </span>
              <span className="shrink-0 tabular-nums">
                {t.length} / {TITLE_MAX}
              </span>
            </div>
            <GlassField label="Description" className="mt-3" error={tried ? descError : undefined}>
              {(p) => (
                <Suspense fallback={<EditorFallback full />}>
                  <RichTextEditor
                    id={p.id}
                    invalid={p["aria-invalid"]}
                    describedBy={p["aria-describedby"]}
                    size="full"
                    autoFocus
                    value={d}
                    onChange={setD}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Describe the room: what’s inside, who it suits, what’s nearby…"
                  />
                </Suspense>
              )}
            </GlassField>
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label font-medium text-ink-3">
              {tried && (titleError || descError) ? (
                <span className="text-danger">Fix the highlighted fields</span>
              ) : (
                "Changes go back to the room form — save the room to publish them."
              )}
            </p>
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton onClick={done}>Done</GlassButton>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-[18px] border border-glass-divider bg-glass-1 p-[18px]">
      <h3 className="text-eyebrow text-ink-2">{title}</h3>
      {children}
    </section>
  );
}

function PrefixInput({ prefix, children }: { prefix: string; children: ReactNode }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-body text-ink"
      >
        {prefix}
      </span>
      {children}
    </div>
  );
}

function PhotoTile({
  id,
  src,
  cover,
  onRemove,
}: {
  id: string;
  src: string;
  cover: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={cn(
        "relative size-[104px] shrink-0 cursor-grab touch-none overflow-hidden rounded-[14px] border border-glass-divider active:cursor-grabbing",
        isDragging && "opacity-80 shadow-glass-3",
      )}
      {...attributes}
      {...listeners}
      aria-label={cover ? "Cover photo — drag to reorder" : "Photo — drag to reorder"}
    >
      <RoomThumbnail src={src} className="rounded-[14px]" iconClassName="size-6" />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        aria-label="Remove photo"
        className="glass-3 absolute top-[5px] right-[5px] flex size-6 items-center justify-center rounded-full text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <X className="size-3" />
      </button>
      {cover ? (
        <span className="absolute bottom-[5px] left-[5px] rounded-full bg-brand px-2 py-0.5 text-label font-medium text-on-brand">
          Cover
        </span>
      ) : null}
    </div>
  );
}
