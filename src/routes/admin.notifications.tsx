import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, Settings } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import {
  NotificationFilterTabs as FilterTabs,
  NotificationGroup,
  useNotificationActions,
} from "@/components/admin/notifications/notification-row";
import { groupNotificationsByDay } from "@/lib/notification-kind";
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from "@/queries/notifications";
import type { NotificationCategory } from "@/types/domain/notification.types";

export const Route = createFileRoute("/admin/notifications")({ component: NotificationsPage });

const EMPTY_COPY: Record<NotificationCategory, string> = {
  all: "No notifications yet",
  unread: "You're all caught up",
  payments: "No payment notifications",
  bookings: "No booking notifications",
  alerts: "No alerts",
};

/** Figma 16.01 · Desktop · Notifications */
function NotificationsPage() {
  const [category, setCategory] = useState<NotificationCategory>("all");
  const { data, isLoading, isError, refetch } = useNotificationsQuery({ limit: 100, category });
  const markAll = useMarkAllNotificationsReadMutation();
  const actions = useNotificationActions();

  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;
  const groups = groupNotificationsByDay(items);

  return (
    <div className="flex flex-col">
      <PageHeader
        className="lg:items-center"
        title="Notifications"
        subtitle="Everything that happened · bookings, payments, requests and alerts"
        actions={
          <>
            <FilterTabs value={category} onChange={setCategory} counts={data?.counts ?? null} />
            <GlassButton
              variant="glass"
              onClick={() =>
                markAll.mutate(undefined, {
                  onSuccess: () => toast.success("All marked as read"),
                })
              }
              disabled={unread === 0 || markAll.isPending}
            >
              <Check aria-hidden /> Mark all read
            </GlassButton>
            <Link
              to="/admin/settings"
              aria-label="Notification settings"
              className="glass-2 inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-[18px]"
            >
              <Settings aria-hidden />
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingGroups />
      ) : isError ? (
        <StateCard>
          <p className="text-body font-medium text-danger">Could not load notifications.</p>
          <GlassButton variant="glass" size="sm" onClick={() => void refetch()}>
            Try again
          </GlassButton>
        </StateCard>
      ) : items.length === 0 ? (
        <StateCard>
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-glass-inset text-ink-3 [&_svg]:size-[18px]">
            <Bell aria-hidden />
          </span>
          <p className="text-body font-medium text-ink-2">{EMPTY_COPY[category]}</p>
        </StateCard>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <NotificationGroup key={g.day} label={g.label} items={g.items} actions={actions} />
          ))}
        </div>
      )}
    </div>
  );
}

function StateCard({ children }: { children: ReactNode }) {
  return (
    <div className="glass-1 flex flex-col items-center justify-center gap-3 rounded-[22px] px-6 py-16 text-center">
      {children}
    </div>
  );
}

function LoadingGroups() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading notifications">
      <span className="h-4 w-12 animate-pulse rounded bg-glass-inset" />
      <div className="glass-1 overflow-hidden rounded-[22px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 border-b border-glass-divider px-[18px] py-3.5"
          >
            <span className="size-10 animate-pulse rounded-[12px] bg-glass-inset" />
            <div className="flex flex-1 flex-col gap-2">
              <span className="h-3.5 w-40 animate-pulse rounded bg-glass-inset" />
              <span className="h-3 w-64 animate-pulse rounded bg-glass-inset" />
            </div>
            <span className="h-3 w-14 animate-pulse rounded bg-glass-inset" />
          </div>
        ))}
      </div>
    </div>
  );
}
