import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

const ROLES = ["user", "admin", "super_admin"] as const;

function StaffPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin", "staff-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: typeof ROLES[number] }) => {
      // Remove previous admin/staff roles to keep one role at a time
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", user_id);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "all-roles"] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Show staff = users that have admin or super_admin roles
  const staffIds = new Set(roles.filter((r) => r.role !== "user").map((r) => r.user_id));
  const staff = profiles.filter((p) => staffIds.has(p.id));
  const rolesById = new Map<string, string>();
  roles.forEach((r) => { if (r.role !== "user") rolesById.set(r.user_id, r.role); });

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-bold">Role-based access control</p>
              <p className="text-xs text-muted-foreground">
                Only super admins can change roles. Manage who has access to the admin console here.
              </p>
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
                <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No staff yet. Promote a user from the Users page.</TableCell></TableRow>
              ) : staff.map((p) => (
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
                  <TableCell><Badge variant="secondary" className="capitalize">{rolesById.get(p.id)?.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Select disabled={!isSuper} value={rolesById.get(p.id) ?? "user"}
                      onValueChange={(v) => setRole.mutate({ user_id: p.id, role: v as typeof ROLES[number] })}>
                      <SelectTrigger className="ml-auto h-9 w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
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
