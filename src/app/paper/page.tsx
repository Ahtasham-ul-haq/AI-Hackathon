import { redirect } from "next/navigation";
import { requireReader } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export default async function PaperPage() {
  const { profile } = await requireReader();
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-serif text-4xl font-bold">Your Morning Paper</h1>
      <p className="mt-4 text-stone-600">Signed in as {profile.email} ({profile.timezone}).</p>
      <form action={signOut} className="mt-8">
        <button className="underline">Sign out</button>
      </form>
    </main>
  );
}
