import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/admin/stat-card";
import { CheckCircle2, Star, Sparkles, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/queries/reviews";
import type { ReviewStatus } from "@/types/domain/review.types";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

const statusBadge: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

function ReviewsPage() {
  const [filter, setFilter] = useState<"all" | ReviewStatus>("pending");
  const listParams = filter === "all" ? {} : { status: filter };

  const { data, isLoading, isError } = useReviewsQuery(listParams);
  const updateReview = useUpdateReviewMutation();
  const removeReview = useDeleteReviewMutation();

  const reviews = data?.reviews ?? [];
  const stats = data?.stats;

  function patch(id: string, input: Parameters<typeof updateReview.mutate>[0]["input"]) {
    updateReview.mutate(
      { id, input },
      {
        onSuccess: () => toast.success("Review updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Approve guest reviews before they appear on the public website. Featured reviews are shown
        first on the homepage.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Star} accent="warning" />
        <StatCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard
          label="Avg rating"
          value={stats?.average_rating ? `${stats.average_rating}★` : "—"}
          icon={Star}
          accent="primary"
        />
        <StatCard label="Featured" value={stats?.featured ?? 0} icon={Sparkles} accent="info" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats?.pending ?? 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            Could not load reviews.
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-bold">No reviews here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id} className="border-border/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{r.guest_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.room_title ?? "Room"} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className={`capitalize shrink-0 ${statusBadge[r.status]}`}>
                    {r.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                {r.comment && <p className="text-sm leading-relaxed">{r.comment}</p>}
                <div className="flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateReview.isPending}
                      onClick={() => patch(r.id, { status: "approved" })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateReview.isPending}
                      onClick={() => patch(r.id, { status: "rejected" })}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                  {r.status === "approved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updateReview.isPending}
                      onClick={() => patch(r.id, { featured: !r.featured })}
                    >
                      <Sparkles
                        className={`h-3.5 w-3.5 ${r.featured ? "fill-amber-400 text-amber-400" : ""}`}
                      />
                      {r.featured ? "Unfeature" : "Feature"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={removeReview.isPending}
                    onClick={() =>
                      removeReview.mutate(r.id, {
                        onSuccess: () => toast.success("Review deleted"),
                        onError: (err) =>
                          toast.error(err instanceof Error ? err.message : "Delete failed"),
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
