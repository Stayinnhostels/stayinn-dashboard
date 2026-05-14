import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Search, LayoutGrid, List as ListIcon, Mail, Phone, Users as UsersIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profiles as store, bookings } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/users")({ component: UsersAdminPage });

function UsersAdminPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const { data: profiles = [] } = useQuery({
    queryKey: ["mock", "profiles"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { if (b.user_id) counts[b.user_id] = (counts[b.user_id] ?? 0) + 1; });
    return counts;
  }, []);

  const totalSpentById = useMemo(() => {
    const t: Record<string, number> = {};
    bookings.forEach((b) => { if (b.user_id && b.status !== "cancelled") t[b.user_id] = (t[b.user_id] ?? 0) + b.total_amount; });
    return t;
  }, []);

  const filtered = profiles.filter((p) =>
    (roleFilter === "all" || p.role === roleFilter) &&
    (!query || p.email.toLowerCase().includes(query.toLowerCase()) || p.full_name.toLowerCase().includes(query.toLowerCase()))
  );

  function exportCsv() {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Role", "Bookings", "Spent", "Joined"],
      ...filtered.map((p) => [p.id, p.full_name, p.email, p.phone ?? "", p.role, String(bookingCounts[p.id] ?? 0), String(totalSpentById[p.id] ?? 0), p.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super admin</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="table"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">No users match your filters.</CardContent></Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <div className="h-20 bg-[image:var(--gradient-hero)]" />
              <CardContent className="-mt-10 space-y-3 p-4 text-center">
                <Avatar className="mx-auto h-20 w-20 border-4 border-background shadow">
                  <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                    {p.full_name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-extrabold tracking-tight truncate">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Badge variant="secondary" className="capitalize">{p.role.replace("_", " ")}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                  <div><p className="font-bold">{bookingCounts[p.id] ?? 0}</p><p className="text-muted-foreground">Bookings</p></div>
                  <div><p className="font-bold">${(totalSpentById[p.id] ?? 0).toLocaleString()}</p><p className="text-muted-foreground">Spent</p></div>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full"><Link to="/admin/users/$id" params={{ id: p.id }}><Eye className="h-3.5 w-3.5" /> View profile</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                  <TableHead>Bookings</TableHead><TableHead>Spent</TableHead><TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{p.full_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <p className="font-semibold">{p.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone ?? "—"}</TableCell>
                    <TableCell>{bookingCounts[p.id] ?? 0}</TableCell>
                    <TableCell>${(totalSpentById[p.id] ?? 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{p.role.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button asChild size="sm" variant="ghost"><Link to="/admin/users/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
