import { redirect } from "next/navigation";
import Link from "next/link";
import { requireReader } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

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
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
            Reader Registration · Step 1 of 1
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        <div className="border-b-2 border-stone-900 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
            Editorial Direction
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black text-stone-950 sm:text-5xl">
            What should your paper cover?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
            Select the domains that matter to you. Your paper begins with these preferences, then
            adjusts naturally as you read or skip stories.
          </p>
        </div>

        <div className="mt-8 rounded-xs border border-stone-300 bg-white p-6 sm:p-8 shadow-sm">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
