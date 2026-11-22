import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ChevronLeft, ChevronRight, KeyRound, Lock, LogOut, Mail, Phone, ShieldCheck, Unlock } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { usePeopleAction, usePersonDetailQuery } from "@/queries/users/people";
import { resetPasswordApi, setDisabledApi, setRoleApi, signOutEverywhereApi } from "@/api/users/people.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { ROLE_LABEL } from "@/lib/staff-access";
import { cn } from "@/lib/utils";
import { RolePill, fullDate, initialsOf } from "./admin.users";

/** Figma 13.02 · User detail. */
export const Route = createFileRoute("/admin/users/$id")({ component: UserDetailPage });

const card = "glass-2 rounded-[22px] p-4 md:p-5";
const STATUS: Record<string, string> = { checked_in: "Living here", confirmed: "Reserved", pending: "Pending", checked_out: "Moved out", cancelled: "Cancelled" };
const REQ_STATUS: Record<string, string> = { pending: "Request", approved: "Approved", rejected: "Rejected", withdrawn: "Withdrawn" };

const dm = (key?: string | null, year = false) => (key ? new Date(key.length === 10 ? `${key}T12:00:00` : key).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(year ? { year: "numeric" } : {}) }) : "—");
function when(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `today, ${time}`;
  return d.getFullYear() === today.getFullYear() ? dm(iso) : dm(iso, true);
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] leading-4 font-medium whitespace-nowrap text-ink-2">
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

function Row({ k, v, danger }: { k: string; v: React.ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-body">
      <span className="text-ink-2">{k}</span>
      <span className={cn("text-right font-medium", danger ? "text-danger" : "text-ink")}>{v}</span>
    </div>
  );
}

function UserDetailPage() {
  const { id } = Route.useParams();
  const me = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = usePersonDetailQuery(id);
  const role = usePeopleAction((t: string, r: string) => setRoleApi(t, id, r));
  const disable = usePeopleAction((t: string, v: boolean) => setDisabledApi(t, id, v));
  const signOut = usePeopleAction((t: string) => signOutEverywhereApi(t, id));
  const reset = usePeopleAction((t: string) => resetPasswordApi(t, id));

  if (isError) return <div className={cn(card, "mt-4 px-4 py-14 text-center text-body text-danger")}>Could not load this account.</div>;
  if (isLoading || !data) return <div className="mt-12 h-[420px] animate-pulse rounded-[22px] bg-glass-inset" />;

  const { user: u, bookings, requests, summary: s, activity } = data;
  const self = me?.id === u.id;
  const money = (n: number) => formatMoney(n, s.currency);
  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");
  const residentBooking = bookings.find((b) => b.status === "checked_in") ?? bookings[0];

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Link to="/admin/users" className="flex w-fit items-center gap-1.5 pt-1 text-body text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> Users
      </Link>

      <div className={cn(card, "flex flex-wrap items-center gap-x-5 gap-y-4 md:px-6 md:py-6")}>
        <span className="flex size-14 shrink-0 items-center justify-center text-[18px] font-semibold text-ink">{initialsOf(u.name || u.email)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-[28px] leading-9 font-semibold tracking-[-0.4px] text-ink">{u.name || u.email.split("@")[0]}</h1>
            <RolePill role={u.role === "user" ? "user" : "x"} label={u.role_label} />
            {u.email_verified ? <Pill>Email verified</Pill> : <Pill>Email not verified</Pill>}
            {u.disabled ? <span className="inline-flex h-[22px] items-center rounded-full bg-danger-tint px-2 text-[12px] font-medium text-danger">Disabled</span> : null}
          </div>
          <p className="truncate text-body text-ink-2">{[u.email, u.phone, `joined ${fullDate(u.created_at)}`].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`mailto:${u.email}`} aria-label="Send email" className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
            <Mail className="size-[18px]" aria-hidden />
          </a>
          {u.phone ? (
            <a href={`tel:${u.phone}`} aria-label="Call" className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
              <Phone className="size-[18px]" aria-hidden />
            </a>
          ) : null}
          <GlassButton variant="glass" disabled={reset.isPending} onClick={() => reset.mutate(undefined, { onSuccess: () => toast.success(`Password reset link sent to ${u.email}`), onError: fail })}>
            <KeyRound aria-hidden /> Reset password
          </GlassButton>
          {u.role === "user" && residentBooking ? (
            <GlassButton asChild>
              <Link to="/admin/residents/$id" params={{ id: residentBooking.id }}>
                <ChevronRight aria-hidden /> Open resident profile
              </Link>
            </GlassButton>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          <section className={cn(card, "flex flex-col gap-4")}>
            <div>
              <p className="text-card-title text-ink">Bookings</p>
              <p className="text-label text-ink-2">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"} with this account
              </p>
            </div>
            {bookings.length === 0 && requests.length === 0 ? <p className="rounded-[14px] bg-glass-inset px-4 py-6 text-center text-body text-ink-2">No bookings yet.</p> : null}
            {bookings.map((b) => (
              <Link key={b.id} to="/admin/bookings/$id" params={{ id: b.id }} className="flex items-center gap-3 rounded-[16px] bg-glass-inset px-4 py-3 hover:brightness-[0.98]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-glass-3 text-ink-2">
                  <CalendarCheck className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{[b.room_label, b.seat_label, b.booking_code].filter(Boolean).join(" · ")}</p>
                  <p className="truncate text-label text-ink-2">
                    {dm(b.move_in)} – {dm(b.check_out, true)}
                    {b.stay_unit === "night" ? (b.nights ? ` · ${b.nights} nights` : "") : b.months ? ` · ${b.months} month${b.months === 1 ? "" : "s"}` : ""}
                    {b.source ? ` · ${b.source.replace(/_/g, "-")}` : ""}
                  </p>
                </div>
                <Pill>{STATUS[b.status] ?? b.status}</Pill>
                <ChevronRight className="size-4 shrink-0 text-ink-2" aria-hidden />
              </Link>
            ))}
            {requests
              .filter((r) => r.status === "pending")
              .map((r) => (
                <Link key={r.id} to="/admin/booking-requests" className="flex items-center gap-3 rounded-[16px] bg-glass-inset px-4 py-3 hover:brightness-[0.98]">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-glass-3 text-ink-2">
                    <CalendarCheck className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-ink">{r.type_label} · request</p>
                    <p className="truncate text-label text-ink-2">{r.summary} · waiting for approval</p>
                  </div>
                  <Pill>{REQ_STATUS[r.status]}</Pill>
                  <ChevronRight className="size-4 shrink-0 text-ink-2" aria-hidden />
                </Link>
              ))}
          </section>

          <section className={cn(card, "flex flex-col gap-4")}>
            <div>
              <p className="text-card-title text-ink">Account activity</p>
              <p className="text-label text-ink-2">Sign-ins and actions from the guest app and the team</p>
            </div>
            <ol className="flex flex-col">
              {activity.map((a, i) => (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  <span className="relative flex w-2.5 shrink-0 justify-center">
                    <span className="mt-1.5 size-2.5 rounded-full bg-brand" aria-hidden />
                    {i < activity.length - 1 ? <span className="absolute top-5 bottom-[-4px] w-px bg-glass-divider" aria-hidden /> : null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">{a.title}</p>
                    <p className="text-label text-ink-2">{[a.detail, when(a.at)].filter(Boolean).join(" · ")}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <section className={cn(card, "flex flex-col gap-3")}>
            <p className="text-card-title text-ink">Summary</p>
            <Row k="Total paid" v={money(s.total_paid)} />
            <Row k="Balance" v={money(s.balance)} danger={s.balance > 0} />
            <Row k="Reviews" v={s.reviews ? `${s.reviews} · ${s.avg_rating}★` : "None"} />
            <Row k="Messages sent" v={String(s.messages_sent)} />
            <Row k="Last sign-in" v={s.last_sign_in_at ? `${dm(s.last_sign_in_at)}${s.last_sign_in_device ? ` · ${s.last_sign_in_device}` : ""}` : "Never"} />
          </section>

          <section className={cn(card, "flex flex-col gap-3")}>
            <p className="text-card-title text-ink">Account & access</p>
            <Row k="Role" v={u.role_label} />
            <Row k="Email" v={u.email_verified ? `Verified${u.email_verified_at ? ` ${dm(u.email_verified_at)}` : ""}` : "Not verified"} />
            {data.access.can_use ? <Row k="Can use" v={data.access.can_use} /> : null}
            <Row k="Two-step sign-in" v="Off" />
            <Row k="Signed in on" v={`${s.active_sessions} device${s.active_sessions === 1 ? "" : "s"}`} />
            <div className="mt-1 grid grid-cols-2 gap-2">
              {u.role === "user" ? (
                <GlassButton variant="glass" size="sm" className="h-9" disabled={self || role.isPending} onClick={() => window.confirm(`Make ${u.name || u.email} a super admin? They will see everything.`) && role.mutate("super_admin", { onSuccess: () => toast.success("Now a super admin"), onError: fail })}>
                  <ShieldCheck aria-hidden /> Make admin
                </GlassButton>
              ) : (
                <label className="glass-2 relative flex h-9 items-center rounded-[10px]">
                  <select aria-label="Role" disabled={self || role.isPending} value={u.role} onChange={(e) => role.mutate(e.target.value, { onSuccess: () => toast.success("Role changed"), onError: fail })} className="h-9 w-full cursor-pointer appearance-none bg-transparent px-3 text-label font-medium text-ink outline-none disabled:opacity-50">
                    {["super_admin", "front_desk", "maintenance", "accountant", "user"].map((r) => (
                      <option key={r} value={r}>
                        {r === "user" ? "Remove from team" : ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <GlassButton variant="glass" size="sm" className="h-9" disabled={signOut.isPending} onClick={() => signOut.mutate(undefined, { onSuccess: () => toast.success("Signed out on every device"), onError: fail })}>
                <LogOut aria-hidden /> Sign out everywhere
              </GlassButton>
            </div>
            <GlassButton
              variant={u.disabled ? "glass" : "danger"}
              size="sm"
              className="h-10"
              disabled={self || disable.isPending}
              onClick={() => {
                if (!u.disabled && !window.confirm(`Disable ${u.name || u.email}? They are signed out and can't sign in until you enable the account again.`)) return;
                disable.mutate(!u.disabled, { onSuccess: () => toast.success(u.disabled ? "Account enabled" : "Account disabled"), onError: fail });
              }}
            >
              {u.disabled ? <Unlock aria-hidden /> : <Lock aria-hidden />} {u.disabled ? "Enable account" : "Disable account"}
            </GlassButton>
            {self ? <p className="text-label text-ink-3">This is your account — role and disabling are locked.</p> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
