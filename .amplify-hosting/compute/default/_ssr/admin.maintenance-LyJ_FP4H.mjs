import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-fMRf3trd.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, A as AdminCardGridSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { u as useRoomsQuery } from "./useRoomsQuery-CTFHt2Dq.mjs";
import { H as Clock, k as Wrench, x as CircleCheck, Z as TriangleAlert, u as Plus, w as Pencil, v as Trash2, L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
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
import "./room.keys-BMDsz0NU.mjs";
async function getMaintenanceApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  const data = await apiFetch(
    `/api/v1/maintenance${q ? `?${q}` : ""}`,
    { token }
  );
  if (!data.success || !Array.isArray(data.maintenance)) {
    throw new Error("Invalid maintenance list response");
  }
  return { maintenance: data.maintenance, stats: data.stats };
}
async function postMaintenanceApi(token, input) {
  const data = await apiFetch("/api/v1/maintenance", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.maintenance) {
    throw new Error(data.message ?? "Could not create ticket");
  }
  return data.maintenance;
}
async function patchMaintenanceApi(token, id, input) {
  const data = await apiFetch(`/api/v1/maintenance/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.maintenance) {
    throw new Error(data.message ?? "Could not update ticket");
  }
  return data.maintenance;
}
async function deleteMaintenanceApi(token, id) {
  await apiFetch(
    `/api/v1/maintenance/${encodeURIComponent(id)}`,
    { method: "DELETE", token }
  );
}
const maintenanceKeys = {
  all: ["maintenance"],
  list: (params) => [...maintenanceKeys.all, "list", params]
};
function useMaintenanceQuery(params = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: maintenanceKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view maintenance");
      return getMaintenanceApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 3e4
  });
}
function optimisticStatusPatch(queryClient, id, status) {
  queryClient.setQueriesData({ queryKey: maintenanceKeys.all }, (old) => {
    if (!old?.maintenance) return old;
    return {
      ...old,
      maintenance: old.maintenance.map((t) => t.id === id ? { ...t, status } : t)
    };
  });
}
function useCreateMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      return postMaintenanceApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    }
  });
}
function useUpdateMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchMaintenanceApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    }
  });
}
function useUpdateMaintenanceStatusMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => {
      if (!token) throw new Error("You must be signed in");
      return patchMaintenanceApi(token, id, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: maintenanceKeys.all });
      const previous = queryClient.getQueriesData({
        queryKey: maintenanceKeys.all
      });
      optimisticStatusPatch(queryClient, id, status);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    }
  });
}
function useDeleteMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteMaintenanceApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    }
  });
}
const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["open", "in_progress", "resolved", "cancelled"];
const priorityColor = {
  low: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  medium: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  urgent: "bg-rose-500/15 text-rose-600 border-rose-500/30"
};
const blank = {
  room_id: null,
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  assignee: "Unassigned"
};
function MaintenancePage() {
  const [filter, setFilter] = reactExports.useState("all");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(blank);
  const listParams = filter === "all" ? {} : {
    status: filter
  };
  const {
    data,
    isLoading,
    isError
  } = useMaintenanceQuery(listParams);
  const {
    data: roomsData
  } = useRoomsQuery({
    limit: 100
  }, {
    enabled: open
  });
  const createTicket = useCreateMaintenanceMutation();
  const updateTicket = useUpdateMaintenanceMutation();
  const setStatus = useUpdateMaintenanceStatusMutation();
  const remove = useDeleteMaintenanceMutation();
  const items = data?.maintenance ?? [];
  const stats = data?.stats;
  const rooms = roomsData?.rooms ?? [];
  function openCreate() {
    setEditing(null);
    setDraft(blank);
    setOpen(true);
  }
  function openEdit(m) {
    setEditing(m);
    setDraft({
      room_id: m.room_id,
      title: m.title,
      description: m.description,
      priority: m.priority,
      status: m.status,
      assignee: m.assignee
    });
    setOpen(true);
  }
  function handleSave() {
    if (!draft.title.trim()) return;
    const payload = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee.trim() || "Unassigned"
    };
    if (editing) {
      updateTicket.mutate({
        id: editing.id,
        input: payload
      }, {
        onSuccess: () => {
          toast.success("Ticket updated");
          setOpen(false);
          setEditing(null);
          setDraft(blank);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      });
    } else {
      createTicket.mutate(payload, {
        onSuccess: () => {
          toast.success("Ticket created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Create failed")
      });
    }
  }
  const saving = createTicket.isPending || updateTicket.isPending;
  function isSyncedRoomPlaceholder(m) {
    return m.source === "room_status" || m.id.startsWith("room-status-");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 5 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Open", value: stats?.open ?? 0, icon: Clock, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "In progress", value: stats?.in_progress ?? 0, icon: Wrench, accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Rooms offline", value: stats?.rooms_in_maintenance ?? 0, icon: Wrench, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Resolved", value: stats?.resolved ?? 0, icon: CircleCheck, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Urgent", value: stats?.urgent ?? 0, icon: TriangleAlert, accent: "warning" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filter, onValueChange: (v) => setFilter(v), className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "open", children: "Open" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "in_progress", children: "In progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "resolved", children: "Resolved" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "rounded-full font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New ticket"
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminCardGridSkeleton, { count: 6 }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: "Could not load maintenance tickets." }) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-muted-foreground", children: "No tickets here." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: items.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold tracking-tight", children: m.title }),
          m.title.startsWith("Room offline:") || m.source === "room_status" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] font-medium", children: "From room status" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `shrink-0 capitalize ${priorityColor[m.priority]}`, children: m.priority })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground line-clamp-3", children: m.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: m.room_title ?? "Common area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: m.assignee })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: m.status, onValueChange: (v) => setStatus.mutate({
          id: m.id,
          status: v
        }, {
          onError: (err) => toast.error(err instanceof Error ? err.message : "Status update failed")
        }), disabled: setStatus.isPending || isSyncedRoomPlaceholder(m), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(m), disabled: isSyncedRoomPlaceholder(m), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => remove.mutate(m.id, {
            onSuccess: () => toast.success("Ticket deleted"),
            onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed")
          }), disabled: remove.isPending || isSyncedRoomPlaceholder(m), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] })
    ] }) }, m.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit ticket" : "New maintenance ticket" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.title, onChange: (e) => setDraft({
            ...draft,
            title: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: draft.description, onChange: (e) => setDraft({
            ...draft,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Room" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.room_id ?? "none", onValueChange: (v) => setDraft({
              ...draft,
              room_id: v === "none" ? null : v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Common area" }),
                rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.title }, r.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.priority, onValueChange: (v) => setDraft({
              ...draft,
              priority: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, className: "capitalize", children: p }, p)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.status, onValueChange: (v) => setDraft({
              ...draft,
              status: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assignee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.assignee, onChange: (e) => setDraft({
              ...draft,
              assignee: e.target.value
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !draft.title.trim() || saving, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save" })
      ] })
    ] }) })
  ] });
}
export {
  MaintenancePage as component
};
