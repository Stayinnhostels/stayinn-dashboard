import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { profiles as store, type UserRole } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/staff")({ component: StaffPage });

const ROLES: UserRole[] = ["user", "admin", "super_admin"];

function StaffPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";

  const { data: profiles = [] } = useQuery({
    queryKey: ["mock", "profiles-staff"],
    queryFn: async () => [...store],
  });

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const p = store.find((x) => x.id === id); if (p) p.role = role;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Role updated"); },
  });

  const staff = profiles.filter((p) => p.role !== "user");

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-bold">Role-based access control</p>
              <p className="text-xs text-muted-foreground">Only super admins can change roles. Promote a user to admin from this list.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Member</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Change role</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No staff yet.</TableCell></TableRow>
              ) : staff.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback>{p.full_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <p className="font-semibold">{p.full_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{p.role.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Select disabled={!isSuper} value={p.role} onValueChange={(v) => setRole.mutate({ id: p.id, role: v as UserRole })}>
                      <SelectTrigger className="ml-auto h-9 w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
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
