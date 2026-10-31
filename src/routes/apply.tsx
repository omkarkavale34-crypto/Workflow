import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, X } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";
import { ROLES, studio } from "@/config/studio";
import { stepSchemas } from "@/lib/application-schema";
import { submitApplication } from "@/lib/submit-application.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: `Apply — ${studio.name}` },
      { name: "description", content: "Apply to join the founding cohort of a student-led startup studio in Pune." },
      { property: "og:title", content: `Apply to ${studio.name}` },
      { property: "og:description", content: "Developers, designers and content creators: build something real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Apply,
});

const DRAFT_KEY = "studio-application-draft-v1";
const REF_KEY = "studio-application-ref-v1";
const schemas = stepSchemas;

const empty = {
  fullName: "", email: "", phone: "", branch: "", year: "",
  primaryRole: "", secondaryRole: "", skills: "", roleAssessment: "",
  projectTitle: "", projectDescription: "", portfolioUrl: "", github: "", behance: "", website: "", linkedin: "",
  whyJoin: "", wantToBuild: "", problemSolving: "", availability: "",
};
type Form = typeof empty;
type Key = keyof Form;
type Errs = Partial<Record<Key | "collegeId" | "evidence" | "ack", string>>;
type Files = { collegeId: File | null; resume: File | null; evidence: File[] };
const STEPS = ["About you", "Role & skills", "Previous work (optional)", "Motivation", "Review"];

const assessmentPrompt: Record<string, string> = {
  developer: "Describe something technically hard you built. What was the problem, what stack did you choose and why, and what would you change now?",
  designer: "Walk us through a design decision you made based on user feedback or research. What changed and why?",
  content: "Describe a piece of content you created that performed well (or badly). What did you learn about the audience?",
};

function Apply() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [files, setFiles] = useState<Files>({ collegeId: null, resume: null, evidence: [] });
  const [errors, setErrors] = useState<Errs>({});
  const [ack, setAck] = useState(false);
  const [hp, setHp] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; confirmation: string } | null>(null);
  const clientRef = useRef("");
  const topRef = useRef<HTMLDivElement>(null);
  const submitFn = useServerFn(submitApplication);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm({ ...empty, ...JSON.parse(raw) });
      let ref = localStorage.getItem(REF_KEY);
      if (!ref) {
        ref = crypto.randomUUID();
        localStorage.setItem(REF_KEY, ref);
      }
      clientRef.current = ref;
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, loaded]);

  if (!studio.recruitmentOpen) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24">
          <h1 className="display text-5xl">Applications are closed.</h1>
          <Link to="/closed" className="mt-8 inline-block underline">Learn more</Link>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24">
          <p className="eyebrow">Application submitted</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">We've got it.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Your application has been submitted and saved. Your reference is{" "}
            <span className="font-mono text-sm text-foreground">{submitted.id}</span>
          </p>
          <p className="mt-4 text-muted-foreground">
            {submitted.confirmation === "accepted" || submitted.confirmation === "already_accepted"
              ? "We've sent a confirmation email with your reference. If it isn't in your inbox, check spam. We review every application by hand and will be in touch."
              : "Please save your reference above. We review every application by hand and will be in touch by email."}
          </p>
          <Link to="/" className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-85">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </main>
      </div>
    );
  }

  const set = (k: Key, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = (s: number) => {
    const errs: Errs = {};
    if (s < 4) {
      const r = schemas[s]!.safeParse(form);
      if (!r.success) r.error.issues.forEach((i) => (errs[String(i.path[0]) as Key] ||= i.message));
      if (s === 0 && !files.collegeId) errs.collegeId = "College ID is required for eligibility verification";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const go = (n: number) => {
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const next = () => validate(step) && go(step + 1);

  const submit = async () => {
    if (hp || submitting) return;
    for (let s = 0; s < 4; s++) if (!validate(s)) return go(s);
    if (!ack) return setErrors({ ack: "Please confirm you've read the privacy policy" });
    setSubmitError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(form)) fd.set(k, v);
      fd.set("clientRef", clientRef.current);
      if (files.collegeId) fd.set("collegeId", files.collegeId);
      if (files.resume) fd.set("resume", files.resume);
      for (const f of files.evidence) fd.append("evidence", f);
      const result = await submitFn({ data: fd });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(REF_KEY);
      setSubmitted({ id: result.applicationId, confirmation: result.emails.confirmation });
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong while submitting. Your answers are still saved in this browser — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (k: Key) => ({ value: form[k] ?? "", onChange: (v: string) => set(k, v), error: errors[k], id: k });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10" ref={topRef}>
        <p className="eyebrow">Founding cohort application</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">{STEPS[step]}</h1>

        <nav aria-label="Progress" className="mt-8">
          <ol className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <div className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
                <span className={cn("mt-2 hidden text-xs sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 font-mono text-xs text-muted-foreground sm:hidden">Step {step + 1} of {STEPS.length}</p>
        </nav>

        <div className="mt-10 space-y-7">
          {step === 0 && (
            <>
              <Field label="Full name" {...field("fullName")} autoComplete="name" />
              <Field label="College email" type="email" {...field("email")} autoComplete="email" hint="Use your college-issued address if you have one." />
              <Field label="Phone number" type="tel" {...field("phone")} autoComplete="tel" />
              <Field label="Branch / department" {...field("branch")} />
              <Select label="Current academic year" {...field("year")} options={[["1", "1st year"], ["2", "2nd year"], ["3", "3rd year"], ["4", "4th year"], ["5", "5th year / other"]]} />
              <Upload
                id="collegeId" label="College ID" required
                hint={`Used only to verify you're a current student, stored privately, and deleted after verification. ${studio.uploads.collegeId.label}, max ${studio.uploads.collegeId.maxMB} MB.`}
                cfg={studio.uploads.collegeId} files={files.collegeId ? [files.collegeId] : []}
                onChange={(f) => { setFiles((x) => ({ ...x, collegeId: f[0] ?? null })); setErrors((e) => ({ ...e, collegeId: "" })); }}
                error={errors.collegeId}
              />
            </>
          )}
          {step === 1 && (
            <>
              <RoleRadio label="Primary role" value={form.primaryRole} onChange={(v) => set("primaryRole", v)} error={errors.primaryRole} />
              <Select label="Secondary role" optional {...field("secondaryRole")} options={[["", "None"], ...ROLES.filter((r) => r.id !== form.primaryRole).map((r) => [r.id, r.label] as [string, string])]} />
              <Area label="Primary skills, tools and interests" rows={3} {...field("skills")} hint="e.g. React, Postgres, Figma, Premiere, copywriting…" />
              <Area label="Role-specific question" rows={6} {...field("roleAssessment")} hint={assessmentPrompt[form.primaryRole] ?? "Choose a primary role to see your question."} />
            </>
          )}
          {step === 2 && (
            <>
              <p className="rounded-md border p-4 text-sm text-muted-foreground">
                This whole step is optional. We don't expect you to arrive with projects — we want to discover what you're capable of building. If you have something to share, great. If not, just press Continue. It won't count against you.
              </p>
              <Field label="Something you've built, designed or created" optional {...field("projectTitle")} />
              <Area label="What it is and what you did" optional rows={5} {...field("projectDescription")} />
              <Field label="Portfolio or project URL" optional {...field("portfolioUrl")} />
              <Upload id="evidence" label="Screenshots or other evidence" optional multiple hint={`Images, docs, demos. ${studio.uploads.evidence.label}, max ${studio.uploads.evidence.maxMB} MB each, up to 5 files.`}
                cfg={studio.uploads.evidence} files={files.evidence}
                onChange={(f) => { setFiles((x) => ({ ...x, evidence: f.slice(0, 5) })); setErrors((e) => ({ ...e, evidence: "" })); }}
                error={errors.evidence}
              />
              <Upload id="resume" label="Resume / CV" optional hint={`PDF, max ${studio.uploads.resume.maxMB} MB.`} cfg={studio.uploads.resume}
                files={files.resume ? [files.resume] : []} onChange={(f) => setFiles((x) => ({ ...x, resume: f[0] ?? null }))} />
              <fieldset className="grid gap-5 border-t pt-7 sm:grid-cols-2">
                <legend className="mb-4 text-sm font-medium">Profiles <span className="text-muted-foreground">(optional)</span></legend>
                <Field label="GitHub" optional {...field("github")} />
                <Field label="Behance / Dribbble" optional {...field("behance")} />
                <Field label="Personal website" optional {...field("website")} />
                <Field label="LinkedIn or social" optional {...field("linkedin")} />
              </fieldset>
            </>
          )}
          {step === 3 && (
            <>
              <Area label="Why do you want to join the studio?" rows={5} {...field("whyJoin")} />
              <Area label="What do you want to build or learn?" rows={4} {...field("wantToBuild")} />
              <Area label="Problem-solving question" rows={6} {...field("problemSolving")} hint="Pick a problem you've personally noticed around campus or in Pune. Who has it, how do they deal with it today, and how would you check whether people would pay for a solution?" />
              <Field label="Realistic weekly availability" {...field("availability")} hint="Be honest — e.g. ‘8–10 hrs/week, lighter during exams’." />
            </>
          )}
          {step === 4 && (
            <Review form={form} files={files} onEdit={go} />
          )}
        </div>

        {step === 4 && (
          <div className="mt-10 space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); setErrors((x) => ({ ...x, ack: "" })); }} className="mt-0.5 size-4 accent-[var(--color-primary)]" />
              <span>I've read the <Link to="/privacy" className="underline">privacy policy</Link> and confirm the information above is accurate. I understand my college ID is used only for eligibility and deleted after verification.</span>
            </label>
            {errors.ack && <p className="text-sm text-destructive" role="alert">{errors.ack}</p>}
            <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px]" value={hp} onChange={(e) => setHp(e.target.value)} name="company" />
            {submitError && <p className="rounded-md border border-destructive p-4 text-sm text-destructive" role="alert">{submitError}</p>}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          {step > 0 ? (
            <button onClick={() => go(step - 1)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"><ArrowLeft className="size-4" /> Back</button>
          ) : <span />}
          {step < 4 ? (
            <button onClick={next} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-85">Continue <ArrowRight className="size-4" /></button>
          ) : (
            <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting…" : "Submit application"}</button>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Text answers are saved as a draft in this browser only — not across devices, and not a secure record. Uploaded files are never saved in drafts.
        </p>
      </main>
    </div>
  );
}

type FP = { id: string; label: string; value: string; onChange: (v: string) => void; error?: string | undefined; hint?: string | undefined; optional?: boolean | undefined };

function Label({ id, label, optional }: { id: string; label: string; optional?: boolean | undefined }) {
  return (
    <label htmlFor={id} className="mb-2 block text-sm font-medium">
      {label} {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : <span aria-hidden className="text-muted-foreground">*</span>}
    </label>
  );
}
function Meta({ id, hint, error }: { id: string; hint?: string | undefined; error?: string | undefined }) {
  return (
    <>
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-destructive" role="alert">{error}</p>}
    </>
  );
}
const inputCls = (err?: string | undefined) => cn("w-full rounded-md border bg-background px-3 py-2.5 text-base outline-none transition-colors focus:border-foreground", err ? "border-destructive" : "border-input");
const aria = (id: string, error?: string | undefined, hint?: string | undefined) => ({ "aria-invalid": !!error, "aria-describedby": [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined });

function Field({ type = "text", autoComplete, ...p }: FP & { type?: string; autoComplete?: string }) {
  return (
    <div>
      <Label {...p} />
      <input id={p.id} type={type} autoComplete={autoComplete} value={p.value} onChange={(e) => p.onChange(e.target.value)} className={inputCls(p.error)} {...aria(p.id, p.error, p.hint)} />
      <Meta {...p} />
    </div>
  );
}
function Area({ rows, ...p }: FP & { rows: number }) {
  return (
    <div>
      <Label {...p} />
      <textarea id={p.id} rows={rows} value={p.value} onChange={(e) => p.onChange(e.target.value)} className={inputCls(p.error)} {...aria(p.id, p.error, p.hint)} />
      <div className="flex justify-between gap-4"><div className="flex-1"><Meta {...p} /></div><span className="mt-1.5 font-mono text-xs text-muted-foreground">{p.value.length}</span></div>
    </div>
  );
}
function Select({ options, ...p }: FP & { options: [string, string][] }) {
  return (
    <div>
      <Label {...p} />
      <select id={p.id} value={p.value} onChange={(e) => p.onChange(e.target.value)} className={inputCls(p.error)} {...aria(p.id, p.error, p.hint)}>
        {!p.optional && <option value="" disabled>Select…</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Meta {...p} />
    </div>
  );
}
function RoleRadio({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string | undefined }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">{label} <span aria-hidden className="text-muted-foreground">*</span></legend>
      <div className="grid gap-2">
        {ROLES.map((r) => (
          <label key={r.id} className={cn("flex cursor-pointer items-center justify-between rounded-md border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2", value === r.id ? "border-foreground bg-accent" : "hover:bg-accent/60")}>
            <span>{r.label}</span>
            <input type="radio" name="primaryRole" value={r.id} checked={value === r.id} onChange={() => onChange(r.id)} className="sr-only" />
            {value === r.id && <Check className="size-4" />}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive" role="alert">{error}</p>}
    </fieldset>
  );
}

const fmt = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

function Upload({ id, label, hint, cfg, files, onChange, error, optional, required, multiple }: {
  id: string; label: string; hint: string; cfg: { maxMB: number; accept: readonly string[] }; files: File[];
  onChange: (f: File[]) => void; error?: string | undefined; optional?: boolean; required?: boolean; multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [localErr, setLocalErr] = useState("");
  const pick = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const bad = picked.find((f) => !cfg.accept.includes(f.type) || f.size > cfg.maxMB * 1024 * 1024);
    if (bad) {
      setLocalErr(!cfg.accept.includes(bad.type) ? `${bad.name}: file type not allowed` : `${bad.name}: larger than ${cfg.maxMB} MB`);
    } else {
      setLocalErr("");
      onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
    }
    if (ref.current) ref.current.value = "";
  };
  const err = localErr || error;
  return (
    <div>
      <Label id={id} label={label} optional={optional && !required} />
      <input ref={ref} id={id} type="file" className="sr-only" accept={cfg.accept.join(",")} multiple={multiple} onChange={(e) => pick(e.target.files)} {...aria(id, err, hint)} />
      {files.length > 0 && (
        <ul className="mb-2 divide-y rounded-md border">
          {files.map((f, i) => (
            <li key={f.name + i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{fmt(f.size)}</span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))} className="rounded p-1 hover:bg-accent"><X className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => ref.current?.click()} className={cn("w-full rounded-md border border-dashed px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground", err && "border-destructive")}>
        {files.length && !multiple ? "Replace file" : multiple && files.length ? "Add more files" : "Choose file"}
      </button>
      <Meta id={id} hint={hint} error={err} />
    </div>
  );
}

function Review({ form, files, onEdit }: { form: Form; files: Files; onEdit: (s: number) => void }) {
  const role = (id: string) => ROLES.find((r) => r.id === id)?.label ?? "—";
  const groups: [number, [string, string][]][] = [
    [0, [["Name", form.fullName], ["Email", form.email], ["Phone", form.phone], ["Branch", form.branch], ["Year", form.year], ["College ID", files.collegeId?.name ?? "—"]]],
    [1, [["Primary role", role(form.primaryRole)], ["Secondary role", form.secondaryRole ? role(form.secondaryRole) : "None"], ["Skills", form.skills], ["Role question", form.roleAssessment]]],
    [2, [["Previous work", form.projectTitle || "None shared"], ["Description", form.projectDescription], ["Portfolio", form.portfolioUrl || "—"], ["Evidence", files.evidence.map((f) => f.name).join(", ") || "—"], ["Resume", files.resume?.name ?? "—"]]],
    [3, [["Why join", form.whyJoin], ["Want to build", form.wantToBuild], ["Problem solving", form.problemSolving], ["Availability", form.availability]]],
  ];
  return (
    <div className="space-y-8">
      {groups.map(([s, rows]) => (
        <section key={s} className="rounded-md border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">{STEPS[s]}</h2>
            <button onClick={() => onEdit(s)} className="text-sm underline underline-offset-4">Edit</button>
          </div>
          <dl className="divide-y">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="whitespace-pre-wrap break-words">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
