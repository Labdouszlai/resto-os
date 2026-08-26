"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/client";
import { setupRestaurantAction } from "@/app/actions/auth";
import { useTranslation } from "@/i18n/provider";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name || name.length < 2) newErrors.name = t("auth.nameMinLength");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t("auth.enterValidEmail");
    if (!password || password.length < 6) newErrors.password = t("auth.passwordMinLength");
    if (password !== confirmPassword) newErrors.confirmPassword = t("auth.passwordsDontMatch");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    signUp.email(
      { name, email, password, callbackURL: "/dashboard" },
      {
        onSuccess: async (ctx) => {
          const userId = ctx.data?.user?.id;
          if (userId) {
            await setupRestaurantAction(userId, name);
          }
          toast.success(t("auth.accountCreatedSuccessfully"));
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || t("auth.failedToCreateAccount"));
        },
      }
    );
    setLoading(false);
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{t("auth.createAccount")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("auth.signUpDescription")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.fullName")}</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@restaurant.com"
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.atLeast6Chars")}
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("auth.confirmYourPassword")}
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
