import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useUserQuery } from "@/queries/users";

export const Route = createFileRoute("/admin/users/$id")({ component: UserDetailPage });

function UserDetailPage() {
  const { id } = Route.useParams();
  const { data: profile, isLoading, isError, error } = useUserQuery(id);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading user…
        </CardContent>
      </Card>
    );
  }

  if (isError || !profile) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "User not found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-1">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="text-2xl">{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-extrabold">{profile.full_name}</h2>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                <Badge variant="secondary" className="capitalize">
                  {profile.role.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className={profile.email_verified ? "border-emerald-500/40 text-emerald-600" : ""}>
                  {profile.email_verified ? "Email verified" : "Email not verified"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 text-left text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Booking and payment history will appear here when those features are connected to the API.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
