"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const { push } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register({
        email,
        full_name: fullName,
        password,
      });
      push("Account created — signing you in", "success");
      await login(email, password);
    } catch (error) {
      push(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Join Sentellent in seconds
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <GoogleLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                or use email
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button type="submit" loading={submitting}>
              Create account
            </Button>
          </form>
        </div>
      </Card>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
