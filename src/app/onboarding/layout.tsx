import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Your Restaurant",
  description: "Complete the onboarding process to set up your restaurant on RestoOS.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
