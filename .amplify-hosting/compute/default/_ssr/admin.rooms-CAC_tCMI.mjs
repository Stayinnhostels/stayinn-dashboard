import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { f as useMatch, O as Outlet, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DUxjSukK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { C as Checkbox } from "./checkbox-Bd1q64ph.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-fMRf3trd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCreateRoomMutation, a as useUpdateRoomMutation, b as useDeleteRoomMutation, c as useDeleteRoomsMutation, d as useBulkRoomStatusMutation, R as RoomsListSkeleton, r as roomStatusStyles, e as RoomFormDialog } from "./room-form-dialog-BrVFANVZ.mjs";
import { u as useRoomsQuery } from "./useRoomsQuery-CTFHt2Dq.mjs";
import { r as roomKeys } from "./room.keys-BMDsz0NU.mjs";
import { o as Search, p as LayoutGrid, q as List, u as Plus, v as Trash2, B as BedDouble, b as Eye, w as Pencil } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./router-CXpZMrmV.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./label-JU3yqRBo.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "./textarea-DSyJ1nlY.mjs";
import "./dialog-SXOy8WpB.mjs";
const PAGE_SIZE = 12;
const statusVariants = roomStatusStyles;
function RoomsAdminPage() {
  const detailMatch = useMatch({
    from: "/admin/rooms/$id",
    shouldThrow: false
  });
  if (detailMatch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsListPage, {});
}
function RoomsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [view, setView] = reactExports.useState("grid");
  const [page, setPage] = reactExports.useState(1);
  const [editing, setEditing] = reactExports.useState(null);
  const [creating, setCreating] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [bulkDelete, setBulkDelete] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const listParams = reactExports.useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...statusFilter !== "all" ? {
      status: statusFilter
    } : {},
    ...query.trim() ? {
      search: query.trim()
    } : {}
  }), [page, statusFilter, query]);
  const {
    data,
    isLoading,
    isError,
    error
  } = useRoomsQuery(listParams);
  const rooms = data?.rooms ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;
  const createRoom = useCreateRoomMutation();
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();
  const deleteRooms = useDeleteRoomsMutation();
  const bulkStatus = useBulkRoomStatusMutation();
  const saving = createRoom.isPending || updateRoom.isPending;
  function handleSave(values) {
    if (editing?.id) {
      updateRoom.mutate({
        id: editing.id,
        draft: values
      }, {
        onSuccess: () => {
          toast.success("Room updated");
          setEditing(null);
          setCreating(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
      });
    } else {
      createRoom.mutate(values, {
        onSuccess: async () => {
          setEditing(null);
          setCreating(false);
          setQuery("");
          setStatusFilter("all");
          setPage(1);
          setSelected(/* @__PURE__ */ new Set());
          await queryClient.invalidateQueries({
            queryKey: roomKeys.all
          });
          navigate({
            to: "/admin/rooms",
            replace: true
          });
          toast.success("Room created");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed")
      });
    }
  }
  function handleDelete(ids) {
    if (ids.length === 1) {
      deleteRoom.mutate(ids[0], {
        onSuccess: () => {
          toast.success("Room deleted");
          setDeleteId(null);
          setBulkDelete(false);
          setSelected(/* @__PURE__ */ new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed")
      });
    } else {
      deleteRooms.mutate(ids, {
        onSuccess: () => {
          toast.success(`${ids.length} rooms deleted`);
          setDeleteId(null);
          setBulkDelete(false);
          setSelected(/* @__PURE__ */ new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed")
      });
    }
  }
  function toggleAll(checked) {
    setSelected(checked ? new Set(rooms.map((r) => r.id)) : /* @__PURE__ */ new Set());
  }
  function toggleOne(id, checked) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { name: "rooms-search", autoComplete: "off", value: query, onChange: (e) => {
          setQuery(e.target.value);
          setPage(1);
        }, placeholder: "Search rooms…", className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "available", children: "Available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "maintenance", children: "Maintenance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: view, onValueChange: (v) => setView(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "grid", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "table", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreating(true), className: "rounded-full font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add room"
      ] })
    ] }) }),
    selected.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/30 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
        selected.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => bulkStatus.mutate({
        ids: [...selected],
        status: v
      }, {
        onSuccess: () => {
          toast.success("Status updated");
          setSelected(/* @__PURE__ */ new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Set status…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "available", children: "Available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "maintenance", children: "Maintenance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", onClick: () => setBulkDelete(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
        " Delete selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelected(/* @__PURE__ */ new Set()), children: "Clear" })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsListSkeleton, { view }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: error instanceof Error ? error.message : "Failed to load rooms" }) }) : rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "mx-auto h-12 w-12 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-bold", children: "No rooms found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Try clearing filters or add your first room." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreating(true), className: "mt-4 rounded-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add room"
      ] })
    ] }) }) : view === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 transition-shadow hover:shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] bg-muted", children: [
        r.images?.[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.images[0], alt: r.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "h-12 w-12 text-muted-foreground/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-2 top-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.has(r.id), onCheckedChange: (c) => toggleOne(r.id, !!c), className: "bg-background/80" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `absolute right-2 top-2 capitalize ${statusVariants[r.status]}`, children: r.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-bold tracking-tight", title: r.title, children: r.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          r.category,
          " · ",
          r.capacity,
          " guests"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-extrabold", children: [
            "$",
            Number(r.price_per_night_usd ?? r.price_per_night).toLocaleString(),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "USD" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-muted-foreground", children: [
            "Rs ",
            Number(r.price_per_night_pkr ?? r.price_per_night).toLocaleString(),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal", children: "PKR" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            r.beds_available,
            "/",
            r.beds_total,
            " beds"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/rooms/$id", params: {
            id: r.id
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
            " View"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] })
      ] })
    ] }, r.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.size > 0 && selected.size === rooms.length, onCheckedChange: (c) => toggleAll(!!c) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "USD / PKR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beds" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.has(r.id), onCheckedChange: (c) => toggleOne(r.id, !!c) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[220px] font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate", title: r.title, children: r.title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "$",
            Number(r.price_per_night_usd ?? r.price_per_night).toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
            "Rs ",
            Number(r.price_per_night_pkr ?? r.price_per_night).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          r.beds_available,
          "/",
          r.beds_total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `capitalize ${statusVariants[r.status]}`, children: r.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "icon", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/rooms/$id", params: {
            id: r.id
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }, r.id)) })
    ] }) }) }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Previous" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Page ",
        page,
        " of ",
        totalPages,
        pagination ? ` · ${pagination.total} rooms` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page >= totalPages, onClick: () => setPage((p) => p + 1), children: "Next" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoomFormDialog, { open: creating || !!editing, initial: editing, onClose: () => {
      setCreating(false);
      setEditing(null);
    }, onSubmit: handleSave, submitting: saving }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteId || bulkDelete, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        setBulkDelete(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: bulkDelete ? `Delete ${selected.size} rooms?` : "Delete this room?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => handleDelete(bulkDelete ? [...selected] : deleteId ? [deleteId] : []), children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  RoomsAdminPage as component
};
