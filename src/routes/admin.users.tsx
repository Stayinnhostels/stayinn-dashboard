import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdminPage,
});

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

function UsersAdminPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data as Array<{ user_id: string; role: string }>;
    },
  });

  const { data: bookingCounts = {} } = useQuery({
    queryKey: ["admin", "bookings-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("user_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((b) => { if (b.user_id) counts[b.user_id] = (counts[b.user_id] ?? 0) + 1; });
      return counts;
    },
  });

  const rolesById = new Map<string, string[]>();
  roles.forEach((r) => rolesById.set(r.user_id, [...(rolesById.get(r.user_id) ?? []), r.role]));

  const filtered = profiles.filter((p) => {
    const userRoles = rolesById.get(p.id) ?? ["user"];
    return (
      (roleFilter === "all" || userRoles.includes(roleFilter)) &&
      (!query ||
        p.email?.toLowerCase().includes(query.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(query.toLowerCase()))
    );
  });

  function exportCsv() {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Roles", "Bookings", "Joined"],
      ...filtered.map((p) => [
        p.id, p.full_name ?? "", p.email ?? "", p.phone ?? "",
        (rolesById.get(p.id) ?? ["user"]).join(";"),
        String(bookingCounts[p.id] ?? 0),
        p.created_at,
      ]),
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
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No users.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                        <AvatarFallback>{(p.full_name ?? p.email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{p.full_name ?? "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone ?? "—"}</TableCell>
                  <TableCell>{bookingCounts[p.id] ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(rolesById.get(p.id) ?? ["user"]).map((r) => (
                        <Badge key={r} variant="secondary" className="capitalize">{r.replace("_", " ")}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost"><Link to="/admin/users/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
