import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { unlockNotificationAudio } from "@/lib/notification-sound";
import { useLoginMutation } from "@/queries/auth/useLoginMutation";

const LOGIN_LOGO_SRC = "/logos/navlogo.png?v=2";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Stay Inn Admin" },
      { name: "description", content: "Sign in to the Stay Inn admin and operations console." },
    ],
  }),
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(120),
  password: z.string().min(1, "Password is required").max(200),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function postLoginPath() {
  return "/admin";
}

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loginMutation = useLoginMutation();
  const [showPw, setShowPw] = useState(false);

  useLayoutEffect(() => {
    if (user) {
      navigate({ to: postLoginPath(), replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Unlock audio on this click so booking rings work right after login.
      unlockNotificationAudio();
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });
      toast.success("Welcome back!");
      navigate({ to: postLoginPath() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,102,178,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(0,102,178,0.08),_transparent_45%),linear-gradient(180deg,_#f7fafc_0%,_#eef4f9_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />

      <main className="relative z-10 w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link to="/login" className="mb-8 inline-flex justify-center">
            <img
              src={LOGIN_LOGO_SRC}
              alt="Stay Inn Hostels"
              className="h-16 w-auto max-w-[min(100%,10rem)] object-contain object-center sm:h-20 sm:max-w-[12rem]"
            />
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-[2.75rem] sm:leading-none">
            Welcome back
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-[0_18px_50px_-28px_rgba(0,64,120,0.45)] backdrop-blur-sm sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                className="h-11 rounded-full pl-10"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 rounded-full pl-10 pr-10"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <Checkbox {...register("remember")} defaultChecked />
            <span className="text-muted-foreground">Remember me for 30 days</span>
          </label>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            size="lg"
            className="w-full rounded-full font-bold shadow-[var(--shadow-soft)]"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Stay Inn Hostels
        </p>
      </main>
    </div>
  );
}
