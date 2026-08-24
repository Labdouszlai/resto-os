"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Coffee,
  Building2,
  Users,
  UtensilsCrossed,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { completeOnboardingAction } from "@/app/actions/onboarding";

const restaurantSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("US"),
  currency: z.string().default("USD"),
  taxRate: z.string().default("0"),
});

const branchSchema = z.object({
  branchName: z.string().min(2, "Branch name is required"),
  branchAddress: z.string().optional(),
});

type RestaurantForm = z.input<typeof restaurantSchema>;
type BranchForm = z.input<typeof branchSchema>;

const steps = [
  { id: 1, title: "Restaurant Info", description: "Tell us about your restaurant", icon: Building2 },
  { id: 2, title: "First Branch", description: "Set up your first location", icon: Coffee },
  { id: 3, title: "Quick Start", description: "You are all set!", icon: Check },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [restaurantData, setRestaurantData] = useState<RestaurantForm | null>(null);

  const restaurantForm = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      country: "US",
      currency: "USD",
      taxRate: "0",
    },
  });

  const branchForm = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: { branchName: "Main Branch" },
  });

  async function handleRestaurantSubmit(data: RestaurantForm) {
    setRestaurantData(data);
    setCurrentStep(2);
  }

  async function handleBranchSubmit(data: BranchForm) {
    setLoading(true);
    try {
      const result = await completeOnboardingAction({
        restaurantName: restaurantData!.restaurantName,
        phone: restaurantData!.phone,
        address: restaurantData!.address,
        city: restaurantData!.city,
        country: restaurantData!.country,
        currency: restaurantData!.currency,
        taxRate: restaurantData!.taxRate,
        branchName: data.branchName,
        branchAddress: data.branchAddress,
      });
      if (result.success) {
        toast.success("Restaurant created successfully!");
        setCurrentStep(3);
      } else {
        toast.error(result.error || "Failed to create restaurant");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to RestoOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up your restaurant in a few steps</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep > step.id ? "bg-primary text-primary-foreground" :
                currentStep === step.id ? "bg-primary/10 text-primary border-2 border-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {step.id < steps.length && (
                <div className={`w-12 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="border rounded-2xl p-8 bg-card">
          {currentStep === 1 && (
            <form onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmit)} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Restaurant Information</h2>
                <p className="text-sm text-muted-foreground">Basic details about your restaurant</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name *</Label>
                <Input id="restaurantName" placeholder="e.g. La Bella Cucina" {...restaurantForm.register("restaurantName")} />
                {restaurantForm.formState.errors.restaurantName && (
                  <p className="text-xs text-destructive">{restaurantForm.formState.errors.restaurantName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1-555-0100" {...restaurantForm.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...restaurantForm.register("currency")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St" {...restaurantForm.register("address")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" {...restaurantForm.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input id="taxRate" placeholder="0" {...restaurantForm.register("taxRate")} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={branchForm.handleSubmit(handleBranchSubmit)} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">First Branch</h2>
                <p className="text-sm text-muted-foreground">Set up your first location. You can add more later.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input id="branchName" placeholder="Main Branch" {...branchForm.register("branchName")} />
                {branchForm.formState.errors.branchName && (
                  <p className="text-xs text-destructive">{branchForm.formState.errors.branchName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchAddress">Address</Label>
                <Input id="branchAddress" placeholder="123 Main St" {...branchForm.register("branchAddress")} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  {loading ? "Creating..." : "Create Restaurant"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">You are all set!</h2>
              <p className="text-muted-foreground mb-8">
                Your restaurant <strong>{restaurantData?.restaurantName}</strong> has been created. Here is what you can do next:
              </p>
              <div className="grid grid-cols-1 gap-3 text-left mb-8">
                {[
                  { icon: UtensilsCrossed, label: "Add menu items", desc: "Set up your menu with categories and prices" },
                  { icon: Users, label: "Invite your team", desc: "Add employees and assign roles" },
                  { icon: Building2, label: "Add more branches", desc: "Expand to additional locations" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => router.push("/dashboard")} className="gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
