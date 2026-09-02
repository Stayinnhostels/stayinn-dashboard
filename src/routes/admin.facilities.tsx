import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatCard } from "@/components/admin/stat-card";
import { HostelPropertyBadge } from "@/components/admin/hostel-property-badge";
import { Plus, Sparkles, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { AdminCardGridSkeleton, StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useFacilitiesQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useDeleteFacilityMutation,
  useSeedMissingFacilitiesMutation,
} from "@/queries/facilities";
import { FACILITY_ICON_OPTIONS } from "@/lib/facility-icon-options";
import { resolveFacilityIcon } from "@/lib/resolve-facility-icon";
import type { Facility, FacilityInput } from "@/types/domain/facility.types";

export const Route = createFileRoute("/admin/facilities")({ component: FacilitiesPage });

type Draft = FacilityInput;

const blank: Draft = {
  title: "",
  description: "",
  icon: "Wifi",
  sort_order: 0,
  is_visible: true,
};

function FacilitiesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);

  const { data, isLoading, isError } = useFacilitiesQuery();
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
    setDraft({ ...blank, sort_order: facilities.length });
    setOpen(true);
  }

  function openEdit(f: Facility) {
    setEditing(f);
    setDraft({
      title: f.title,
      description: f.description,
      icon: f.icon,
      sort_order: f.sort_order,
      is_visible: f.is_visible,
    });
    setOpen(true);
  }

  function save() {
    const payload: FacilityInput = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      icon: draft.icon,
      sort_order: Number(draft.sort_order) || 0,
      is_visible: draft.is_visible ?? true,
    };
    if (!payload.title || !payload.description) {
      toast.error("Title and description are required");
      return;
    }
    if (editing) {
      updateFacility.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Facility updated");
            setOpen(false);
            setEditing(null);
            setDraft(blank);
          },
          onError: (e) => toast.error(e.message),
        },
      );
    } else {
      createFacility.mutate(payload, {
        onSuccess: () => {
          toast.success("Facility created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message),
      });
    }
  }

  function toggleVisible(f: Facility) {
    updateFacility.mutate(
      { id: f.id, input: { is_visible: !f.is_visible } },
      {
        onSuccess: () =>
          toast.success(f.is_visible ? "Hidden on website" : "Now visible on website"),
        onError: (e) => toast.error(e.message),
      },
    );
  }

  return (
    <div className="space-y-4">
   

      {missingDefaultCount > 0 ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{missingDefaultCount} missing</p>
            <Button
              variant="outline"
              className="shrink-0 rounded-full font-semibold"
              disabled={seedMissing.isPending}
              onClick={() =>
                seedMissing.mutate(undefined, {
                  onSuccess: (data) => toast.success(data.message ?? `Added ${data.added} facilities`),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              {seedMissing.isPending ? "Adding…" : "Add missing defaults"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <>
          <StatCardsRowSkeleton count={3} />
          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </CardContent>
          </Card>
          <AdminCardGridSkeleton count={6} />
        </>
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total facilities" value={facilities.length} icon={Sparkles} accent="primary" />
        <StatCard label="Visible on site" value={visible} icon={Eye} accent="success" />
        <StatCard label="Hidden" value={hidden} icon={EyeOff} accent="warning" />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm font-semibold">All facilities</p>
          <Button onClick={openCreate} className="rounded-full font-semibold">
            <Plus className="h-4 w-4" /> New facility
          </Button>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-sm text-destructive">
            Could not load facilities. Is the API running?
          </CardContent>
        </Card>
      ) : facilities.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No facilities yet. Add one to show on the public website.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {facilities.map((f) => {
            const Icon = resolveFacilityIcon(f.icon);
            return (
              <Card key={f.id} className={`border-border/60 ${!f.is_visible ? "opacity-75" : ""}`}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold leading-tight">{f.title}</h3>
                        <div className="mt-1.5">
                          <HostelPropertyBadge
                            hostelId={f.hostel_id}
                            hostelName={f.hostel_name}
                            showAllProperties={false}
                          />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        f.is_visible
                          ? "shrink-0 bg-emerald-500/10 text-emerald-600"
                          : "shrink-0 bg-muted text-muted-foreground"
                      }
                    >
                      {f.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>Order: {f.sort_order}</span>
                    <span className="font-mono">{f.icon}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Switch checked={f.is_visible} onCheckedChange={() => toggleVisible(f)} />
                      <span className="text-muted-foreground">{f.is_visible ? "Show" : "Hide"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(f)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete facility?</AlertDialogTitle>
            <AlertDialogDescription>Delete “{deleteTarget?.title}”?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteTarget) return;
                removeFacility.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success("Facility deleted");
                    setDeleteTarget(null);
                  },
                  onError: (e) => toast.error(e.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit facility" : "New facility"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label required>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. High-Speed WiFi"
              />
            </div>
            <div className="grid gap-1.5">
              <Label required>Description</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Short description for the website card"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Icon</Label>
                <Select value={draft.icon} onValueChange={(v) => setDraft({ ...draft, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_ICON_OPTIONS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={draft.sort_order ?? 0}
                  onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.is_visible ?? true}
                onCheckedChange={(v) => setDraft({ ...draft, is_visible: v })}
              />
              Visible on website
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.title.trim() || !draft.description.trim() || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
