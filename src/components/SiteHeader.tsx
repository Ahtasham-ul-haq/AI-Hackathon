import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function SiteHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-stone-300 bg-background print:hidden">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 text-sm">
        <Link href="/paper" className="mr-auto font-serif text-lg font-bold">Morning Paper</Link>
        <Link href="/paper" className="hover:underline">Today</Link>
        <Link href="/history" className="hover:underline">Past editions</Link>
        <Link href="/learned" className="hover:underline">What we&apos;ve learned</Link>
        <Link href="/settings" className="hover:underline">Settings</Link>
        <form action={signOut}>
          <button className="text-stone-500 hover:underline" title={email ?? undefined}>Sign out</button>
        </form>
      </nav>
    </header>
  );
}
