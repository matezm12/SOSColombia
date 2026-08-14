import { Resend } from "resend";

// Shared alert channel for the tier-1/tier-2 scheduled-job route handlers
// (web/src/app/api/cron/*) — until this existed, a detected change (a magnitude
// revision, a newer INMLCF Comunicado) only ever showed up in Vercel's cron logs,
// which nobody was checking. Missing RESEND_API_KEY/CRON_ALERT_EMAIL degrades to a
// no-op rather than throwing — a cron route's own detection logic should never fail
// because the alert channel isn't configured.
export async function notifyOps(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CRON_ALERT_EMAIL;

  if (!apiKey || !to) {
    console.error("notifyOps: RESEND_API_KEY or CRON_ALERT_EMAIL not set, skipping alert:", subject);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "SOSColombia <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("notifyOps: Resend send failed:", error);
  }
}
