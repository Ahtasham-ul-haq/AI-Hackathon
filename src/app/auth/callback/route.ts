import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google) and email-confirmation links land here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error") ?? searchParams.get("error_code");

  if (providerError) {
    console.warn("OAuth provider returned an error", {
      providerError: providerError === "access_denied" ? "access_denied" : "other",
    });
    return authFailure(origin, "provider");
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/paper`);
    // Keep tokens and authorization codes out of logs; the error code is enough
    // to distinguish a missing/expired PKCE verifier from other exchange errors.
    console.error("OAuth code exchange failed", { code: error.code ?? error.name });
    return authFailure(origin, "exchange");
  }

  return authFailure(origin, "missing_code");
}

function authFailure(origin: string, reason: string) {
  const login = new URL("/login", origin);
  login.searchParams.set("error", "auth");
  login.searchParams.set("reason", reason);
  return NextResponse.redirect(login);
}
