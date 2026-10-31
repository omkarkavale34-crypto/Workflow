import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { applicationSchema, TEXT_FIELDS } from "./application-schema";
import { studio } from "@/config/studio";

type Fail = { ok: false; error: string };
type Done = {
  ok: true;
  applicationId: string;
  alreadySubmitted: boolean;
  emails: { notification: string; confirmation: string };
};
export type SubmitResult = Fail | Done;

const fail = (error: string): Fail => ({ ok: false, error });

function fileError(f: File, cfg: { maxMB: number; accept: readonly string[] }): string | null {
  if (!cfg.accept.includes(f.type)) return `${f.name}: file type not allowed`;
  if (f.size > cfg.maxMB * 1024 * 1024) return `${f.name}: larger than ${cfg.maxMB} MB`;
  return null;
}

const safeName = (name: string) => name.replace(/[^\w.-]/g, "_").slice(-80);

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data");
    return data;
  })
  .handler(async ({ data: fd }): Promise<SubmitResult> => {
    // 1. Validate text fields on the server.
    const raw: Record<string, string> = {};
    for (const k of TEXT_FIELDS) raw[k] = String(fd.get(k) ?? "");
    const parsed = applicationSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0]!;
      return fail(`${String(first.path[0])}: ${first.message}`);
    }
    const d = parsed.data;

    const clientRef = String(fd.get("clientRef") ?? "");
    if (!z.string().uuid().safeParse(clientRef).success) return fail("Missing submission reference — please reload the page and try again.");

    // 2. Validate attachments on the server.
    const collegeId = fd.get("collegeId");
    if (!(collegeId instanceof File) || collegeId.size === 0) return fail("College ID is required for eligibility verification.");
    const resumeFile = fd.get("resume");
    const resume = resumeFile instanceof File && resumeFile.size > 0 ? resumeFile : null;
    const evidence = fd.getAll("evidence").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 5);

    const checks: [File, { maxMB: number; accept: readonly string[] }][] = [
      [collegeId, studio.uploads.collegeId],
      ...(resume ? [[resume, studio.uploads.resume] as [File, typeof studio.uploads.resume]] : []),
      ...evidence.map((f) => [f, studio.uploads.evidence] as [File, typeof studio.uploads.evidence]),
    ];
    for (const [f, cfg] of checks) {
      const err = fileError(f, cfg);
      if (err) return fail(err);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 3. Verify recruitment is open (server-side source of truth).
    const { data: setting } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "recruitment_open")
      .maybeSingle();
    if (setting && setting.value !== true) return fail("Applications are currently closed.");

    // 4. Idempotency: a retry with the same client_ref returns the existing application.
    const { data: existing } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("client_ref", clientRef)
      .maybeSingle();
    if (existing) {
      return { ok: true, applicationId: existing.id, alreadySubmitted: true, emails: { notification: "skipped", confirmation: "skipped" } };
    }

    // 5. Upload files to private storage first, so a failed upload leaves no half-saved application.
    const fileRows: { kind: string; storage_path: string; file_name: string; content_type: string; size_bytes: number }[] = [];
    const uploads: [File, string][] = [
      [collegeId, "college-id"],
      ...(resume ? [[resume, "resume"] as [File, string]] : []),
      ...evidence.map((f): [File, string] => [f, "evidence"]),
    ];
    for (const [file, kind] of uploads) {
      const path = `${clientRef}/${kind}/${Date.now()}-${safeName(file.name)}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("application-files")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        console.error("Storage upload failed:", upErr);
        return fail(`Could not upload ${file.name}. Nothing was submitted — please try again.`);
      }
      fileRows.push({ kind, storage_path: path, file_name: file.name, content_type: file.type, size_bytes: file.size });
    }

    // 6. Save the application record.
    const { data: app, error: insertErr } = await supabaseAdmin
      .from("applications")
      .insert({
        client_ref: clientRef,
        full_name: d.fullName,
        email: d.email,
        phone: d.phone,
        branch: d.branch,
        year: d.year,
        primary_role: d.primaryRole,
        secondary_role: d.secondaryRole || null,
        skills: d.skills,
        role_assessment: d.roleAssessment,
        project_title: d.projectTitle || null,
        project_description: d.projectDescription || null,
        portfolio_url: d.portfolioUrl || null,
        github: d.github || null,
        behance: d.behance || null,
        website: d.website || null,
        linkedin: d.linkedin || null,
        why_join: d.whyJoin,
        want_to_build: d.wantToBuild,
        problem_solving: d.problemSolving,
        availability: d.availability,
        status: "new",
      })
      .select("id, created_at")
      .single();

    if (insertErr || !app) {
      if (insertErr?.code === "23505") {
        const { data: dup } = await supabaseAdmin.from("applications").select("id").eq("client_ref", clientRef).maybeSingle();
        if (dup) return { ok: true, applicationId: dup.id, alreadySubmitted: true, emails: { notification: "skipped", confirmation: "skipped" } };
      }
      console.error("Application insert failed:", insertErr);
      return fail("Could not save your application. Please try again — your answers are still saved in this browser.");
    }

    const { error: filesErr } = await supabaseAdmin
      .from("application_files")
      .insert(fileRows.map((r) => ({ ...r, application_id: app.id })));
    if (filesErr) {
      console.error("File metadata insert failed:", filesErr);
      return fail("Your files uploaded but the application record could not be completed. Please try again — your answers are still saved in this browser.");
    }

    await supabaseAdmin.from("application_status_history").insert({
      application_id: app.id,
      from_status: null,
      to_status: "new",
      note: "Application submitted",
    });

    // 7. Send emails only after the application is saved. Failures are logged
    // and retried by the scheduled job; they never undo a saved application.
    const { deliverApplicationEmail } = await import("./email.server");
    const emailData = { id: app.id, fullName: d.fullName, email: d.email, primaryRole: d.primaryRole };
    const [notification, confirmation] = await Promise.all([
      deliverApplicationEmail(supabaseAdmin, "admin_notification", emailData),
      deliverApplicationEmail(supabaseAdmin, "applicant_confirmation", emailData),
    ]);

    return {
      ok: true,
      applicationId: app.id,
      alreadySubmitted: false,
      emails: { notification: notification.status, confirmation: confirmation.status },
    };
  });
