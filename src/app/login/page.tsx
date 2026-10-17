import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const reason = params.reason;
  const authError = params.error === "auth"
    ? reason === "provider"
      ? "Google sign-in was cancelled or could not be completed. Please try again."
      : reason === "exchange"
        ? "Google signed you in, but Margins couldn't finish creating your session. Start again from this page."
        : "Google didn't return a sign-in code. Please start the sign-in again."
    : undefined;
  const accountDeleted = params.deleted === "1";

  return (
    <AuthForm
      mode="login"
      initialError={authError}
      initialMessage={accountDeleted ? "Your Margins account and its saved data have been deleted." : undefined}
    />
  );
}
