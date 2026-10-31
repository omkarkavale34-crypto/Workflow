import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Scheduled job: retries application emails whose last attempt failed.
// Duplicate-safe: each email is skipped once accepted and uses a stable idempotency key.
export const Route = createFileRoute("/api/public/jobs/retry-application-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { deliverApplicationEmail } = await import("@/lib/email.server");

        const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
        const { data: failed, error } = await supabaseAdmin
          .from("email_events")
          .select("application_id, kind")
          .in("status", ["failed", "not_configured"])
          .gte("created_at", since)
          .not("application_id", "is", null)
          .limit(200);
        if (error) return Response.json({ ok: false, error: "query failed" }, { status: 500 });

        const pairs = new Map<string, { id: string; kind: "admin_notification" | "applicant_confirmation" }>();
        for (const r of failed ?? []) {
          if (r.kind !== "admin_notification" && r.kind !== "applicant_confirmation") continue;
          pairs.set(`${r.application_id}:${r.kind}`, { id: r.application_id!, kind: r.kind });
        }

        const summary: Record<string, number> = {};
        for (const { id, kind } of pairs.values()) {
          const { data: app } = await supabaseAdmin
            .from("applications")
            .select("id, full_name, email, primary_role")
            .eq("id", id)
            .maybeSingle();
          if (!app) continue;
          const res = await deliverApplicationEmail(supabaseAdmin, kind, {
            id: app.id,
            fullName: app.full_name,
            email: app.email,
            primaryRole: app.primary_role,
          });
          summary[res.status] = (summary[res.status] ?? 0) + 1;
        }
        return Response.json({ ok: true, checked: pairs.size, summary });
      },
    },
  },
});
