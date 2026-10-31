// Server-only email delivery via the Resend connector gateway.
// Never import this file from client code.
import { ROLES, studio } from "@/config/studio";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SITE_URL = "https://exofaststudio.lovable.app";
export const ADMIN_NOTIFICATION_SUBJECT = "New APCOER Startup Studio Application";
/** Stop retrying a single email after this many failed attempts. */
export const MAX_EMAIL_ATTEMPTS = 10;

/** "accepted" means Resend accepted the request — NOT confirmed inbox delivery. */
export type EmailStatus = "accepted" | "failed" | "not_configured";
export type EmailKind = "admin_notification" | "applicant_confirmation";
export interface EmailResult {
  status: EmailStatus | "already_accepted" | "gave_up";
  providerId?: string;
  error?: string;
}

export interface ApplicationEmailData {
  id: string;
  fullName: string;
  email: string;
  primaryRole: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const roleLabel = (id: string) => ROLES.find((r) => r.id === id)?.label ?? id;

export const notificationRecipient = () => process.env["APPLICATION_NOTIFICATION_EMAIL"] || studio.contactEmail;

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}): Promise<{ status: EmailStatus; providerId?: string; error?: string }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    return { status: "not_configured", error: "Resend is not connected to this project" };
  }
  const from = process.env["RESEND_FROM_EMAIL"] || `${studio.name} <onboarding@resend.dev>`;
  try {
    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        // Resend de-duplicates requests with the same key, so retries never send twice.
        "Idempotency-Key": opts.idempotencyKey,
      },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Resend send failed [${response.status}]`);
      return { status: "failed", error: `Resend ${response.status}: ${body.slice(0, 500)}` };
    }
    const data = (await response.json()) as { id?: string };
    return { status: "accepted", ...(data.id ? { providerId: data.id } : {}) };
  } catch (err) {
    console.error("Resend network error");
    return { status: "failed", error: err instanceof Error ? err.message : "Network error" };
  }
}

function adminNotification(a: ApplicationEmailData) {
  const reviewUrl = `${SITE_URL}/admin/applications/${a.id}`;
  return {
    to: notificationRecipient(),
    subject: ADMIN_NOTIFICATION_SUBJECT,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 16px">New application received</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 12px 6px 0;color:#666">Applicant</td><td>${escapeHtml(a.fullName)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Primary role</td><td>${escapeHtml(roleLabel(a.primaryRole))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Reference</td><td style="font-family:monospace">${escapeHtml(a.id)}</td></tr>
      </table>
      <p style="margin-top:20px"><a href="${reviewUrl}" style="background:#111;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px">Review application</a></p>
      <p style="color:#999;font-size:12px;margin-top:24px">Sign-in is required to view the application. Documents are never attached to this email.</p>
    </div>`,
  };
}

function applicantConfirmation(a: ApplicationEmailData) {
  return {
    to: a.email,
    subject: `Application received — ${studio.name}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 4px">We've received your application</h2>
      <p style="margin:0 0 16px;color:#666">${escapeHtml(studio.name)}</p>
      <p>Hi ${escapeHtml(a.fullName)},</p>
      <p>Your application for <strong>${escapeHtml(roleLabel(a.primaryRole))}</strong> has been received and is awaiting review.</p>
      <p>Your application reference: <span style="font-family:monospace">${escapeHtml(a.id)}</span></p>
      <p>We review every application by hand. If yours is a fit, we'll invite you to a short practical task. Submitting an application does not guarantee selection.</p>
      <p>Questions? Write to ${escapeHtml(studio.contactEmail)}.</p>
    </div>`,
  };
}

type Admin = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

/**
 * Send one application email exactly once. Safe to call repeatedly:
 * skips if already accepted, uses a stable idempotency key, logs every attempt.
 */
export async function deliverApplicationEmail(
  supabaseAdmin: Admin,
  kind: EmailKind,
  app: ApplicationEmailData,
): Promise<EmailResult> {
  const { data: prior } = await supabaseAdmin
    .from("email_events")
    .select("status")
    .eq("application_id", app.id)
    .eq("kind", kind);
  const rows = prior ?? [];
  if (rows.some((r) => r.status === "accepted" || r.status === "sent")) return { status: "already_accepted" };
  if (rows.filter((r) => r.status === "failed").length >= MAX_EMAIL_ATTEMPTS) return { status: "gave_up" };

  const msg = kind === "admin_notification" ? adminNotification(app) : applicantConfirmation(app);
  const result = await sendViaResend({ ...msg, idempotencyKey: `${kind}-${app.id}` });

  const { error: logErr } = await supabaseAdmin.from("email_events").insert({
    application_id: app.id,
    kind,
    recipient: msg.to,
    status: result.status,
    provider_id: result.providerId ?? null,
    error: result.error ?? null,
  });
  // A unique-index conflict means a concurrent attempt already recorded acceptance.
  if (logErr && logErr.code !== "23505") console.error("email_events insert failed:", logErr.message);
  return result;
}
