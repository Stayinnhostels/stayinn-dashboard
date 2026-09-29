import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Phone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ResidentDetailSheet } from "@/components/admin/resident-detail-sheet";
import { useResidentsByRoomQuery } from "@/queries/residents";
import { cn } from "@/lib/utils";
import { useHostelScope } from "@/lib/use-hostel-scope";
import type { ResidentsByRoomGroup } from "@/types/domain/resident.types";

export const Route = createFileRoute("/admin/residents-by-room")({
  component: ResidentsByRoomPage,
});

function statusBadgeClass(status: string) {
  switch (status) {
    case "checked_in":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800";
    case "confirmed":
      return "border-sky-500/30 bg-sky-500/10 text-sky-800";
    case "pending":
      return "border-violet-500/30 bg-violet-500/10 text-violet-800";
    case "full":
      return "border-amber-500/30 bg-amber-500/10 text-amber-900";
    case "available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800";
    case "maintenance":
      return "border-rose-500/30 bg-rose-500/10 text-rose-800";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function ResidentsByRoomPage() {
  const { hostelId } = useHostelScope();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [includeEmpty, setIncludeEmpty] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const params = useMemo(
    () => ({
      ...(hostelId ? { hostel: hostelId } : {}),
      ...(search ? { search } : {}),
      include_empty: includeEmpty,
    }),
    [hostelId, search, includeEmpty],
  );

  const { data, isLoading, isError } = useResidentsByRoomQuery(params, {
    enabled: Boolean(hostelId),
  });
  const rooms = data?.rooms ?? [];
  const summary = data?.summary;

  function toggleRoom(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="sm:max-w-md"
          inputClassName="h-9"
          placeholder="Search room number, name, phone, CNIC…"
          value={searchInput}
          onValueChange={setSearchInput}
        />
        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-card px-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={includeEmpty}
            onChange={(e) => setIncludeEmpty(e.target.checked)}
          />
          Show empty rooms
        </label>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryTile label="Rooms shown" value={summary.total_rooms} icon={Building2} />
          <SummaryTile label="Occupied rooms" value={summary.occupied_rooms} icon={BedDouble} />
          <SummaryTile label="Empty rooms" value={summary.empty_rooms} icon={BedDouble} />
          <SummaryTile label="Active residents" value={summary.total_residents} icon={Users} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-sm text-destructive">
            Could not load residents by room.
          </CardContent>
        </Card>
      ) : rooms.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No rooms found{search ? ` for “${search}”` : ""}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const key = room.room_id ?? `unassigned-${room.room_title}`;
            const isCollapsed = collapsed[key] === true;
            return (
              <RoomOccupancyCard
                key={key}
                room={room}
                collapsed={isCollapsed}
                onToggle={() => toggleRoom(key)}
                onSelectResident={setDetailId}
              />
            );
          })}
        </div>
      )}

      <ResidentDetailSheet
        open={Boolean(detailId)}
        bookingId={detailId}
        month={new Date().toISOString().slice(0, 7)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-extrabold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomOccupancyCard({
  room,
  collapsed,
  onToggle,
  onSelectResident,
}: {
  room: ResidentsByRoomGroup;
  collapsed: boolean;
  onToggle: () => void;
  onSelectResident: (bookingId: string) => void;
}) {
  const count = room.residents.length;
  const bedsTotal = room.beds_total || 0;
  const occupied = room.occupied_seats;
  const free = Math.max(0, bedsTotal - occupied);

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="space-y-0 p-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {collapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <CardTitle className="text-base">
                {room.room_number != null ? (
                  <>
                    <span className="font-mono text-primary">#{room.room_number}</span>
                    <span className="mx-1.5 text-muted-foreground">·</span>
                  </>
                ) : null}
                {room.room_title.replace(/^\d+\s*·\s*/, "")}
              </CardTitle>
              <Badge variant="outline" className={cn("capitalize", statusBadgeClass(room.status))}>
                {room.status}
              </Badge>
            </div>
            <p className="mt-1 pl-6 text-xs text-muted-foreground">
              {room.category || "Room"} · {count} resident{count === 1 ? "" : "s"} · {occupied}/
              {bedsTotal || "—"} seats used
              {bedsTotal > 0 ? ` · ${free} free` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary" className="tabular-nums">
              <Users className="mr-1 h-3 w-3" />
              {count}
            </Badge>
            {room.room_id && (
              <Button asChild size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                <Link to="/admin/rooms/$id" params={{ id: room.room_id }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Room
                </Link>
              </Button>
            )}
          </div>
        </button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="border-t border-border/60 p-0">
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No active residents in this room.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {room.residents.map((r) => (
                <li key={r.booking_id}>
                  <button
                    type="button"
                    className="cursor-pointer flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30"
                    onClick={() => onSelectResident(r.booking_id)}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{r.booking_ref}</span>
                        {r.seat_label ? <span>Seat {r.seat_label}</span> : null}
                        <span>
                          {r.seats_booked} seat{r.seats_booked === 1 ? "" : "s"}
                        </span>
                        {r.check_in ? <span>In {r.check_in}</span> : null}
                        {r.check_out ? <span>Out {r.check_out}</span> : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.contact_number ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {r.contact_number}
                        </span>
                      ) : null}
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusBadgeClass(r.status))}
                      >
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
