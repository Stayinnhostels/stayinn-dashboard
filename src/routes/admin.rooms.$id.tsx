import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, BedDouble, Loader2, Pencil, Trash2, Wallet, Users } from "lucide-react";
import { toast } from "sonner";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import { bookings as bookingStore } from "@/lib/mock-store";
import { useRoomQuery, useUpdateRoomMutation, useDeleteRoomMutation } from "@/queries/rooms";
import type { RoomDraft } from "@/types/domain/room.types";

export const Route = createFileRoute("/admin/rooms/$id")({ component: RoomDetailPage });

function RoomDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data: room, isLoading, isError, error } = useRoomQuery(id);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();

  const bookings = useMemo(
    () =>
      bookingStore
        .filter((b) => b.room_id === id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [id],
  );

  const revenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total_amount, 0);

  function handleUpdate(values: RoomDraft) {
    updateRoom.mutate(
      { id, draft: values },
      {
        onSuccess: () => {
          toast.success("Room updated");
          setEditing(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function handleDelete() {
    deleteRoom.mutate(id, {
      onSuccess: () => {
        toast.success("Room deleted");
        navigate({ to: "/admin/rooms" });
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  }

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading room…
        </CardContent>
      </Card>
    );
  }

  if (isError || !room) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Room not found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/rooms">
            <ArrowLeft className="h-4 w-4" /> Back to rooms
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 lg:col-span-2">
          <div className="aspect-video bg-muted">
            {room.images?.[activeImage] ? (
              <img src={room.images[activeImage]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BedDouble className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {room.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {room.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{room.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {room.category} · capacity {room.capacity}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {room.status}
              </Badge>
            </div>
            {room.badge && <Badge className="w-fit">{room.badge}</Badge>}
            {room.description && <p className="text-sm leading-relaxed text-muted-foreground">{room.description}</p>}
            {room.amenities?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price / night</p>
              <p className="mt-1 text-3xl font-extrabold">${room.price_per_night.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Beds available</span>
                <span className="font-bold">
                  {room.beds_available} / {room.beds_total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  <Users className="inline h-3.5 w-3.5" /> Total bookings
                </span>
                <span className="font-bold">{bookings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  <Wallet className="inline h-3.5 w-3.5" /> Revenue
                </span>
                <span className="font-bold">${revenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Booking history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link to="/admin/bookings/$id" params={{ id: b.id }} className="font-semibold hover:underline">
                        {b.guest_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {b.check_in} → {b.check_out}
                    </TableCell>
                    <TableCell>${b.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {b.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoomFormDialog
        open={editing}
        initial={room}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        submitting={updateRoom.isPending}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {room.title}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
