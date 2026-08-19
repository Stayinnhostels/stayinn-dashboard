import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { compressAvatarFile } from "@/lib/compress-image";
import { useUpdateProfileMutation } from "@/queries/auth";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function AdminProfileSettingsCard() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfileMutation();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.fullName ?? "");
  const [preview, setPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [dirtyAvatar, setDirtyAvatar] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    setName(user?.fullName ?? "");
    if (!dirtyAvatar) {
      setPreview(user?.avatarUrl ?? null);
    }
  }, [user?.fullName, user?.avatarUrl, dirtyAvatar]);

  const initials = initialsFromName(name || user?.fullName || "Admin");
  const displayPhoto = preview || undefined;
  const busy = updateProfile.isPending || compressing;

  async function onPickFile(file: File | null) {
    if (!file) return;
    try {
      setCompressing(true);
      const dataUrl = await compressAvatarFile(file);
      setPreview(dataUrl);
      setDirtyAvatar(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process photo");
    } finally {
      setCompressing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearPhoto() {
    setPreview(null);
    setDirtyAvatar(true);
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    updateProfile.mutate(
      {
        name: trimmed,
        ...(dirtyAvatar ? { avatar: preview || "" } : {}),
      },
      {
        onSuccess: () => {
          setDirtyAvatar(false);
          toast.success("Profile updated");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save profile"),
      },
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Admin profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border border-border/60">
            {displayPhoto ? <AvatarImage src={displayPhoto} alt={name || "Admin"} className="object-cover" /> : null}
            <AvatarFallback className="bg-muted text-lg font-semibold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                {compressing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" /> Upload photo
                  </>
                )}
              </Button>
              {(preview || user?.avatarUrl) && (
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={clearPhoto}>
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-profile-name" required>Display name</Label>
            <Input
              id="admin-profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" disabled={busy || !name.trim()} onClick={save}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <UserRound className="h-4 w-4" /> Save profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
