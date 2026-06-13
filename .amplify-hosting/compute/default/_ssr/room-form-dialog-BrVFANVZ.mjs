import { u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { r as roomKeys } from "./room.keys-BMDsz0NU.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { S as Skeleton } from "./skeleton-CoUJiN10.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { C as Checkbox } from "./checkbox-Bd1q64ph.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogDescription, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { X, a6 as ImagePlus } from "../_libs/lucide-react.mjs";
function roomPricesToApi(draft) {
  const usd = Number(draft.price_per_night_usd ?? draft.price_per_night);
  const pkr = Number(draft.price_per_night_pkr ?? draft.price_per_night);
  return {
    price_per_night_usd: usd,
    price_per_night_pkr: pkr,
    price_per_night: Number.isFinite(usd) ? usd : 0
  };
}
function roomDraftToApiBody(draft) {
  const prices = roomPricesToApi(draft);
  const body = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    ...prices,
    status: draft.status,
    category: draft.category.trim(),
    capacity: draft.capacity,
    beds_total: draft.beds_total,
    beds_available: draft.beds_available,
    amenities: draft.amenities,
    images: draft.images
  };
  if (draft.badge?.trim()) body.badge = draft.badge.trim();
  return body;
}
const PATCH_KEYS = [
  "title",
  "description",
  "price_per_night",
  "price_per_night_usd",
  "price_per_night_pkr",
  "status",
  "category",
  "capacity",
  "beds_total",
  "beds_available",
  "amenities",
  "images",
  "badge"
];
function roomDraftToPatchPayload(draft) {
  if ("title" in draft && draft.title !== void 0 && typeof draft.title === "string") {
    return roomDraftToApiBody(draft);
  }
  const partial = {};
  for (const key of PATCH_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(draft, key)) continue;
    const value = draft[key];
    if (key === "badge" && (value === null || value === "")) {
      partial.badge = null;
    } else if (value !== void 0) {
      partial[key] = value;
    }
  }
  if (Object.prototype.hasOwnProperty.call(draft, "price_per_night_usd") || Object.prototype.hasOwnProperty.call(draft, "price_per_night_pkr") || Object.prototype.hasOwnProperty.call(draft, "price_per_night")) {
    Object.assign(partial, roomPricesToApi(draft));
  }
  return partial;
}
async function postRoomApi(token, draft) {
  const data = await apiFetch("/api/v1/rooms", {
    method: "POST",
    token,
    body: JSON.stringify(roomDraftToApiBody(draft))
  });
  if (!data.success || !data.room) {
    throw new Error(data.message ?? "Failed to create room");
  }
  return data.room;
}
async function patchRoomApi(token, id, draft) {
  const payload = roomDraftToPatchPayload(draft);
  const data = await apiFetch(`/api/v1/rooms/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
  if (!data.success || !data.room) {
    throw new Error(data.message ?? "Failed to update room");
  }
  return data.room;
}
async function deleteRoomApi(token, id) {
  await apiFetch(
    `/api/v1/rooms/${encodeURIComponent(id)}`,
    { method: "DELETE", token }
  );
}
function useRoomToken() {
  return useAuthStore((s) => s.token);
}
function useCreateRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft) => {
      if (!token) throw new Error("You must be signed in to create a room");
      return postRoomApi(token, draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    }
  });
}
function useUpdateRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, draft }) => {
      if (!token) throw new Error("You must be signed in to update a room");
      return patchRoomApi(token, id, draft);
    },
    onSuccess: (room, { id }) => {
      queryClient.setQueryData(roomKeys.detail(id), room);
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    }
  });
}
function useDeleteRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in to delete a room");
      return deleteRoomApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    }
  });
}
function useDeleteRoomsMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      if (!token) throw new Error("You must be signed in to delete rooms");
      await Promise.all(ids.map((id) => deleteRoomApi(token, id)));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    }
  });
}
function useBulkRoomStatusMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }) => {
      if (!token) throw new Error("You must be signed in to update rooms");
      await Promise.all(ids.map((id) => patchRoomApi(token, id, { status })));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    }
  });
}
const LIST_SKELETON_COUNT = 8;
function RoomsGridSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: LIST_SKELETON_COUNT }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[4/3] w-full rounded-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-3/4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 flex-1 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" })
      ] })
    ] })
  ] }, i)) });
}
function RoomsTableSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "USD / PKR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beds" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.from({ length: LIST_SKELETON_COUNT }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-24" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-12" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20 rounded-full" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" })
      ] }) })
    ] }, i)) })
  ] }) }) });
}
function RoomsListSkeleton({ view }) {
  return view === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsGridSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsTableSkeleton, {});
}
function RoomDetailSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-36 rounded-md" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-36 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24 rounded-md" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-video w-full rounded-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-2/3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20 rounded-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-28" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-full" }),
        Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded-md" })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded-md" })
      ] }) })
    ] })
  ] });
}
const MAX_WIDTH = 1280;
const MAX_DATA_URL_LENGTH = 5e5;
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
async function compressImageFile(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image`);
  }
  const source = await readFileAsDataUrl(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Could not load ${file.name}`));
    img.src = source;
  });
}
const ROOM_STATUS_OPTIONS = ["available", "full", "maintenance", "draft"];
const roomStatusStyles = {
  available: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  full: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  maintenance: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  draft: "bg-muted text-muted-foreground border-border"
};
function formatRoomStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
const ROOM_CATEGORIES = ["2 Seater", "3 Seater", "4 Seater", "Private"];
const ROOM_AMENITY_OPTIONS = [
  "Attached Bathroom",
  "Common Bathroom",
  "AC",
  "WiFi",
  "Study Table",
  "Desk",
  "Wardrobe",
  "Laundry",
  "Power Backup",
  "Lockers",
  "Common Lounge",
  "Mini Fridge",
  "Kitchenette",
  "TV",
  "Balcony"
];
const blank = {
  title: "",
  description: "",
  price_per_night: 0,
  price_per_night_usd: 0,
  price_per_night_pkr: 0,
  status: "draft",
  category: "2 Seater",
  capacity: 2,
  beds_total: 2,
  beds_available: 2,
  amenities: [],
  images: [],
  badge: null
};
function roomToDraft(room) {
  if (!room) return blank;
  return {
    title: room.title ?? "",
    description: room.description ?? "",
    price_per_night: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_usd: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_pkr: room.price_per_night_pkr ?? room.price_per_night ?? 0,
    status: room.status ?? "draft",
    category: room.category ?? "2 Seater",
    capacity: room.capacity ?? 1,
    beds_total: room.beds_total ?? 1,
    beds_available: room.beds_available ?? 1,
    amenities: (room.amenities ?? []).filter((a) => a.trim() && a.trim().toLowerCase() !== "none"),
    images: room.images ?? [],
    badge: room.badge ?? null
  };
}
function parsePositiveInt(value, fallback = 0) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}
function RoomFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitting
}) {
  const [draft, setDraft] = reactExports.useState(blank);
  const [priceUsdText, setPriceUsdText] = reactExports.useState("0");
  const [pricePkrText, setPricePkrText] = reactExports.useState("0");
  const [capacityText, setCapacityText] = reactExports.useState("2");
  const [bedsTotalText, setBedsTotalText] = reactExports.useState("2");
  const [bedsAvailableText, setBedsAvailableText] = reactExports.useState("2");
  const isEdit = Boolean(initial?.id);
  reactExports.useEffect(() => {
    if (!open) return;
    const next = roomToDraft(initial);
    setDraft(next);
    setPriceUsdText(String(next.price_per_night_usd));
    setPricePkrText(String(next.price_per_night_pkr));
    setCapacityText(String(next.capacity));
    setBedsTotalText(String(next.beds_total));
    setBedsAvailableText(String(next.beds_available));
  }, [open, initial]);
  const amenityOptions = reactExports.useMemo(() => {
    const base = [...ROOM_AMENITY_OPTIONS];
    for (const a of draft.amenities) {
      if (!base.includes(a)) base.push(a);
    }
    return base.sort((a, b) => a.localeCompare(b));
  }, [draft.amenities]);
  const parsed = reactExports.useMemo(() => {
    const priceUsdNum = Number(priceUsdText);
    const pricePkrNum = Number(pricePkrText);
    const capacityNum = parsePositiveInt(capacityText, 0);
    const bedsTotalNum = parsePositiveInt(bedsTotalText, 0);
    const bedsAvailableNum = parsePositiveInt(bedsAvailableText, 0);
    return { priceUsdNum, pricePkrNum, capacityNum, bedsTotalNum, bedsAvailableNum };
  }, [priceUsdText, pricePkrText, capacityText, bedsTotalText, bedsAvailableText]);
  const canSave = draft.title.trim().length > 0 && draft.category.trim().length > 0 && priceUsdText.trim() !== "" && pricePkrText.trim() !== "" && Number.isFinite(parsed.priceUsdNum) && parsed.priceUsdNum >= 0 && Number.isFinite(parsed.pricePkrNum) && parsed.pricePkrNum >= 0 && parsed.capacityNum >= 1 && parsed.bedsTotalNum >= 1 && parsed.bedsAvailableNum >= 0 && parsed.bedsAvailableNum <= parsed.bedsTotalNum;
  function toggleAmenity(name, checked) {
    setDraft((d) => ({
      ...d,
      amenities: checked ? d.amenities.includes(name) ? d.amenities : [...d.amenities, name] : d.amenities.filter((a) => a !== name)
    }));
  }
  function handleSubmit() {
    if (!canSave) return;
    onSubmit({
      ...draft,
      price_per_night_usd: parsed.priceUsdNum,
      price_per_night_pkr: parsed.pricePkrNum,
      price_per_night: parsed.priceUsdNum,
      capacity: parsed.capacityNum,
      beds_total: parsed.bedsTotalNum,
      beds_available: parsed.bedsAvailableNum
    });
  }
  async function handleUpload(files) {
    if (!files || files.length === 0) return;
    try {
      const urls = await Promise.all(Array.from(files).map((f) => compressImageFile(f)));
      setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add image");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? "Edit room" : "Add room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Set room details, pricing, capacity and photos." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            name: "room-title",
            type: "text",
            autoComplete: "off",
            value: draft.title,
            onChange: (e) => setDraft({ ...draft, title: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: draft.description,
            onChange: (e) => setDraft({ ...draft, description: e.target.value }),
            rows: 3
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price / seat / month (USD)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              inputMode: "decimal",
              value: priceUsdText,
              onChange: (e) => setPriceUsdText(e.target.value),
              placeholder: "e.g. 120"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Shown to international guests" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price / seat / month (PKR)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              inputMode: "decimal",
              value: pricePkrText,
              onChange: (e) => setPricePkrText(e.target.value),
              placeholder: "e.g. 35000"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Shown to Pakistan region" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.category, onValueChange: (v) => setDraft({ ...draft, category: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROOM_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              inputMode: "numeric",
              value: capacityText,
              onChange: (e) => setCapacityText(e.target.value),
              placeholder: "e.g. 2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Beds total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              inputMode: "numeric",
              value: bedsTotalText,
              onChange: (e) => setBedsTotalText(e.target.value),
              placeholder: "e.g. 2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Beds available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              inputMode: "numeric",
              value: bedsAvailableText,
              onChange: (e) => setBedsAvailableText(e.target.value),
              placeholder: "e.g. 1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.status, onValueChange: (v) => setDraft({ ...draft, status: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "available", children: "Available" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "maintenance", children: "Maintenance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" })
            ] })
          ] })
        ] })
      ] }),
      !canSave && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Check USD & PKR prices, capacity, and beds (available cannot exceed total)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Badge (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            value: draft.badge ?? "",
            onChange: (e) => setDraft({ ...draft, badge: e.target.value.trim() || null }),
            placeholder: "e.g. Most Popular"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amenities" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select amenities for this room." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3", children: amenityOptions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: draft.amenities.includes(a), onCheckedChange: (c) => toggleAmenity(a, !!c) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: a })
        ] }, a)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Images" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Uploads are compressed automatically. For many large photos, paste HTTPS image URLs below." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: [
          draft.images.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square overflow-hidden rounded-lg border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "h-full w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) }),
                className: "absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }, src + i)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => handleUpload(e.target.files) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            placeholder: "Paste image URL and press Enter",
            onKeyDown: (e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const url = e.target.value.trim();
              if (!url) return;
              setDraft((d) => ({ ...d, images: [...d.images, url] }));
              e.target.value = "";
            }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: submitting || !canSave, children: submitting ? "Saving…" : isEdit ? "Save changes" : "Create room" })
    ] })
  ] }) });
}
export {
  RoomsListSkeleton as R,
  useUpdateRoomMutation as a,
  useDeleteRoomMutation as b,
  useDeleteRoomsMutation as c,
  useBulkRoomStatusMutation as d,
  RoomFormDialog as e,
  ROOM_AMENITY_OPTIONS as f,
  RoomDetailSkeleton as g,
  formatRoomStatus as h,
  ROOM_STATUS_OPTIONS as i,
  roomStatusStyles as r,
  useCreateRoomMutation as u
};
