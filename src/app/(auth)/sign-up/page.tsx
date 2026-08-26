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
import { signUpAction } from "@/app/actions/auth";
import { useTranslation } from "@/i18n/provider";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const signUpSchema = z
    .object({
      name: z.string().min(2, t("auth.nameMinLength")),
      email: z.string().email(t("auth.enterValidEmail")),
      password: z.string().min(6, t("auth.passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  type SignUpForm = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpForm) {
    setLoading(true);
    try {
      const result = await signUpAction(data.name, data.email, data.password);
      if (result.success) {
        toast.success(t("auth.accountCreatedSuccessfully"));
        router.push("/dashboard");
      } else {
        toast.error(result.error || t("auth.failedToCreateAccount"));
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
        <h2 className="text-lg font-semibold text-foreground">{t("auth.createAccount")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("auth.signUpDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.fullName")}</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={loading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

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
            placeholder={t("auth.atLeast6Chars")}
            disabled={loading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("auth.confirmYourPassword")}
            disabled={loading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
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
