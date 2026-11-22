import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { Check, Ellipsis, Eye, KeyRound, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { InviteDialog } from "@/components/admin/people/invite-dialog";
import { usePeopleAction, useTeamQuery } from "@/queries/users/people";
import { putPermissionsApi, resetPasswordApi, type Person, type Team } from "@/api/users/people.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { cn } from "@/lib/utils";
import { initialsOf } from "./admin.users";

/** Figma 13.03 · Staff — team and what each role can do. */
export const Route = createFileRoute("/admin/staff")({ component: StaffPage });

type StaffRole = "front_desk" | "maintenance" | "accountant";
const COLS: ("super_admin" | StaffRole)[] = ["super_admin", "front_desk", "maintenance", "accountant"];
const COL_LABEL: Record<string, string> = { super_admin: "Super admin", front_desk: "Front desk", maintenance: "Maintenance", accountant: "Accountant" };

function activity(u: Person, me: string | undefined) {
  if (u.id === me) return { text: "Online now", live: true };
  if (!u.password_set && u.invited_at) return { text: "Invited · not joined", live: false };
  if (u.disabled) return { text: "Disabled", live: false };
  if (!u.last_sign_in_at) return { text: "Never signed in", live: false };
  const h = (Date.now() - new Date(u.last_sign_in_at).getTime()) / 3_600_000;
  if (h < 0.25) return { text: "Online now", live: true };
  if (h < 24) return { text: `Active ${Math.max(1, Math.round(h))} h ago`, live: false };
  if (h < 48) return { text: "Active yesterday", live: false };
  return { text: `Active ${new Date(u.last_sign_in_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`, live: false };
}

function StaffPage() {
  const me = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useTeamQuery();
  const save = usePeopleAction((t: string, roles: Partial<Team["permissions"]>) => putPermissionsApi(t, roles));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [draft, setDraft] = useState<Team["permissions"] | null>(null);

  useEffect(() => {
    if (data?.permissions) setDraft(data.permissions);
  }, [data?.permissions]);

  const dirty = useMemo(() => {
    if (!draft || !data) return false;
    return (["front_desk", "maintenance", "accountant"] as StaffRole[]).some((r) => [...(draft[r] ?? [])].sort().join() !== [...(data.permissions?.[r] ?? [])].sort().join());
  }, [draft, data]);
  const canEdit = me?.role === "super_admin" || (me?.permissions ?? []).includes("staff");

  const toggle = (role: StaffRole, area: string) =>
    setDraft((d) => (d ? { ...d, [role]: d[role].includes(area) ? d[role].filter((a) => a !== area) : [...d[role], area] } : d));

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Your team and what each person can do in the dashboard"
        actions={
          <GlassButton onClick={() => setInviteOpen(true)} disabled={!canEdit}>
            <UserPlus aria-hidden /> Invite team member
          </GlassButton>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {isError ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load the team. Is the API running?</div>
        ) : isLoading || !data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[250px] animate-pulse rounded-[22px] bg-glass-inset" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(data.team ?? []).map((u) => (
              <MemberCard key={u.id} u={u} me={me?.id} />
            ))}
          </div>
        )}

        <section className="glass-2 flex flex-col gap-4 rounded-[22px] p-4 md:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-card-title text-ink">What each role can do</p>
              <p className="text-label text-ink-2">{canEdit ? "Tick a box to allow · changes apply on next sign-in" : "Only a super admin can change this"}</p>
            </div>
            {dirty ? (
              <div className="flex gap-2">
                <GlassButton variant="glass" size="sm" className="h-9" onClick={() => setDraft(data?.permissions ?? null)}>
                  Undo
                </GlassButton>
                <GlassButton
                  size="sm"
                  className="h-9"
                  disabled={save.isPending}
                  onClick={() =>
                    draft &&
                    save.mutate(draft, {
                      onSuccess: () => toast.success("Permissions saved"),
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
                    })
                  }
                >
                  {save.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} Save changes
                </GlassButton>
              </div>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-[16px] border border-glass-divider">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="bg-glass-inset/70 text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">
                  <th className="px-4 py-3.5">Area</th>
                  {COLS.map((c) => (
                    <th key={c} className="w-[19%] px-4 py-3.5">
                      {COL_LABEL[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.areas ?? []).map((a) => (
                  <tr key={a.key} className="border-t border-glass-divider">
                    <td className="px-4 py-3.5 text-body font-medium text-ink">{a.label}</td>
                    {COLS.map((c) => {
                      const on = c === "super_admin" ? true : Boolean(draft?.[c]?.includes(a.key));
                      const locked = c === "super_admin" || !canEdit;
                      return (
                        <td key={c} className="px-4 py-3.5">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            aria-label={`${COL_LABEL[c]}: ${a.label}`}
                            disabled={locked}
                            onClick={() => c !== "super_admin" && toggle(c, a.key)}
                            className={cn("flex size-[18px] items-center justify-center rounded-[5px] border transition-colors", on ? "border-brand bg-brand text-on-brand" : "border-ink-2/60 bg-transparent", c === "super_admin" && "opacity-55", !locked && "cursor-pointer")}
                          >
                            {on ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-label text-ink-2">
            Super admin always has full access and can't be changed.
            {data?.permissions_updated_by ? ` Last changed by ${data.permissions_updated_by}.` : ""}
          </p>
        </section>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} team />
    </>
  );
}

function MemberCard({ u, me }: { u: Person; me?: string }) {
  const navigate = useNavigate();
  const reset = usePeopleAction((t: string, id: string) => resetPasswordApi(t, id));
  const a = activity(u, me);
  return (
    <article className="glass-2 flex flex-col gap-3 rounded-[22px] p-4 md:p-5">
      <div className="flex items-center">
        <span className="flex size-9 items-center justify-center text-label font-semibold text-ink">{initialsOf(u.name || u.email)}</span>
        <span className="flex-1" />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger aria-label={`More for ${u.name}`} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink">
            <Ellipsis className="size-4" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className="glass-3 z-50 min-w-[190px] rounded-[14px] p-1 font-geist text-body text-ink shadow-lg">
              <DropdownMenu.Item onSelect={() => void navigate({ to: "/admin/users/$id", params: { id: u.id } })} className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 outline-none data-[highlighted]:bg-glass-inset [&_svg]:size-4">
                <Eye /> Open account
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => reset.mutate(u.id, { onSuccess: () => toast.success(`Password reset link sent to ${u.email}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send") })}
                className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 outline-none data-[highlighted]:bg-glass-inset [&_svg]:size-4"
              >
                <KeyRound /> Send password reset
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      <div className="min-w-0">
        <p className="truncate text-card-title text-ink">{u.name || u.email.split("@")[0]}</p>
        <p className="truncate text-label text-ink-2">{[u.job_title, u.role_label].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(" · ")}</p>
      </div>
      <p className="truncate border-b border-glass-divider pb-3 text-label text-ink-2">{u.email}</p>
      <div>
        <p className="text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase">Can use</p>
        <p className="mt-1.5 truncate text-label font-medium text-ink">{u.can_use}</p>
      </div>
      <p className="flex items-center gap-1.5 text-label text-ink-2">
        <span className={cn("size-1.5 rounded-full", a.live ? "bg-brand" : "bg-ink-2")} aria-hidden />
        {a.text}
      </p>
    </article>
  );
}
