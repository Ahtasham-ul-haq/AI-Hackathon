import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-[0.2em] text-stone-500">NaSCon &apos;26</p>
      <h1 className="mt-2 font-serif text-5xl font-bold tracking-tight">Personal Morning Paper</h1>
      <p className="mt-6 text-lg text-stone-600">
        Every morning, a newspaper written for you: the stories you care about, briefed by AI from
        real outlets, laid out in sections, and downloadable as a PDF. It learns what you read.
      </p>
      <div className="mt-10 flex gap-4">
        <Link href="/signup" className="rounded bg-stone-900 px-5 py-2.5 text-white hover:bg-stone-700">
          Get your paper
        </Link>
        <Link href="/login" className="rounded border border-stone-300 px-5 py-2.5 hover:bg-stone-100">
          Sign in
        </Link>
      </div>
    </main>
  );
}
