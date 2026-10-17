import "server-only";

export type Trigger = "onboarding" | "hourly" | "visit" | "builder";

/** Generates today's paper for a reader. Implemented in the generation step. */
export async function generatePaperForReader(userId: string, trigger: Trigger): Promise<void> {
  console.log("generatePaperForReader (stub)", userId, trigger);
}
