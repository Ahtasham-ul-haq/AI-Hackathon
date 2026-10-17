import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { loadPaper } from "@/lib/papers";

/** Send one edition through Resend, with a database claim to avoid duplicate sends. */
export async function deliverPaper(userId: string, paperId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return "email provider is not configured";
  const db = createServiceClient();
  const { data: profile } = await db.from("profiles").select("email, email_delivery").eq("id", userId).single();
  if (!profile?.email_delivery || !profile.email) return "delivery disabled or email missing";

  const { data: existing } = await db.from("paper_deliveries").select("status, updated_at").eq("paper_id", paperId).maybeSingle();
  if (existing?.status === "sent") return "already sent";
  if (existing?.status === "sending" && Date.now() - new Date(existing.updated_at).getTime() < 10 * 60_000) return "send in progress";
  if (!existing) {
    const { error } = await db.from("paper_deliveries").insert({ paper_id: paperId, user_id: userId, status: "sending" });
    if (error) return "send claim already exists";
  } else {
    const { data: claimed } = await db.from("paper_deliveries").update({ status: "sending", error: null, updated_at: new Date().toISOString() })
      .eq("paper_id", paperId).eq("updated_at", existing.updated_at).select("paper_id").maybeSingle();
    if (!claimed) return "send claim already exists";
  }

  const { data: paperRow } = await db.from("papers").select("local_date").eq("id", paperId).eq("user_id", userId).single();
  const paper = paperRow ? await loadPaper(db, userId, paperRow.local_date) : null;
  if (!paper || paper.id !== paperId) {
    await db.from("paper_deliveries").update({ status: "failed", error: "paper not found", updated_at: new Date().toISOString() }).eq("paper_id", paperId);
    return "paper not found";
  }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const editionUrl = `${siteUrl}/paper/${paper.local_date}`;
  const stories = paper.sections.flatMap((section) => section.stories);
  const html = `<div style="font-family:Georgia,serif;color:#1c1917;max-width:680px;margin:auto"><p style="letter-spacing:.2em;text-transform:uppercase;color:#78716c">Margins · ${paper.local_date}</p><h1 style="font-size:32px">Your morning paper is ready.</h1><p><a href="${editionUrl}" style="background:#1c1917;color:white;padding:12px 18px;text-decoration:none">Read your edition</a></p><hr/>${stories.map((story) => `<article style="padding:14px 0;border-bottom:1px solid #ddd"><h2 style="font-size:20px">${escapeHtml(story.headline)}</h2><p style="line-height:1.6">${escapeHtml(story.briefing)}</p><p style="font-size:12px;color:#78716c">${story.sources.length} source${story.sources.length === 1 ? "" : "s"}</p></article>`).join("")}<p style="font-size:12px;color:#78716c">You can change or turn off email delivery in <a href="${siteUrl}/settings">Settings</a>.</p></div>`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [profile.email], subject: `Your Margins morning paper · ${paper.local_date}`, html }),
    });
    if (!response.ok) throw new Error(`Resend returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    await db.from("paper_deliveries").update({ status: "sent", error: null, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("paper_id", paperId);
    return "sent";
  } catch (error) {
    const message = (error as Error).message.slice(0, 500);
    await db.from("paper_deliveries").update({ status: "failed", error: message, updated_at: new Date().toISOString() }).eq("paper_id", paperId);
    return `failed: ${message}`;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
