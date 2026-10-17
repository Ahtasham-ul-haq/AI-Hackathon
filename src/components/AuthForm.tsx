"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signUp : signIn,
    undefined,
  );

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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
        <button disabled={pending}
          className="rounded bg-stone-900 px-4 py-2 text-white hover:bg-stone-700 disabled:opacity-50">
          {pending ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>
      <div className="my-4 text-center text-sm text-stone-500">or</div>
      <button onClick={google}
        className="w-full rounded border border-stone-300 bg-white px-4 py-2 hover:bg-stone-100">
        Continue with Google
      </button>
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
