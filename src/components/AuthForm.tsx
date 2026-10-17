"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Spinner } from "@/components/Loading";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signUp : signIn,
    undefined,
  );

  const [google, setGoogle] = useState<{ busy: boolean; error?: string }>({ busy: false });

  async function continueWithGoogle() {
    setGoogle({ busy: true });
    // Ask Supabase first so a disabled provider shows a clear message instead of a raw error page.
    const settings = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    })
      .then((r) => r.json())
      .catch(() => null);
    if (settings && !settings.external?.google) {
      setGoogle({ busy: false, error: "Google sign-in isn't available yet. Please use email and password." });
      return;
    }
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setGoogle({ busy: false, error: `Couldn't start Google sign-in: ${error.message}` });
    // On success the browser is already on its way to Google, so stay busy.
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-24">
      <Link href="/" className="font-serif text-2xl font-bold">
        Morning Paper
      </Link>
      <h1 className="mt-8 text-xl font-semibold">
        {mode === "signup" ? "Create your account" : "Sign in"}
      </h1>
      <form
        action={(fd: FormData) => {
          // Reader's time zone, captured from the browser at sign-up.
          fd.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
          return action(fd);
        }}
        className="mt-6 flex flex-col gap-3"
      >
        <input name="email" type="email" required placeholder="Email" autoComplete="email"
          className="rounded border border-stone-300 bg-white px-3 py-2" />
        <input name="password" type="password" required placeholder="Password" minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="rounded border border-stone-300 bg-white px-3 py-2" />
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state?.message && <p className="text-sm text-green-800">{state.message}</p>}
        <button disabled={pending} aria-busy={pending}
          className="rounded bg-stone-900 px-4 py-2 text-white hover:bg-stone-700 disabled:opacity-50">
          {pending ? (
            <span role="status" aria-live="polite">
              <Spinner className="mr-2 h-3.5 w-3.5" />
              {mode === "signup" ? "Creating your account…" : "Signing you in…"}
            </span>
          ) : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>
      <div className="my-4 text-center text-sm text-stone-500">or</div>
      <button onClick={continueWithGoogle} disabled={google.busy || pending} aria-busy={google.busy}
        className="w-full rounded border border-stone-300 bg-white px-4 py-2 hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60">
        {google.busy ? (
          <span role="status" aria-live="polite"><Spinner className="mr-2 h-3.5 w-3.5" />Redirecting to Google…</span>
        ) : "Continue with Google"}
      </button>
      {google.error && <p role="alert" className="mt-2 text-sm text-red-700">{google.error}</p>}
      <p className="mt-6 text-sm text-stone-600">
        {mode === "signup" ? (
          <>Already have an account? <Link className="underline" href="/login">Sign in</Link></>
        ) : (
          <>New here? <Link className="underline" href="/signup">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
