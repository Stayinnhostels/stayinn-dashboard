import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DUxjSukK.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { S as Sparkles, b as Eye, E as EyeOff, u as Plus, w as Pencil, v as Trash2, $ as LucideIcons } from "../_libs/lucide-react.mjs";
import { b as StatCardsRowSkeleton, A as AdminCardGridSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { S as Skeleton } from "./skeleton-CoUJiN10.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
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
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
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
async function getFacilitiesApi(token) {
  const data = await apiFetch("/api/v1/facilities", { token });
  if (!data.success || !Array.isArray(data.facilities)) {
    throw new Error("Invalid facilities response");
  }
  return {
    facilities: data.facilities,
    missingDefaultCount: data.missing_default_count ?? 0
  };
}
async function postFacilityApi(token, input) {
  const data = await apiFetch("/api/v1/facilities", {
    token,
    method: "POST",
    body: JSON.stringify(input)
  });
  if (!data.success || !data.facility) throw new Error("Failed to create facility");
  return data.facility;
}
async function patchFacilityApi(token, id, input) {
  const data = await apiFetch(`/api/v1/facilities/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input)
  });
  if (!data.success || !data.facility) throw new Error("Failed to update facility");
  return data.facility;
}
async function deleteFacilityApi(token, id) {
  const data = await apiFetch(`/api/v1/facilities/${id}`, {
    token,
    method: "DELETE"
  });
  if (!data.success) throw new Error("Failed to delete facility");
  return data.id;
}
async function seedMissingFacilitiesApi(token) {
  const data = await apiFetch("/api/v1/facilities/seed-missing", {
    method: "POST",
    token
  });
  if (!data.success) throw new Error("Failed to add default facilities");
  return data;
}
const facilityKeys = {
  all: ["facilities"],
  list: () => [...facilityKeys.all, "list"]
};
function useFacilitiesQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: facilityKeys.list(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getFacilitiesApi(token);
    },
    enabled: Boolean(token)
  });
}
function useCreateFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      return postFacilityApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    }
  });
}
function useUpdateFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchFacilityApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    }
  });
}
function useSeedMissingFacilitiesMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("You must be signed in");
      return seedMissingFacilitiesApi(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    }
  });
}
function useDeleteFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteFacilityApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    }
  });
}
const FACILITY_ICON_OPTIONS = [
  "Wifi",
  "UtensilsCrossed",
  "Lock",
  "WashingMachine",
  "Coffee",
  "Sofa",
  "Dumbbell",
  "ShieldCheck",
  "Sparkles",
  "Tv",
  "BookOpen",
  "Bike",
  "Bath",
  "Zap",
  "Droplet",
  "Shirt",
  "Archive",
  "MapPin",
  "Users",
  "Heart"
];
function resolveFacilityIcon(name) {
  const Icon = LucideIcons[name];
  return Icon ?? Sparkles;
}
const blank = {
  title: "",
  description: "",
  icon: "Wifi",
  sort_order: 0,
  is_visible: true
};
function FacilitiesPage() {
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(blank);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const {
    data,
    isLoading,
    isError
  } = useFacilitiesQuery();
  const facilities = data?.facilities ?? [];
  const missingDefaultCount = data?.missingDefaultCount ?? 0;
  const createFacility = useCreateFacilityMutation();
  const updateFacility = useUpdateFacilityMutation();
  const removeFacility = useDeleteFacilityMutation();
  const seedMissing = useSeedMissingFacilitiesMutation();
  const visible = facilities.filter((f) => f.is_visible).length;
  const hidden = facilities.length - visible;
  const saving = createFacility.isPending || updateFacility.isPending;
  function openCreate() {
    setEditing(null);
    setDraft({
      ...blank,
      sort_order: facilities.length
    });
    setOpen(true);
  }
  function openEdit(f) {
    setEditing(f);
    setDraft({
      title: f.title,
      description: f.description,
      icon: f.icon,
      sort_order: f.sort_order,
      is_visible: f.is_visible
    });
    setOpen(true);
  }
  function save() {
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      icon: draft.icon,
      sort_order: Number(draft.sort_order) || 0,
      is_visible: draft.is_visible ?? true
    };
    if (!payload.title || !payload.description) {
      toast.error("Title and description are required");
      return;
    }
    if (editing) {
      updateFacility.mutate({
        id: editing.id,
        input: payload
      }, {
        onSuccess: () => {
          toast.success("Facility updated");
          setOpen(false);
          setEditing(null);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message)
      });
    } else {
      createFacility.mutate(payload, {
        onSuccess: () => {
          toast.success("Facility created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message)
      });
    }
  }
  function toggleVisible(f) {
    updateFacility.mutate({
      id: f.id,
      input: {
        is_visible: !f.is_visible
      }
    }, {
      onSuccess: () => toast.success(f.is_visible ? "Hidden on website" : "Now visible on website"),
      onError: (e) => toast.error(e.message)
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    missingDefaultCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/30 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        missingDefaultCount,
        " standard facilit",
        missingDefaultCount === 1 ? "y is" : "ies are",
        " not in your list yet. The website only shows what is saved here — add them to align with the full set."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "shrink-0 rounded-full font-semibold", disabled: seedMissing.isPending, onClick: () => seedMissing.mutate(void 0, {
        onSuccess: (data2) => toast.success(data2.message ?? `Added ${data2.added} facilities`),
        onError: (e) => toast.error(e.message)
      }), children: seedMissing.isPending ? "Adding…" : "Add missing defaults" })
    ] }) }) : null,
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-28" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32 rounded-full" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminCardGridSkeleton, { count: 6 })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total facilities", value: facilities.length, icon: Sparkles, accent: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Visible on site", value: visible, icon: Eye, accent: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Hidden", value: hidden, icon: EyeOff, accent: "warning" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "All facilities" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "rounded-full font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New facility"
        ] })
      ] }) }),
      isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-12 text-center text-sm text-destructive", children: "Could not load facilities. Is the API running?" }) }) : facilities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-muted-foreground", children: "No facilities yet. Add one to show on the public website." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: facilities.map((f) => {
        const Icon = resolveFacilityIcon(f.icon);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-border/60 ${!f.is_visible ? "opacity-75" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold leading-tight", children: f.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs text-muted-foreground", children: f.description })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: f.is_visible ? "shrink-0 bg-emerald-500/10 text-emerald-600" : "shrink-0 bg-muted text-muted-foreground", children: f.is_visible ? "Visible" : "Hidden" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Order: ",
              f.sort_order
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: f.icon })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.is_visible, onCheckedChange: () => toggleVisible(f) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: f.is_visible ? "Show" : "Hide" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(f), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeleteTarget(f), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] })
          ] })
        ] }) }, f.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: Boolean(deleteTarget), onOpenChange: (v) => !v && setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete facility?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "“",
          deleteTarget?.title,
          "” will be removed from the dashboard and the public website."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: () => {
          if (!deleteTarget) return;
          removeFacility.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Facility deleted");
              setDeleteTarget(null);
            },
            onError: (e) => toast.error(e.message)
          });
        }, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit facility" : "New facility" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.title, onChange: (e) => setDraft({
            ...draft,
            title: e.target.value
          }), placeholder: "e.g. High-Speed WiFi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: draft.description, onChange: (e) => setDraft({
            ...draft,
            description: e.target.value
          }), placeholder: "Short description for the website card" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Icon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.icon, onValueChange: (v) => setDraft({
              ...draft,
              icon: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FACILITY_ICON_OPTIONS.map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sort order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: draft.sort_order ?? 0, onChange: (e) => setDraft({
              ...draft,
              sort_order: Number(e.target.value)
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.is_visible ?? true, onCheckedChange: (v) => setDraft({
            ...draft,
            is_visible: v
          }) }),
          "Visible on website"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: !draft.title.trim() || !draft.description.trim() || saving, children: saving ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
export {
  FacilitiesPage as component
};
