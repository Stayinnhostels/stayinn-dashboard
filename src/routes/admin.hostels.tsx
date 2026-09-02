import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, MapPin, PauseCircle, Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminCardGridSkeleton } from "@/components/admin/admin-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useCreateHostelMutation,
  useHostelsQuery,
  usePauseHostelMutation,
  useUpdateHostelMutation,
} from "@/queries/hostels";
import type { Hostel, HostelInput } from "@/types/domain/hostel.types";

export const Route = createFileRoute("/admin/hostels")({ component: HostelsPage });

type Draft = HostelInput & { latitude: string; longitude: string };

const blank: Draft = {
  name: "",
  slug: "",
  status: "active",
  is_default: false,
  address: "",
  city: "",
  area: "",
  country: "",
  phone: "",
  email: "",
  whatsapp: "",
  map_url: "",
  latitude: "",
  longitude: "",
};

function hostelToDraft(hostel: Hostel): Draft {
  return {
    name: hostel.name,
    slug: hostel.slug,
    status: hostel.status,
    is_default: hostel.is_default,
    address: hostel.address,
    city: hostel.city,
    area: hostel.area,
    country: hostel.country,
    phone: hostel.phone,
    email: hostel.email,
    whatsapp: hostel.whatsapp,
    map_url: hostel.map_url,
    latitude: hostel.latitude != null ? String(hostel.latitude) : "",
    longitude: hostel.longitude != null ? String(hostel.longitude) : "",
  };
}

function draftToInput(draft: Draft): HostelInput {
  const lat = draft.latitude.trim() ? Number(draft.latitude) : null;
  const lng = draft.longitude.trim() ? Number(draft.longitude) : null;
  return {
    name: draft.name.trim(),
    slug: draft.slug?.trim() || undefined,
    status: draft.status,
    is_default: draft.is_default ?? false,
    address: draft.address?.trim() ?? "",
    city: draft.city?.trim() ?? "",
    area: draft.area?.trim() ?? "",
    country: draft.country?.trim() ?? "",
    phone: draft.phone?.trim() ?? "",
    email: draft.email?.trim() ?? "",
    whatsapp: draft.whatsapp?.trim() ?? "",
    map_url: draft.map_url?.trim() ?? "",
    latitude: lat != null && Number.isFinite(lat) ? lat : null,
    longitude: lng != null && Number.isFinite(lng) ? lng : null,
  };
}

function statusLabel(status: Hostel["status"]) {
  return status === "active" ? "Active" : "Paused";
}

function HostelsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Hostel | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [formError, setFormError] = useState<string | null>(null);
  const [pauseTarget, setPauseTarget] = useState<Hostel | null>(null);

  const { data, isLoading, isError } = useHostelsQuery();
  const createHostel = useCreateHostelMutation();
  const updateHostel = useUpdateHostelMutation();
  const pauseHostel = usePauseHostelMutation();
  const hostels = data?.hostels ?? [];
  const activeCount = hostels.filter((h) => h.status === "active").length;
  const saving = createHostel.isPending || updateHostel.isPending;

  function openCreate() {
    setEditing(null);
    setDraft(blank);
    setFormError(null);
    setOpen(true);
  }

  function openEdit(hostel: Hostel) {
    setEditing(hostel);
    setDraft(hostelToDraft(hostel));
    setFormError(null);
    setOpen(true);
  }

  function save() {
    setFormError(null);
    if (!draft.name.trim()) {
      toast.error("Property name is required");
      return;
    }
    const payload = draftToInput(draft);
    const onError = (e: Error) => {
      toast.error(e.message);
      setFormError(e.message);
    };
    if (editing) {
      updateHostel.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Property updated");
            setOpen(false);
            setEditing(null);
            setDraft(blank);
            setFormError(null);
          },
          onError,
        },
      );
    } else {
      createHostel.mutate(payload, {
        onSuccess: () => {
          toast.success("Property created");
          setOpen(false);
          setDraft(blank);
          setFormError(null);
        },
        onError,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage separate hostel locations. Pausing a property hides it on the public website but
            keeps all rooms, bookings, and records visible here in the dashboard.
          </p>
        </div>
        <Button className="rounded-full font-semibold" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add property
        </Button>
      </div>

      {isLoading ? (
        <AdminCardGridSkeleton count={2} />
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Could not load properties. Check that the backend is running.
          </CardContent>
        </Card>
      ) : hostels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No properties yet. Add your first hostel.</p>
            <Button onClick={openCreate}>Add property</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hostels.map((hostel) => (
            <Card
              key={hostel.id}
              className={`border-border/60 ${hostel.status === "inactive" ? "opacity-90" : ""}`}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{hostel.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{hostel.slug}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                    {hostel.is_default ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Default
                      </Badge>
                    ) : null}
                    <Badge
                      variant="outline"
                      className={
                        hostel.status === "active"
                          ? "border-emerald-500/30 text-emerald-600"
                          : "border-amber-500/30 text-amber-700"
                      }
                    >
                      {statusLabel(hostel.status)}
                    </Badge>
                  </div>
                </div>
                {(hostel.city || hostel.address) && (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">
                      {[hostel.address, hostel.city, hostel.country].filter(Boolean).join(", ")}
                    </span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {hostel.latitude != null && hostel.longitude != null
                    ? `Location: ${hostel.latitude.toFixed(4)}, ${hostel.longitude.toFixed(4)}`
                    : "No coordinates — add lat/lng for nearest-hostel search on the website"}
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => openEdit(hostel)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                {hostel.status === "active" && activeCount > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-amber-700 hover:text-amber-800"
                    onClick={() => setPauseTarget(hostel)}
                  >
                    <PauseCircle className="mr-2 h-3.5 w-3.5" />
                    Pause
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(pauseTarget)} onOpenChange={(o) => !o && setPauseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause {pauseTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This property will be hidden on the public website — its rooms will not appear and
              new bookings will be blocked. Nothing is deleted: rooms, bookings, residents, and
              payments stay in the dashboard exactly as they are. You can restore it anytime by
              setting status back to Active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                if (!pauseTarget) return;
                pauseHostel.mutate(pauseTarget.id, {
                  onSuccess: () => {
                    toast.success(`${pauseTarget.name} paused — hidden on website`);
                    setPauseTarget(null);
                  },
                  onError: (e) => toast.error(e.message),
                });
              }}
            >
              Pause property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit property" : "Add property"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="hostel-name">Name</Label>
              <Input
                id="hostel-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Stay Inn Gulberg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hostel-slug">URL slug (optional)</Label>
              <Input
                id="hostel-slug"
                value={draft.slug ?? ""}
                onChange={(e) => {
                  setFormError(null);
                  setDraft((d) => ({ ...d, slug: e.target.value }));
                }}
                placeholder="gulberg"
                aria-invalid={Boolean(formError?.toLowerCase().includes("slug"))}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only (e.g. gulberg, hostel-2)
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={draft.status ?? "active"}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    status: v as Draft["status"],
                    ...(v === "inactive" ? { is_default: false } : {}),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Paused (hidden on website)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 ${
                draft.status === "inactive" ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              <Checkbox
                checked={draft.is_default ?? false}
                disabled={draft.status === "inactive"}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, is_default: checked === true }))
                }
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">Default property</span>
                <span className="block text-xs text-muted-foreground">
                  Optional. Used for new rooms and as the fallback when no property is selected.
                  Setting this removes the default flag from the previous property.
                </span>
              </span>
            </label>
            <div className="grid gap-2">
              <Label htmlFor="hostel-address">Address</Label>
              <Input
                id="hostel-address"
                value={draft.address ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="hostel-city">City</Label>
                <Input
                  id="hostel-city"
                  value={draft.city ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hostel-area">Area</Label>
                <Input
                  id="hostel-area"
                  value={draft.area ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="hostel-lat">Latitude</Label>
                <Input
                  id="hostel-lat"
                  inputMode="decimal"
                  value={draft.latitude}
                  onChange={(e) => setDraft((d) => ({ ...d, latitude: e.target.value }))}
                  placeholder="31.5204"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hostel-lng">Longitude</Label>
                <Input
                  id="hostel-lng"
                  inputMode="decimal"
                  value={draft.longitude}
                  onChange={(e) => setDraft((d) => ({ ...d, longitude: e.target.value }))}
                  placeholder="74.3587"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="hostel-phone">Phone</Label>
                <Input
                  id="hostel-phone"
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hostel-email">Email</Label>
                <Input
                  id="hostel-email"
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Skeleton className="h-4 w-16" /> : editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
