import { useState, type ReactNode } from "react";
import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import {
  ALL_COLUMN_IDS,
  COLUMN_BY_ID,
  COLUMN_PRESETS,
  DEFAULT_COLUMN_STATE,
  presetOf,
  type BookingColumnId,
  type ColumnPreset,
  type ColumnState,
} from "./booking-columns";

/**
 * Column settings (content from Figma 06.03 "Columns popover") shown as a full-height
 * side panel so all 22 columns fit on any screen height: presets, toggles (drag to
 * reorder), Cancel / Apply.
 */
export function ColumnsPopover({
  value,
  onApply,
  children,
}: {
  value: ColumnState;
  onApply: (s: ColumnState) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnState>(value);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const preset = presetOf(draft);
  const visible = new Set(draft.visible);

  const onOpenChange = (o: boolean) => {
    if (o) setDraft(value);
    setOpen(o);
  };
  const toggle = (id: BookingColumnId, on: boolean) =>
    setDraft((d) => ({
      ...d,
      visible: on ? [...d.visible, id] : d.visible.filter((v) => v !== id),
    }));
  const applyPreset = (p: ColumnPreset) =>
    setDraft((d) => ({ ...d, visible: [...COLUMN_PRESETS[p].visible] }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setDraft((d) => {
      const from = d.order.indexOf(e.active.id as BookingColumnId);
      const to = d.order.indexOf(e.over!.id as BookingColumnId);
      return { ...d, order: arrayMove(d.order, from, to) };
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "glass-3 fixed inset-y-3 right-3 z-50 flex w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-[24px] border-glass-stroke font-geist text-ink outline-none",
            "duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          )}
        >
          <div className="flex items-center gap-2 border-b border-glass-divider px-5 py-4">
            <Dialog.Title className="flex-1 text-card-title text-ink">Columns</Dialog.Title>
            <button
              type="button"
              onClick={() =>
                setDraft({ order: ALL_COLUMN_IDS, visible: DEFAULT_COLUMN_STATE.visible })
              }
              className="cursor-pointer text-body font-semibold text-brand-text underline outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              Reset to default
            </button>
            <Dialog.Close
              aria-label="Close"
              className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
            <div className="flex gap-1 rounded-[12px] border border-glass-divider bg-glass-inset p-1">
              {(Object.keys(COLUMN_PRESETS) as ColumnPreset[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  aria-pressed={preset === p}
                  className={cn(
                    "flex flex-1 cursor-pointer justify-center rounded-[9px] border py-1.5 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                    preset === p
                      ? "border-brand-border bg-brand-tint text-ink"
                      : "border-transparent text-ink-2 hover:text-ink",
                  )}
                >
                  {COLUMN_PRESETS[p].label}
                </button>
              ))}
            </div>
            <p className="text-label text-ink-3">
              {preset ? `${COLUMN_PRESETS[preset].label} preset · ` : "Custom · "}
              {draft.visible.length} of {ALL_COLUMN_IDS.length} visible · drag to reorder
            </p>
            <div className="-mx-1 px-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={draft.order} strategy={verticalListSortingStrategy}>
                  {draft.order.map((id) => (
                    <ColumnRow
                      key={id}
                      id={id}
                      on={visible.has(id)}
                      onToggle={(on) => toggle(id, on)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <p className="rounded-[10px] bg-glass-inset px-2.5 py-2 text-label text-ink-2">
              Guest (left) and Balance (right) are always pinned
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t border-glass-divider px-5 py-4">
            <GlassButton variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ColumnRow({
  id,
  on,
  onToggle,
}: {
  id: BookingColumnId;
  on: boolean;
  onToggle: (on: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const label = COLUMN_BY_ID.get(id)?.label ?? id;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2.5 rounded-[8px] px-1 py-1.5",
        isDragging && "relative z-10 bg-glass-3 shadow-md",
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${label}`}
        className="cursor-grab text-ink-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-border active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" aria-hidden />
      </button>
      <GlassCheckbox checked={on} onCheckedChange={onToggle} aria-label={label} />
      <span
        onClick={() => onToggle(!on)}
        className={cn(
          "flex-1 cursor-pointer text-label font-medium",
          on ? "text-ink" : "text-ink-3",
        )}
      >
        {label}
      </span>
    </div>
  );
}
