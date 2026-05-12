import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Star, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, rooms(title), profiles:user_id(full_name, email, avatar_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("reviews").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = reviews.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({reviews.filter((r) => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-bold">No reviews here</p>
            <p className="text-xs text-muted-foreground">When guests leave reviews, they will appear in this section.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{r.profiles?.full_name ?? "Guest"}</p>
                    <p className="text-xs text-muted-foreground">{r.rooms?.title ?? "—"} · {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{r.status}</Badge>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm leading-relaxed">{r.comment}</p>}
                <div className="flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, patch: { status: "approved" } })}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, patch: { status: "rejected" } })}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, patch: { featured: !r.featured } })}>
                    <Sparkles className={`h-3.5 w-3.5 ${r.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                    {r.featured ? "Unfeature" : "Feature"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
