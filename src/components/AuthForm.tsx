"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Spinner } from "@/components/Loading";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode, initialError, initialMessage }: { mode: "login" | "signup"; initialError?: string; initialMessage?: string }) {
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
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md animate-fade-in">
        {/* Editorial Masthead Card */}
        <div className="rounded-xs border border-stone-300 bg-white p-6 sm:p-10 shadow-lg">
          {/* Header */}
          <div className="border-b border-stone-200 pb-5 text-center">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-3xl font-black tracking-tight text-stone-900 group-hover:text-stone-700 transition">
                MARGINS
              </span>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                Personal Morning Paper
              </p>
            </Link>
            <h1 className="mt-4 font-serif text-xl font-bold text-stone-950 sm:text-2xl">
              {mode === "signup" ? "Create your personal edition" : "Welcome back to your morning paper"}
            </h1>
            <p className="mt-1 text-xs text-stone-600">
              {mode === "signup"
                ? "Takes under 2 minutes. Your first paper is generated immediately."
                : "Enter your credentials to read today's edition."}
            </p>
          </div>

          {/* Form */}
          <form
            action={(fd: FormData) => {
              fd.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
              return action(fd);
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="reader@example.com"
                autoComplete="email"
                className="mt-1 w-full rounded-sm border border-stone-300 bg-[#fdfbf7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-stone-900 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <span className="text-[11px] text-stone-500">At least 8 characters</span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-sm border border-stone-300 bg-[#fdfbf7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-stone-900 focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              />
            </div>

            {(state?.error ?? initialError) && (
              <div className="rounded-xs border border-red-300 bg-red-50 p-2.5 text-xs text-red-800">
                {state?.error ?? initialError}
              </div>
            )}
            {(state?.message ?? initialMessage) && (
              <div className="rounded-xs border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                {state?.message ?? initialMessage}
              </div>
            )}

            <button
              disabled={pending}
              aria-busy={pending}
              className="mt-2 w-full rounded-xs bg-stone-900 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-xs transition hover:bg-stone-800 active:scale-[0.99] disabled:opacity-50"
            >
              {pending ? (
                <span role="status" aria-live="polite" className="inline-flex items-center justify-center">
                  <Spinner className="mr-2 h-3.5 w-3.5" />
                  {mode === "signup" ? "Creating your account…" : "Signing you in…"}
                </span>
              ) : mode === "signup" ? (
                "Start Reading"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-medium text-stone-500">or</span>
            </div>
          </div>

          {/* Google SSO */}
          <button
            onClick={continueWithGoogle}
            disabled={google.busy || pending}
            aria-busy={google.busy}
            className="w-full rounded-xs border border-stone-300 bg-[#faf8f3] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-800 shadow-xs transition hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60"
          >
            {google.busy ? (
              <span role="status" aria-live="polite" className="inline-flex items-center justify-center">
                <Spinner className="mr-2 h-3.5 w-3.5" />
                Connecting…
              </span>
            ) : (
              "Continue with Google"
            )}
          </button>
          {google.error && <p role="alert" className="mt-2 text-xs text-red-700">{google.error}</p>}

          {/* Mode switch */}
          <div className="mt-6 border-t border-stone-200 pt-4 text-center text-xs text-stone-600">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <Link className="font-bold text-stone-900 underline hover:text-stone-700" href="/login">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Margins?{" "}
                <Link className="font-bold text-stone-900 underline hover:text-stone-700" href="/signup">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-stone-500">
          A personal morning paper, free for every reader.
        </p>
      </div>
    </div>
  );
}
