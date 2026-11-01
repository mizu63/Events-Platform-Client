
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Loader2,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Users,
  HeartHandshake,
} from "lucide-react";

type ToastType = "success" | "error" | "";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  }>({
    message: "",
    type: "",
  });

  // Toast Function
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // GitHub Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const githubStatus = params.get("github");
    const errorCode = params.get("error");
    const errorDescription = params.get("error_description");

    if (githubStatus === "success") {
      showToast("GitHub login successful!", "success");

      window.history.replaceState({}, "", "/login");

      const timer = setTimeout(() => {
        window.location.replace("/");
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (githubStatus === "error" || errorCode) {
      console.error("GitHub OAuth Error:", {
        errorCode,
        errorDescription,
      });

      showToast(
        errorDescription || errorCode || "GitHub login failed!",
        "error"
      );

      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Email Login
  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setToast({ message: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        console.error("Email Login Error:", error);

        showToast(
          error.message || "Invalid email or password!",
          "error"
        );

        setLoading(false);
        return;
      }

      // Login Success Toast
      showToast("Login successful!", "success");

      form.reset();

      // Redirect to Home
      setTimeout(() => {
        window.location.replace("/");
      }, 1500);

    } catch (error) {
      console.error("Login Error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
        "error"
      );

      setLoading(false);
    }
  };

  // GitHub Login
  const handleGithubLogin = async () => {
    setToast({ message: "", type: "" });
    setLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/login?github=success`,
        errorCallbackURL: `${window.location.origin}/login?github=error`,
      });

      if (result.error) {
        console.error("GitHub Login Error:", result.error);

        showToast(
          result.error.message || "GitHub login failed!",
          "error"
        );

        setLoading(false);
      }

    } catch (error) {
      console.error("GitHub Login Error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "GitHub login failed. Please try again.",
        "error"
      );

      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Toast */}
      {toast.message && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed right-5 top-20 z-[9999] flex w-[calc(100%-40px)] max-w-sm items-center gap-3 rounded-xl border p-4 shadow-xl ${
            toast.type === "success"
              ? "border-green-500/40 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 shrink-0 text-red-600" />
          )}

          <p className="flex-1 text-sm font-semibold">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() =>
              setToast({ message: "", type: "" })
            }
            className="text-lg opacity-60 hover:opacity-100"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border-border/70 bg-white shadow-2xl dark:bg-slate-900">

        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />

        <CardHeader className="space-y-4 pb-4 text-center">

          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
            <HeartHandshake className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome Back!
            </CardTitle>

            <CardDescription>
              Login to continue making a difference with EventConnect.
            </CardDescription>
          </div>

        </CardHeader>

        <CardContent className="space-y-5">

          {/* Email Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="username"
                  className="h-11 pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-11 pl-10 pr-11"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="h-11 w-full bg-green-600 text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

          </form>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-border" />

            <span className="px-3 text-xs font-medium uppercase text-muted-foreground">
              Or continue with
            </span>

            <div className="flex-1 border-t border-border" />
          </div>

          {/* GitHub Login */}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={handleGithubLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                <span className="mr-2 text-lg font-bold">
                  GH
                </span>
                Continue with GitHub
              </>
            )}
          </Button>

          {/* Signup Link */}
          <div className="pt-2 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>

            <Link
              href="/signup"
              className="font-semibold text-green-600 hover:text-green-700 hover:underline"
            >
              Create Account
            </Link>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            Together we make a difference.
          </div>

        </CardContent>
      </Card>
    </main>
  );
}
