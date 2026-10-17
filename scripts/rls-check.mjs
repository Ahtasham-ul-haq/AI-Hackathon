// Verifies that one reader can never read another reader's data.
// Usage: node --env-file=.env.local scripts/rls-check.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const stamp = Date.now();
const password = `Rls-check-${stamp}!`;
const emails = [`rls-a-${stamp}@example.test`, `rls-b-${stamp}@example.test`];

async function makeUser(email) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}

async function signedIn(email) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

let failures = 0;
function expectEmpty(label, rows) {
  const ok = Array.isArray(rows) && rows.length === 0;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : ` -> ${JSON.stringify(rows)}`}`);
  if (!ok) failures++;
}

const [a, b] = await Promise.all(emails.map(makeUser));
try {
  // Give reader A some private data via the service role.
  await admin.from("interest_weights").insert({ user_id: a, topic: "technology", label: "Technology" });
  const { data: paper } = await admin
    .from("papers").insert({ user_id: a, local_date: "2026-01-01", status: "plain" }).select().single();
  const { data: section } = await admin
    .from("sections").insert({ paper_id: paper.id, name: "Front Page", position: 0 }).select().single();
  const { data: story } = await admin.from("stories").insert({
    paper_id: paper.id, section_id: section.id, position: 0, headline: "Private", briefing: "Private",
  }).select().single();
  await admin.from("reading_events").insert({ user_id: a, story_id: story.id, kind: "open" });

  const asB = await signedIn(emails[1]);
  expectEmpty("B cannot read A's profile", (await asB.from("profiles").select("*").eq("id", a)).data);
  expectEmpty("B cannot read A's weights", (await asB.from("interest_weights").select("*").eq("user_id", a)).data);
  expectEmpty("B cannot read A's papers", (await asB.from("papers").select("*").eq("user_id", a)).data);
  expectEmpty("B cannot read A's sections", (await asB.from("sections").select("*").eq("paper_id", paper.id)).data);
  expectEmpty("B cannot read A's stories", (await asB.from("stories").select("*").eq("paper_id", paper.id)).data);
  expectEmpty("B cannot read A's events", (await asB.from("reading_events").select("*").eq("user_id", a)).data);
  expectEmpty("B cannot read A's runs", (await asB.from("generation_runs").select("*").eq("user_id", a)).data);

  const { error: insErr } = await asB.from("reading_events").insert({ user_id: b, story_id: story.id, kind: "open" });
  console.log(`${insErr ? "PASS" : "FAIL"}  B cannot log events on A's story`);
  if (!insErr) failures++;
  const { error: paperErr } = await asB.from("papers").insert({ user_id: b, local_date: "2026-01-02", status: "plain" });
  console.log(`${paperErr ? "PASS" : "FAIL"}  B cannot write papers directly`);
  if (!paperErr) failures++;

  const asA = await signedIn(emails[0]);
  const own = (await asA.from("stories").select("id").eq("paper_id", paper.id)).data ?? [];
  console.log(`${own.length === 1 ? "PASS" : "FAIL"}  A can read own story`);
  if (own.length !== 1) failures++;
} finally {
  await Promise.all([a, b].map((id) => admin.auth.admin.deleteUser(id)));
}
console.log(failures ? `\n${failures} check(s) failed` : "\nAll RLS checks passed");
process.exit(failures ? 1 : 0);
