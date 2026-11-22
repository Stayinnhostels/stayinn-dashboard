import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { AlertTriangle, BedDouble, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Ellipsis, Eye, KeyRound, Mail, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinKpi, Segmented } from "@/components/admin/finance/finance-kit";
import { InviteDialog } from "@/components/admin/people/invite-dialog";
import { usePeopleAction, usePeopleQuery } from "@/queries/users/people";
import { downloadPeopleCsvApi, resetPasswordApi, type PeopleGroup, type Person } from "@/api/users/people.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { cn } from "@/lib/utils";

/** Figma 13.01 · Users — every account: guests who book online and the team. */
export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type Tab = "all" | PeopleGroup;
type Sort = "newest" | "oldest" | "name";
const PAGE = 8;

export const initialsOf = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : (p[0]?.[1] ?? ""))).toUpperCase() || "?";
};
export const fullDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

export function RolePill({ role, label }: { role: string; label: string }) {
  return (
    <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] leading-4 font-medium whitespace-nowrap text-ink-2">
      {role !== "user" ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {label}
    </span>
  );
}

function UsersPage() {
  // /admin/users/$id renders inside this route.
  const detail = useMatch({ from: "/admin/users/$id", shouldThrow: false });
  if (detail) return <Outlet />;
  return <UsersList />;
}

function UsersList() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const params = { page, limit: PAGE, sort, ...(tab === "all" ? {} : { group: tab }), ...(q.trim() ? { search: q.trim() } : {}) };
  const { data, isLoading, isError } = usePeopleQuery(params);
  const users = data?.users ?? [];
  const c = data?.counts;
  const s = data?.stats;
  const pg = data?.pagination;

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    try {
      await downloadPeopleCsvApi(token, params);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Everyone with an account · guests who book online and your team"
        actions={
          <>
            <GlassButton variant="glass" onClick={exportCsv} disabled={exporting} className="max-sm:hidden">
              <Download aria-hidden /> {exporting ? "Exporting…" : "Export"}
            </GlassButton>
            <GlassButton onClick={() => setInviteOpen(true)}>
              <UserPlus aria-hidden /> Invite user
            </GlassButton>
          </>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <FinKpi icon={<Users />} label="Total accounts" value={String(s?.total ?? 0)} sub={s ? `+${s.new_this_month} this month` : ""} />
          <FinKpi icon={<BedDouble />} label="Living here now" value={String(s?.living_now ?? 0)} sub="Have an active booking" />
          <FinKpi icon={<Mail />} label="Email not verified" value={String(s?.unverified ?? 0)} sub="Can't book until verified" />
          <Link to="/admin/staff" className="block rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border">
            <FinKpi className="h-full" icon={<ShieldCheck />} label="Team members" value={String(s?.team ?? 0)} sub="See Staff page" />
          </Link>
        </div>

        <div className="glass-2 flex flex-wrap items-center gap-2.5 rounded-[22px] p-3">
          <Segmented
            label="Show"
            value={tab}
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
            options={[
              ["all", "All", c?.all],
              ["guests", "Guests", c?.guests],
              ["admins", "Admins", c?.admins],
              ["unverified", "Not verified", c?.unverified],
            ] as const}
          />
          <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2.5 rounded-[12px] bg-glass-inset px-3 focus-within:ring-2 focus-within:ring-brand-tint">
            <SearchIcon />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" aria-label="Search name, email or phone" className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-2" />
            {search ? (
              <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="cursor-pointer text-ink-2 hover:text-ink">
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          <span className="glass-2 relative flex h-10 items-center rounded-[12px]">
            <ChevronDown className="pointer-events-none absolute left-3 size-4 text-ink" aria-hidden />
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 cursor-pointer appearance-none bg-transparent pr-4 pl-9 text-body font-semibold text-ink outline-none">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </span>
        </div>

        <div className="glass-2 overflow-hidden rounded-[22px]">
          {isError ? (
            <p className="px-4 py-14 text-center text-body text-danger">Could not load users. Is the API running?</p>
          ) : isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[52px] animate-pulse rounded-[12px] bg-glass-inset" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="px-4 py-14 text-center text-body text-ink-2">{q ? "No one matches your search." : "No accounts here."}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-glass-divider bg-glass-inset/60 text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">
                      <th className="px-4 py-3.5">User</th>
                      <th className="px-4 py-3.5">Phone</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Stay</th>
                      <th className="px-4 py-3.5">Verified</th>
                      <th className="px-4 py-3.5">Joined</th>
                      <th className="w-12 px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <UserRow key={u.id} u={u} onOpen={() => void navigate({ to: "/admin/users/$id", params: { id: u.id } })} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 border-t border-glass-divider px-4 py-3">
                <p className="flex-1 text-label text-ink-2">
                  Showing {users.length} of {pg?.total ?? users.length}
                </p>
                <div className="glass-2 flex items-center gap-1 rounded-[12px] px-1 py-1">
                  <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:opacity-35">
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="px-1 text-label text-ink-2 tabular-nums">
                    {pg?.page ?? 1} of {pg?.pages ?? 1}
                  </span>
                  <button type="button" aria-label="Next page" disabled={page >= (pg?.pages ?? 1)} onClick={() => setPage((p) => p + 1)} className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:opacity-35">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

function UserRow({ u, onOpen }: { u: Person; onOpen: () => void }) {
  const reset = usePeopleAction((t: string, id: string) => resetPasswordApi(t, id));
  return (
    <tr onClick={onOpen} className="cursor-pointer border-b border-glass-divider last:border-b-0 hover:bg-glass-inset/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center text-label font-semibold text-ink">{initialsOf(u.name || u.email)}</span>
          <div className="min-w-0">
            <p className={cn("truncate text-body font-semibold", u.disabled ? "text-ink-3 line-through" : "text-ink")}>{u.name || u.email.split("@")[0]}</p>
            <p className="max-w-[220px] truncate text-label text-ink-2">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-body whitespace-nowrap text-ink">{u.phone || <span className="text-ink-3">—</span>}</td>
      <td className="px-4 py-3">
        <RolePill role={u.role} label={u.role_label} />
      </td>
      <td className="px-4 py-3 text-body whitespace-nowrap text-ink">{u.stay?.label ?? "—"}</td>
      <td className="px-4 py-3 text-label whitespace-nowrap">
        {u.email_verified ? (
          <span className="flex items-center gap-1.5 text-ink-2">
            <Check className="size-3.5" aria-hidden /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-danger">
            <AlertTriangle className="size-3.5" aria-hidden /> Not yet
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-body whitespace-nowrap text-ink">{fullDate(u.created_at)}</td>
      <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger aria-label={`More for ${u.name || u.email}`} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink">
            <Ellipsis className="size-4" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className="glass-3 z-50 min-w-[190px] rounded-[14px] p-1 font-geist text-body text-ink shadow-lg">
              <Item icon={<Eye />} onSelect={onOpen}>
                Open
              </Item>
              <Item icon={<Mail />} onSelect={() => (window.location.href = `mailto:${u.email}`)}>
                Email
              </Item>
              <Item
                icon={<KeyRound />}
                onSelect={() =>
                  reset.mutate(u.id, {
                    onSuccess: () => toast.success(`Password reset link sent to ${u.email}`),
                    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send"),
                  })
                }
              >
                Send password reset
              </Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </td>
    </tr>
  );
}

function Item({ children, icon, onSelect }: { children: React.ReactNode; icon: React.ReactNode; onSelect: () => void }) {
  return (
    <DropdownMenu.Item onSelect={onSelect} className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 outline-none data-[highlighted]:bg-glass-inset [&_svg]:size-4">
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}
