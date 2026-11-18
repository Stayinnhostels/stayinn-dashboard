import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { cn } from "@/lib/utils";
import {
  getNotificationKind,
  notificationClock,
  notificationDetail,
} from "@/lib/notification-kind";
import {
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
} from "@/queries/notifications";
import { useUpdateReviewMutation } from "@/queries/reviews";
import type {
  Notification,
  NotificationCategory,
  NotificationCounts,
} from "@/types/domain/notification.types";

const FILTERS: { key: NotificationCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "payments", label: "Payments" },
  { key: "bookings", label: "Bookings" },
  { key: "alerts", label: "Alerts" },
];

/**
 * Opening a notification: marks it read, then follows its link.
 * "Approve" on a new review approves it in place (PATCH /reviews/:id) instead of navigating.
 */
export function useNotificationActions() {
  const navigate = useNavigate();
  const markRead = useMarkNotificationReadMutation();
  const approveReview = useUpdateReviewMutation();
  const remove = useDeleteNotificationMutation();

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) void navigate({ to: n.link });
  };

  const runAction = (n: Notification) => {
    const kind = getNotificationKind(n);
    if (kind.action === "approve" && n.entity_id) {
      approveReview.mutate(
        { id: n.entity_id, input: { status: "approved" } },
        {
          onSuccess: () => {
            if (!n.read) markRead.mutate(n.id);
            toast.success("Review approved");
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : "Could not approve review"),
        },
      );
      return;
    }
    open(n);
  };

  const del = (n: Notification) =>
    remove.mutate(n.id, { onSuccess: () => toast.success("Notification deleted") });

  return { open, runAction, del, approving: approveReview.isPending };
}

/** Figma 16.01 "Notification / …" row: 40px icon tile, title + detail, time, action, unread dot. */
export function NotificationRow({
  notification: n,
  actions,
}: {
  notification: Notification;
  actions: ReturnType<typeof useNotificationActions>;
}) {
  const kind = getNotificationKind(n);
  const Icon = kind.icon;
  const unread = !n.read;

  return (
    <div
      role={n.link ? "link" : undefined}
      tabIndex={n.link ? 0 : undefined}
      onClick={() => actions.open(n)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) actions.open(n);
      }}
      className={cn(
        "group flex w-full items-center gap-3.5 border-b border-glass-divider px-[18px] py-3.5 font-geist outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-border focus-visible:ring-inset",
        n.link && "cursor-pointer",
        unread ? "bg-glass-inset" : "hover:bg-glass-inset/60",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[12px] [&_svg]:size-[18px]",
          kind.urgent ? "bg-danger-tint text-danger" : "bg-glass-2 text-ink",
        )}
      >
        <Icon aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className={cn(
            "truncate text-body",
            unread ? "font-semibold text-ink" : "font-medium text-ink-2",
          )}
        >
          {n.title}
        </p>
        <p className="truncate text-label text-ink-3">{notificationDetail(n)}</p>
      </div>
      <span className="shrink-0 text-label whitespace-nowrap text-ink-3">
        {notificationClock(n.created_at)}
      </span>
      {kind.actionLabel ? (
        <GlassButton
          variant="glass"
          size="sm"
          disabled={kind.action === "approve" && actions.approving}
          onClick={(e) => {
            e.stopPropagation();
            actions.runAction(n);
          }}
        >
          {kind.actionLabel}
        </GlassButton>
      ) : null}
      <button
        type="button"
        aria-label="Delete notification"
        onClick={(e) => {
          e.stopPropagation();
          actions.del(n);
        }}
        className="hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-3 outline-none group-hover:flex group-focus-within:flex hover:bg-glass-inset hover:text-danger focus-visible:flex focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
      {unread ? (
        <span className="size-2 shrink-0 rounded-full bg-brand">
          <span className="sr-only">Unread</span>
        </span>
      ) : null}
    </div>
  );
}

/** Figma "Filter": inset track, 32px segments, active segment on glass-2 with a stroke. */
export function NotificationFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: NotificationCategory;
  onChange: (v: NotificationCategory) => void;
  counts: NotificationCounts | null;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter notifications"
      className="flex max-w-full items-start gap-0.5 overflow-x-auto rounded-[12px] bg-glass-inset p-1"
    >
      {FILTERS.map((f) => {
        const active = f.key === value;
        return (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.key)}
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border px-3 font-geist text-body font-medium whitespace-nowrap outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-brand-border",
              active
                ? "border-glass-stroke bg-glass-2 text-ink"
                : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {f.label}
            {counts ? <span className="text-label text-ink-3">{counts[f.key]}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationGroup({
  label,
  items,
  actions,
}: {
  label: string;
  items: Notification[];
  actions: ReturnType<typeof useNotificationActions>;
}) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-eyebrow text-ink-2 uppercase">{label}</h2>
      <div className="glass-1 overflow-hidden rounded-[22px]">
        {items.map((n) => (
          <NotificationRow key={n.id} notification={n} actions={actions} />
        ))}
      </div>
    </section>
  );
}

