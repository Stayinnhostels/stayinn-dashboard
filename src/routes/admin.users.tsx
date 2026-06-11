import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Search, LayoutGrid, List as ListIcon, Mail } from "lucide-react";
import { UsersListSkeleton } from "@/components/admin/users-page-skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersQuery } from "@/queries/users";

export const Route = createFileRoute("/admin/users")({ component: UsersAdminPage });

const PAGE_SIZE = 50;

function UsersAdminPage() {
  const detailMatch = useMatch({ from: "/admin/users/$id", shouldThrow: false });
  if (detailMatch) {
    return <Outlet />;
  }
  return <UsersListPage />;
}

function UsersListPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(roleFilter !== "all" ? { role: roleFilter as "user" | "super_admin" } : {}),
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [page, roleFilter, query],
  );

  const { data, isLoading, isError, error } = useUsersQuery(listParams);
  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  function exportCsv() {
    const rows = [
      ["ID", "Name", "Email", "Role", "Email verified", "Joined"],
      ...users.map((p) => [
        p.id,
        p.full_name,
        p.email,
        p.role,
        p.email_verified ? "yes" : "no",
        p.created_at ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email…"
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="super_admin">Super admin</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <ListIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportCsv} disabled={users.length === 0}>
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <UsersListSkeleton view={view} />
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load users"}
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No users match your filters.
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((p) => (
            <Card key={p.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <div className="h-20 bg-[image:var(--gradient-hero)]" />
              <CardContent className="-mt-10 space-y-3 p-4 text-center">
                <Avatar className="mx-auto h-20 w-20 border-4 border-background shadow">
                  <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                    {p.full_name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="truncate font-extrabold tracking-tight">{p.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <Badge variant="secondary" className="capitalize">
                    {p.role.replace("_", " ")}
                  </Badge>
                  {p.email_verified ? (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/admin/users/$id" params={{ id: p.id }}>
                    <Eye className="h-3.5 w-3.5" /> View profile
                  </Link>
                </Button>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{p.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{p.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {p.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.email_verified ? "Yes" : "No"}</TableCell>
                    <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/admin/users/$id" params={{ id: p.id }}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
            {pagination ? ` · ${pagination.total} users` : ""}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
