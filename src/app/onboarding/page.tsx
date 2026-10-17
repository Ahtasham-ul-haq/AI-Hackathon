import { redirect } from "next/navigation";
import { requireReader } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const { profile } = await requireReader();
  if (profile.onboarded) redirect("/paper");
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-serif text-4xl font-bold">What should your paper cover?</h1>
      <p className="mt-2 text-stone-600">
        That&apos;s all we ask. Your paper learns the rest from what you read.
      </p>
      <OnboardingForm />
    </main>
  );
}
