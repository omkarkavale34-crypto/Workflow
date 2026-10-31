import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_NOTIFICATION_SUBJECT, deliverApplicationEmail, MAX_EMAIL_ATTEMPTS } from "@/lib/email.server";

type Row = { status: string };
function fakeAdmin(prior: Row[]) {
  const inserted: Record<string, unknown>[] = [];
  const admin = {
    from: () => ({
      select: () => ({ eq: () => ({ eq: async () => ({ data: prior }) }) }),
      insert: async (row: Record<string, unknown>) => {
        inserted.push(row);
        return { error: null };
      },
    }),
  };
  return { admin: admin as never, inserted };
}

const app = { id: "11111111-1111-1111-1111-111111111111", fullName: "A B", email: "a@b.co", primaryRole: "developer" };

describe("application email delivery", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    process.env["LOVABLE_API_KEY"] = "k";
    process.env["RESEND_API_KEY"] = "r";
    delete process.env["APPLICATION_NOTIFICATION_EMAIL"];
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends the admin notification to omkarkavale888@gmail.com with the required subject", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "re_1" }), { status: 200 }));
    const { admin, inserted } = fakeAdmin([]);
    const res = await deliverApplicationEmail(admin, "admin_notification", app);
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body.to).toEqual(["omkarkavale888@gmail.com"]);
    expect(body.subject).toBe(ADMIN_NOTIFICATION_SUBJECT);
    expect(res.status).toBe("accepted");
    expect(inserted[0]!["status"]).toBe("accepted");
  });

  it("does not send again once an email was accepted", async () => {
    const { admin } = fakeAdmin([{ status: "failed" }, { status: "accepted" }]);
    const res = await deliverApplicationEmail(admin, "admin_notification", app);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toBe("already_accepted");
  });

  it("records a rejected send as failed, not accepted", async () => {
    fetchMock.mockResolvedValue(new Response("forbidden", { status: 403 }));
    const { admin, inserted } = fakeAdmin([]);
    const res = await deliverApplicationEmail(admin, "applicant_confirmation", app);
    expect(res.status).toBe("failed");
    expect(inserted[0]!["status"]).toBe("failed");
  });

  it("stops retrying after the maximum number of failed attempts", async () => {
    const { admin } = fakeAdmin(Array.from({ length: MAX_EMAIL_ATTEMPTS }, () => ({ status: "failed" })));
    const res = await deliverApplicationEmail(admin, "admin_notification", app);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toBe("gave_up");
  });
});
