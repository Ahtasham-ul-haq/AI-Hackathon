import { redirect } from "next/navigation";
import Link from "next/link";
import { requireReader } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";
import { EditorialPageHeader } from "@/components/EditorialPageHeader";

export const maxDuration = 300;

export default async function OnboardingPage() {
  const { profile } = await requireReader();
  if (profile.onboarded) redirect("/paper");

  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900">
      {/* Editorial top masthead */}
      <header className="border-b border-stone-300/80 bg-white/70 py-4 backdrop-blur-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-serif text-2xl font-black tracking-tight text-stone-900">
            MARGINS
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-600">Your first edition</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        <EditorialPageHeader title="What should your paper cover?" description="Choose the subjects that matter to you. Your edition starts with these interests and can be adjusted anytime." />

        <div className="mt-8 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-sm">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
