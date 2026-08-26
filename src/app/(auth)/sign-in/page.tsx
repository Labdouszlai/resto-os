"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/app/actions/auth";
import { useTranslation } from "@/i18n/provider";

export default function SignInPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const signInSchema = z.object({
    email: z.string().email(t("auth.enterValidEmail")),
    password: z.string().min(6, t("auth.passwordMinLength")),
  });

  type SignInForm = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInForm) {
    setLoading(true);
    try {
      const result = await signInAction(data.email, data.password);
      if (result.success) {
        toast.success(t("auth.signedInSuccessfully"));
        router.push("/dashboard");
      } else {
        toast.error(result.error || t("auth.invalidCredentials"));
      }
    } catch {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{t("auth.signIn")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("auth.signInDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@restaurant.com"
            disabled={loading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.enterPassword")}
            disabled={loading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            {t("auth.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.dontHaveAccount")}{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          {t("auth.createOne")}
        </Link>
      </p>
    </div>
  );
}
