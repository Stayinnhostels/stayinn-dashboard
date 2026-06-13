import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-fMRf3trd.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, R as ReviewsGridSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { i as Star, x as CircleCheck, S as Sparkles, X, v as Trash2 } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./table-RrXKMtST.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
async function getReviewsApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  const data = await apiFetch(`/api/v1/reviews${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.reviews)) {
    throw new Error("Invalid reviews list response");
  }
  return { reviews: data.reviews, stats: data.stats };
}
async function patchReviewApi(token, id, input) {
  const data = await apiFetch(`/api/v1/reviews/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input)
  });
  if (!data.success || !data.review) {
    throw new Error("Invalid review update response");
  }
  return data.review;
}
async function deleteReviewApi(token, id) {
  await apiFetch(`/api/v1/reviews/${id}`, {
    token,
    method: "DELETE"
  });
}
const reviewKeys = {
  all: ["reviews"],
  list: (params) => [...reviewKeys.all, "list", params]
};
function useReviewsQuery(params = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view reviews");
      return getReviewsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 3e4
  });
}
function useUpdateReviewMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchReviewApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    }
  });
}
function useDeleteReviewMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteReviewApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    }
  });
}
const statusBadge = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-700 border-rose-500/30"
};
function ReviewsPage() {
  const [filter, setFilter] = reactExports.useState("pending");
  const listParams = filter === "all" ? {} : {
    status: filter
  };
  const {
    data,
    isLoading,
    isError
  } = useReviewsQuery(listParams);
  const updateReview = useUpdateReviewMutation();
  const removeReview = useDeleteReviewMutation();
  const reviews = data?.reviews ?? [];
  const stats = data?.stats;
  function patch(id, input) {
    updateReview.mutate({
      id,
      input
    }, {
      onSuccess: () => toast.success("Review updated"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 4 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending", value: stats?.pending ?? 0, icon: Star, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Approved", value: stats?.approved ?? 0, icon: CircleCheck, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Avg rating", value: stats?.average_rating ? `${stats.average_rating}★` : "—", icon: Star, accent: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Featured", value: stats?.featured ?? 0, icon: Sparkles, accent: "info" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filter, onValueChange: (v) => setFilter(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", children: [
        "Pending (",
        stats?.pending ?? 0,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approved", children: "Approved" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rejected", children: "Rejected" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All" })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewsGridSkeleton, {}) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: "Could not load reviews." }) }) : reviews.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mx-auto h-12 w-12 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-bold", children: "No reviews here" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: reviews.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: r.guest_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            r.room_title ?? "Room",
            " · ",
            r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `capitalize shrink-0 ${statusBadge[r.status]}`, children: r.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", children: Array.from({
        length: 5
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}` }, i)) }),
      r.comment && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: r.comment }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        r.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: updateReview.isPending, onClick: () => patch(r.id, {
          status: "approved"
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
          " Approve"
        ] }),
        r.status !== "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: updateReview.isPending, onClick: () => patch(r.id, {
          status: "rejected"
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
          " Reject"
        ] }),
        r.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: updateReview.isPending, onClick: () => patch(r.id, {
          featured: !r.featured
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: `h-3.5 w-3.5 ${r.featured ? "fill-amber-400 text-amber-400" : ""}` }),
          r.featured ? "Unfeature" : "Feature"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", disabled: removeReview.isPending, onClick: () => removeReview.mutate(r.id, {
          onSuccess: () => toast.success("Review deleted"),
          onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed")
        }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
      ] })
    ] }) }, r.id)) })
  ] });
}
export {
  ReviewsPage as component
};
