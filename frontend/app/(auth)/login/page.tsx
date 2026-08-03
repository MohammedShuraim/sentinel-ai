"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Logo } from "@/components/brand/Logo";
import { fadeIn, fadeUp, staggerContainer } from "@/lib/motion/presets";

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      push("Signed in successfully", "success");
    } catch (error) {
      push(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={item}
        className="flex flex-col items-center gap-4 text-center"
      >
        <Logo size="lg" withWordmark={false} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Sign in to Sentellent
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            AI-powered Indian stock analyst
          </p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <GoogleLoginButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 tracking-wider text-fg-subtle">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" loading={submitting} className="w-full">
                Sign in
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>

      <motion.p variants={item} className="text-center text-sm text-fg-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </motion.p>
    </motion.div>
  );
}
