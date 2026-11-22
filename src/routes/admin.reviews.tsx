import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Globe, Reply, Sparkles, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Segmented } from "@/components/admin/finance/finance-kit";
import { useDeleteReviewMutation, useReviewsQuery, useUpdateReviewMutation } from "@/queries/reviews";
import { usePropertySettingsQuery } from "@/queries/settings";
import { cn } from "@/lib/utils";
import type { Review, ReviewStatus, ReviewUpdateInput } from "@/types/domain/review.types";

/** Figma 14.02 · Reviews moderation. */
export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

const card = "glass-2 rounded-[22px] p-4 md:p-5";
const initials = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "G";
};
function ago(iso?: string | null) {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d < 1) return "Today";
  if (d === 1) return "1 day ago";
  if (d < 31) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= n ? "fill-ink text-ink" : "text-ink-2"} strokeWidth={1.6} aria-hidden />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const { data, isLoading, isError } = useReviewsQuery({ status: tab });
  const settings = usePropertySettingsQuery();
  const reviews = data?.reviews ?? [];
  const s = data?.stats;
  const site = (settings.data as { website?: string } | undefined)?.website?.trim();
  const siteUrl = site ? (/^https?:\/\//.test(site) ? site : `https://${site}`) : null;
  const dist = s?.distribution;
  const maxCount = dist ? Math.max(1, ...Object.values(dist)) : 1;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="What guests say · approve to show on your website, feature the best ones"
        actions={
          <>
            <Segmented
              label="Show"
              value={tab}
              onChange={setTab}
              options={[
                ["pending", "Waiting", s?.pending],
                ["approved", "Approved", s?.approved],
                ["rejected", "Rejected", s?.rejected],
              ] as const}
            />
            {siteUrl ? (
              <GlassButton asChild variant="glass" className="max-sm:hidden">
                <a href={siteUrl} target="_blank" rel="noreferrer">
                  <Globe aria-hidden /> View on website
                </a>
              </GlassButton>
            ) : null}
          </>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className={cn(card, "flex flex-col items-center gap-6 sm:flex-row")}>
            <div className="flex shrink-0 flex-col items-center gap-1.5 px-2">
              <p className="text-[32px] leading-10 font-semibold tracking-[-0.5px] text-ink">{s?.average_rating ? s.average_rating.toFixed(1) : "—"}</p>
              <Stars n={Math.round(s?.average_rating ?? 0)} />
              <p className="text-label text-ink-2">from {s?.approved_count ?? 0} approved reviews</p>
            </div>
            <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = dist?.[String(n) as "5"] ?? 0;
                return (
                  <div key={n} className="flex items-center gap-3 text-label text-ink-2">
                    <span className="w-5 shrink-0 tabular-nums">{n}★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-glass-inset">
                      <span className="dash-bar block h-full rounded-full bg-brand" style={{ width: `${(c / maxCount) * 100}%` }} />
                    </span>
                    <span className="w-6 shrink-0 text-right tabular-nums">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-1">
            <div className={cn(card, "flex flex-col gap-1")}>
              <p className="text-body text-ink-2">Waiting for you</p>
              <p className="text-[24px] leading-8 font-semibold text-ink">{s?.pending ?? 0}</p>
              <p className="text-label text-ink-2">{s?.oldest_pending_at ? `Oldest ${ago(s.oldest_pending_at).toLowerCase()}` : "Nothing waiting"}</p>
            </div>
            <div className={cn(card, "flex flex-col gap-1")}>
              <p className="text-body text-ink-2">Featured on homepage</p>
              <p className="text-[24px] leading-8 font-semibold text-ink">{s?.featured ?? 0}</p>
              <p className="text-label text-ink-2">Max {s?.featured_max ?? 6} shown</p>
            </div>
          </div>
        </div>

        {isError ? (
          <div className={cn(card, "py-14 text-center text-body text-danger")}>Could not load reviews. Is the API running?</div>
        ) : isLoading ? (
          [0, 1, 2].map((i) => <div key={i} className="h-[150px] animate-pulse rounded-[22px] bg-glass-inset" />)
        ) : reviews.length === 0 ? (
          <div className={cn(card, "py-14 text-center text-body text-ink-2")}>{tab === "pending" ? "No reviews waiting. New ones from your website show up here." : "No reviews here."}</div>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id}>
                <ReviewCard r={r} featuredFull={(s?.featured ?? 0) >= (s?.featured_max ?? 6)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function ReviewCard({ r, featuredFull }: { r: Review; featuredFull: boolean }) {
  const update = useUpdateReviewMutation();
  const del = useDeleteReviewMutation();
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState(r.public_reply ?? "");
  const name = r.user_name || r.guest_name || "Guest";
  const spam = Boolean(r.spam_hint) && r.status === "pending";

  const act = (input: ReviewUpdateInput, msg: string) =>
    update.mutate({ id: r.id, input }, { onSuccess: () => toast.success(msg), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update") });

  return (
    <article className={cn(card, "flex gap-4")}>
      <span className="flex size-9 shrink-0 items-center justify-center text-label font-semibold text-ink">{initials(name)}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-body font-semibold text-ink">{name}</p>
          <Stars n={r.rating} />
          {r.featured ? (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-brand-tint px-2 text-[12px] font-medium text-brand-text">
              <Sparkles className="size-3" aria-hidden /> Featured
            </span>
          ) : null}
          <span className="flex-1" />
          <span className="text-label text-ink-2">{ago(r.created_at)}</span>
        </div>
        <p className="-mt-1 text-label text-ink-2">{r.stay_label ?? r.room_title ?? ""}</p>
        <p className="text-body text-ink">“{r.comment}”</p>
        {spam ? (
          <p className="flex w-fit items-center gap-2 rounded-[10px] bg-danger-tint px-3 py-1.5 text-label text-danger">
            <Globe className="size-3.5" aria-hidden /> {r.spam_hint}
          </p>
        ) : null}
        {r.public_reply && !replyOpen ? (
          <div className="rounded-[14px] bg-glass-inset px-4 py-3">
            <p className="text-label font-medium text-ink-2">Your public reply{r.public_reply_by ? ` · ${r.public_reply_by}` : ""}</p>
            <p className="text-body text-ink">{r.public_reply}</p>
          </div>
        ) : null}
        {replyOpen ? (
          <div className="flex flex-col gap-2">
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} maxLength={1000} placeholder={`Thank ${name.split(" ")[0]} or answer their point — shown under the review on your website`} aria-label="Public reply" className="w-full resize-y rounded-[14px] border border-glass-stroke bg-glass-inset px-4 py-3 text-body text-ink outline-none focus:border-brand-border" />
            <div className="flex gap-2">
              <GlassButton size="sm" className="h-9" disabled={update.isPending} onClick={() => update.mutate({ id: r.id, input: { public_reply: reply.trim() } }, { onSuccess: () => { toast.success(reply.trim() ? "Reply saved" : "Reply removed"); setReplyOpen(false); } })}>
                <Check aria-hidden /> Save reply
              </GlassButton>
              <GlassButton size="sm" variant="ghost" className="h-9" onClick={() => setReplyOpen(false)}>
                Cancel
              </GlassButton>
            </div>
          </div>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {r.status === "pending" && spam ? (
            <>
              <GlassButton variant="danger" size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "rejected", spam: true }, "Rejected as spam")}>
                <Trash2 aria-hidden /> Reject as spam
              </GlassButton>
              <span className="flex-1" />
              <GlassButton variant="ghost" size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "approved" }, "Review approved")}>
                <Check aria-hidden /> Approve anyway
              </GlassButton>
            </>
          ) : r.status === "pending" ? (
            <>
              <GlassButton size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "approved" }, "Review approved — now on your website")}>
                <Check aria-hidden /> Approve
              </GlassButton>
              <GlassButton variant="glass" size="sm" className="h-9" disabled={update.isPending || featuredFull} title={featuredFull ? "The homepage already shows the maximum — unfeature one first" : undefined} onClick={() => act({ status: "approved", featured: true }, "Approved and featured on the homepage")}>
                <Sparkles aria-hidden /> Approve & feature
              </GlassButton>
              <GlassButton variant="ghost" size="sm" className="h-9" onClick={() => setReplyOpen(true)}>
                <Reply aria-hidden /> Reply publicly
              </GlassButton>
              <span className="flex-1" />
              <GlassButton variant="ghost" size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "rejected" }, "Review rejected")}>
                <X aria-hidden /> Reject
              </GlassButton>
            </>
          ) : r.status === "approved" ? (
            <>
              <GlassButton variant="glass" size="sm" className="h-9" disabled={update.isPending || (!r.featured && featuredFull)} onClick={() => act({ featured: !r.featured }, r.featured ? "Removed from the homepage" : "Featured on the homepage")}>
                <Sparkles aria-hidden /> {r.featured ? "Unfeature" : "Feature"}
              </GlassButton>
              <GlassButton variant="ghost" size="sm" className="h-9" onClick={() => setReplyOpen(true)}>
                <Reply aria-hidden /> {r.public_reply ? "Edit reply" : "Reply publicly"}
              </GlassButton>
              <span className="flex-1" />
              <GlassButton variant="ghost" size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "rejected" }, "Hidden from your website")}>
                <X aria-hidden /> Hide
              </GlassButton>
            </>
          ) : (
            <>
              <span className="text-label text-ink-2">
                {r.spam ? "Rejected as spam" : "Rejected"}
                {r.moderated_by_name ? ` by ${r.moderated_by_name}` : ""}
              </span>
              <span className="flex-1" />
              <GlassButton variant="ghost" size="sm" className="h-9 text-danger" disabled={del.isPending} onClick={() => window.confirm("Delete this review for good?") && del.mutate(r.id, { onSuccess: () => toast.success("Review deleted") })}>
                <Trash2 aria-hidden /> Delete
              </GlassButton>
              <GlassButton variant="ghost" size="sm" className="h-9" disabled={update.isPending} onClick={() => act({ status: "approved", spam: false }, "Review approved")}>
                <Check aria-hidden /> Approve
              </GlassButton>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
