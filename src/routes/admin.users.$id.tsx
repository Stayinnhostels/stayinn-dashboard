import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, Star } from "lucide-react";

export const Route = createFileRoute("/admin/users/$id")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin", "profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "profile-roles", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin", "user-bookings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings").select("*, rooms(title), payments(amount, status)")
        .eq("user_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin", "user-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews").select("*, rooms(title)").eq("user_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !profile) {
    return <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>;
  }

  const totalSpent = bookings
    .flatMap((b) => b.payments ?? [])
    .filter((p: any) => p.status === "succeeded")
    .reduce((s, p: any) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/admin/users"><ArrowLeft className="h-4 w-4" /> Back to users</Link></Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-1">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-2xl">{(profile.full_name ?? profile.email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-extrabold">{profile.full_name ?? "Unnamed user"}</h2>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {(roles.length ? roles : ["user"]).map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">{r.replace("_", " ")}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1 text-left text-sm">
              {profile.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.email}</p>}
              {profile.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {profile.phone}</p>}
              <p className="text-xs text-muted-foreground">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Bookings</p><p className="mt-1 text-2xl font-extrabold">{bookings.length}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total spent</p><p className="mt-1 text-2xl font-extrabold">${totalSpent.toLocaleString()}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Reviews</p><p className="mt-1 text-2xl font-extrabold">{reviews.length}</p></CardContent></Card>
          </div>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Booking history</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Dates</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</TableCell></TableRow>
                  ) : bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.rooms?.title ?? "—"}</TableCell>
                      <TableCell className="text-sm">{b.check_in} → {b.check_out}</TableCell>
                      <TableCell>${Number(b.total_amount).toLocaleString()}</TableCell>
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
              {reviews.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{r.rooms?.title ?? "—"}</p>
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
