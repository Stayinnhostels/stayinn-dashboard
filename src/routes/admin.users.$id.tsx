import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, Star } from "lucide-react";
import { getProfile, bookings as bookingStore, reviews as reviewStore, payments as paymentStore, getRoom } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/users/$id")({ component: UserDetailPage });

function UserDetailPage() {
  const { id } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["mock", "user-detail", id],
    queryFn: async () => {
      const profile = getProfile(id);
      const userBookings = bookingStore.filter((b) => b.user_id === id);
      const userReviews = reviewStore.filter((r) => r.user_id === id);
      const bookingIds = new Set(userBookings.map((b) => b.id));
      const totalSpent = paymentStore.filter((p) => bookingIds.has(p.booking_id) && p.status === "succeeded").reduce((s, p) => s + p.amount, 0);
      return { profile, userBookings, userReviews, totalSpent };
    },
  });

  if (!data?.profile) {
    return <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">User not found.</CardContent></Card>;
  }

  const { profile, userBookings, userReviews, totalSpent } = data;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/admin/users"><ArrowLeft className="h-4 w-4" /> Back to users</Link></Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-1">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="text-2xl">{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-extrabold">{profile.full_name}</h2>
              <Badge variant="secondary" className="mt-2 capitalize">{profile.role.replace("_", " ")}</Badge>
            </div>
            <div className="space-y-1 text-left text-sm">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.email}</p>
              {profile.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {profile.phone}</p>}
              <p className="text-xs text-muted-foreground">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Bookings</p><p className="mt-1 text-2xl font-extrabold">{userBookings.length}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total spent</p><p className="mt-1 text-2xl font-extrabold">${totalSpent.toLocaleString()}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Reviews</p><p className="mt-1 text-2xl font-extrabold">{userReviews.length}</p></CardContent></Card>
          </div>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Booking history</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Dates</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {userBookings.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</TableCell></TableRow>
                  ) : userBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{getRoom(b.room_id ?? "")?.title ?? "—"}</TableCell>
                      <TableCell className="text-sm">{b.check_in} → {b.check_out}</TableCell>
                      <TableCell>${b.total_amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{b.status.replace("_"," ")}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Reviews</CardTitle></CardHeader>
            <CardContent>
              {userReviews.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {userReviews.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{getRoom(r.room_id)?.title ?? "—"}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
