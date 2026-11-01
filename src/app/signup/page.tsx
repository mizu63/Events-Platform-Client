
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setMessage("");
    setMessageType("");

    const formData = new FormData(form);

    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const image = (formData.get("image") as string).trim();
    const password = formData.get("password") as string;

    if (!name || !email || !image || !password) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    if (!passwordRegex.test(password)) {
      setMessage(
        "Password must contain uppercase, lowercase and at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
      });

      if (error) {
        setMessage(error.message || "Signup failed. Please try again.");
        setMessageType("error");
        return;
      }

      setMessage("Signup successful! Your account has been created.");
      setMessageType("success");

      form.reset();

      setTimeout(() => {
        router.replace("/");
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                name="image"
                type="url"
                placeholder="Enter your photo URL"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase and at least 6 characters.
              </p>
            </div>

            {message && (
              <div
                role="alert"
                className={`rounded-md p-3 text-sm ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
