import { useEffect, useState } from "react";
import { Check, Copy, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { DepositModal } from "@/components/admin/security/deposit-shared";
import { FinDialogHeader, finInput, finLabel } from "@/components/admin/finance/finance-kit";
import { usePeopleAction } from "@/queries/users/people";
import { inviteUserApi } from "@/api/users/people.api";
import { ROLE_LABEL } from "@/lib/staff-access";
import { cn } from "@/lib/utils";

const ROLE_HINT: Record<string, string> = {
  user: "Books and pays on the website",
  front_desk: "Bookings, residents and payments",
  maintenance: "Maintenance tickets only",
  accountant: "Money and reports",
  super_admin: "Everything, including staff",
};

/** Invite a guest or a team member — they get an email with a link to set their password. */
export function InviteDialog({ open, onOpenChange, team }: { open: boolean; onOpenChange: (o: boolean) => void; team?: boolean }) {
  const invite = usePeopleAction(inviteUserApi);
  const roles = team ? ["front_desk", "maintenance", "accountant", "super_admin"] : ["user", "front_desk", "maintenance", "accountant", "super_admin"];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [jobTitle, setJobTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRole(team ? "front_desk" : "user");
    setJobTitle("");
    setErr(null);
    setLink(null);
  }, [open, team]);

  const submit = () => {
    if (!name.trim()) return setErr("Add their name");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter a valid email");
    invite.mutate(
      { name: name.trim(), email: email.trim(), role, job_title: jobTitle.trim() || undefined },
      {
        onSuccess: (r) => {
          const res = r as { emailed?: boolean; invite_link?: string | null };
          if (res.emailed) {
            toast.success(`Invite sent to ${email.trim()}`);
            onOpenChange(false);
          } else if (res.invite_link) {
            setLink(res.invite_link);
          } else {
            toast.success("Account created — email isn't set up, so no invite was sent");
            onOpenChange(false);
          }
        },
        onError: (e) => setErr(e instanceof Error ? e.message : "Could not send the invite"),
      },
    );
  };

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={560}>
      <FinDialogHeader icon={<UserPlus />} title={team ? "Invite team member" : "Invite user"} sub="They get an email with a link to set their password" />
      {link ? (
        <div className="flex flex-col gap-4 px-5 py-5 md:px-6">
          <p className="text-body text-ink">The account is ready, but the email could not be sent. Share this link with {name.split(" ")[0]} — it works for 7 days:</p>
          <div className="flex items-center gap-2 rounded-[12px] bg-glass-inset px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-label text-ink-2">{link}</span>
            <GlassButton size="sm" variant="glass" onClick={() => void navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))}>
              <Copy aria-hidden /> Copy
            </GlassButton>
          </div>
          <GlassButton className="self-end" onClick={() => onOpenChange(false)}>
            Done
          </GlassButton>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 md:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Bilal Raza" className={finInput} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bilal@stayinn.pk" className={finInput} />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <span className={finLabel}>Role</span>
              <div role="radiogroup" aria-label="Role" className="grid gap-2 sm:grid-cols-2">
                {roles.map((r) => (
                  <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={cn("flex cursor-pointer flex-col items-start gap-0.5 rounded-[12px] border px-3 py-2.5 text-left transition-colors", role === r ? "border-ink bg-glass-3" : "border-glass-stroke bg-glass-inset hover:border-ink-3")}>
                    <span className="text-body font-medium text-ink">{ROLE_LABEL[r]}</span>
                    <span className="text-label text-ink-2">{ROLE_HINT[r]}</span>
                  </button>
                ))}
              </div>
            </div>
            {role !== "user" ? (
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>Job title (optional)</span>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} maxLength={80} placeholder="Front desk" className={finInput} />
              </label>
            ) : null}
            {err ? <p className="text-label text-danger">{err}</p> : null}
          </div>
          <div className="flex items-center gap-2 border-t border-glass-divider px-5 py-4 md:px-6">
            <p className="flex-1 text-label text-ink-2">{role === "user" ? "Guests can book once they set a password" : "Changes to what a role can do are on the Staff page"}</p>
            <GlassButton variant="glass" onClick={() => onOpenChange(false)}>
              Cancel
            </GlassButton>
            <GlassButton onClick={submit} disabled={invite.isPending}>
              {invite.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} Send invite
            </GlassButton>
          </div>
        </>
      )}
    </DepositModal>
  );
}
