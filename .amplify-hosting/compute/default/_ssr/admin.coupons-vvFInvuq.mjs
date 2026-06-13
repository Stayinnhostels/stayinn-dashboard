import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, A as AdminCardGridSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { u as Plus, l as TicketPercent, Q as Check, a0 as Copy, w as Pencil, v as Trash2 } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
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
async function getCouponsApi(token) {
  const data = await apiFetch("/api/v1/coupons", { token });
  if (!data.success || !Array.isArray(data.coupons)) {
    throw new Error("Invalid coupons response");
  }
  return data.coupons;
}
async function postCouponApi(token, input) {
  const data = await apiFetch("/api/v1/coupons", {
    token,
    method: "POST",
    body: JSON.stringify(input)
  });
  if (!data.success || !data.coupon) throw new Error("Failed to create coupon");
  return data.coupon;
}
async function patchCouponApi(token, id, input) {
  const data = await apiFetch(`/api/v1/coupons/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input)
  });
  if (!data.success || !data.coupon) throw new Error("Failed to update coupon");
  return data.coupon;
}
async function deleteCouponApi(token, id) {
  await apiFetch(`/api/v1/coupons/${id}`, {
    token,
    method: "DELETE"
  });
}
const couponKeys = {
  all: ["coupons"],
  list: () => [...couponKeys.all, "list"]
};
function useCouponsQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: couponKeys.list(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getCouponsApi(token);
    },
    enabled: Boolean(token)
  });
}
function useCreateCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      return postCouponApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    }
  });
}
function useUpdateCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchCouponApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    }
  });
}
function useDeleteCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteCouponApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    }
  });
}
const blank = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  max_uses: 100,
  valid_until: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  active: true
};
function CouponsPage() {
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(blank);
  const [copied, setCopied] = reactExports.useState(null);
  const {
    data: coupons = [],
    isLoading,
    isError
  } = useCouponsQuery();
  const createCoupon = useCreateCouponMutation();
  const updateCoupon = useUpdateCouponMutation();
  const removeCoupon = useDeleteCouponMutation();
  function openCreate() {
    setEditing(null);
    setDraft(blank);
    setOpen(true);
  }
  function openEdit(c) {
    setEditing(c);
    setDraft({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_uses: c.max_uses,
      valid_until: c.valid_until.slice(0, 10),
      active: c.active
    });
    setOpen(true);
  }
  function copy(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }
  function save() {
    const payload = {
      ...draft,
      code: draft.code.trim().toUpperCase()
    };
    if (editing) {
      updateCoupon.mutate({
        id: editing.id,
        input: payload
      }, {
        onSuccess: () => {
          toast.success("Coupon updated");
          setOpen(false);
          setEditing(null);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message)
      });
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => {
          toast.success("Coupon created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message)
      });
    }
  }
  function toggleActive(c) {
    updateCoupon.mutate({
      id: c.id,
      input: {
        active: !c.active
      }
    }, {
      onError: (e) => toast.error(e.message)
    });
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const active = coupons.filter((c) => c.active && c.valid_until >= today).length;
  const expired = coupons.filter((c) => c.valid_until < today).length;
  const totalRedemptions = coupons.reduce((s, c) => s + c.used, 0);
  const saving = createCoupon.isPending || updateCoupon.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 4 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "All coupons" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: true, className: "rounded-full font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New coupon"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminCardGridSkeleton, { count: 6 })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active coupons", value: active, icon: TicketPercent, accent: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Expired", value: expired, icon: TicketPercent, accent: "warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total coupons", value: coupons.length, icon: TicketPercent, accent: "info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Redemptions", value: totalRedemptions, icon: Check, accent: "primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "All coupons" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "rounded-full font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New coupon"
        ] })
      ] }) }),
      isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-12 text-center text-sm text-destructive", children: "Could not load coupons. Is the API running?" }) }) : coupons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-muted-foreground", children: "No coupons yet. Create one for guests to use when booking rooms." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: coupons.map((c) => {
        const isExpired = c.valid_until < today;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => copy(c.code), className: "group flex items-center gap-2 font-mono text-lg font-extrabold tracking-tight", children: [
                c.code,
                copied === c.code ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4 text-muted-foreground group-hover:text-foreground" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: isExpired ? "bg-rose-500/10 text-rose-600" : c.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground", children: isExpired ? "Expired" : c.active ? "Active" : "Paused" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 border-y py-3 text-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold text-base", children: c.discount_type === "percent" ? `${c.discount_value}%` : `Rs ${c.discount_value.toLocaleString("en-PK")}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Discount" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-extrabold text-base", children: [
                c.used,
                "/",
                c.max_uses
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Used" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold text-base", children: new Date(c.valid_until).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Expires" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: c.active, onCheckedChange: () => toggleActive(c) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: c.active ? "Active" : "Paused" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeCoupon.mutate(c.id, {
                onSuccess: () => toast.success("Deleted"),
                onError: (e) => toast.error(e.message)
              }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] })
          ] })
        ] }) }, c.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit coupon" : "New coupon" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.code, onChange: (e) => setDraft({
            ...draft,
            code: e.target.value.toUpperCase()
          }), placeholder: "e.g. SUMMER20" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.description, onChange: (e) => setDraft({
            ...draft,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.discount_type, onValueChange: (v) => setDraft({
              ...draft,
              discount_type: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percent", children: "Percent (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "Fixed (Rs PKR)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: draft.discount_value, onChange: (e) => setDraft({
              ...draft,
              discount_value: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max uses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: draft.max_uses, onChange: (e) => setDraft({
              ...draft,
              max_uses: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valid until" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: draft.valid_until.slice(0, 10), onChange: (e) => setDraft({
              ...draft,
              valid_until: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.active, onCheckedChange: (v) => setDraft({
            ...draft,
            active: v
          }) }),
          "Active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: !draft.code || saving, children: saving ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
export {
  CouponsPage as component
};
