import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StaffTableSkeleton } from "@/components/admin/admin-page-skeletons";
import { useUsersQuery } from "@/queries/users";

export const Route = createFileRoute("/admin/staff")({ component: StaffPage });

function StaffPage() {
  const { data, isLoading, isError, error } = useUsersQuery({
    role: "super_admin",
    limit: 100,
    page: 1,
  });

  const staff = data?.users ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <StaffTableSkeleton />
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load staff"}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No super admin accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((p) => (
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
                      <TableCell className="text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
