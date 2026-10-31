import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, PenTool, Video, Check } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { studio } from "@/config/studio";
import concept from "@/assets/studio-concept.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: `${studio.name} — Build something real` },
    { name: "description", content: "A student-led startup studio for APCOER students in Pune. Build real businesses with ownership, weekly progress and potential—not a mandatory portfolio." },
    { property: "og:title", content: `${studio.name} — Build something real` },
    { property: "og:description", content: "Student-led at APCOER, Pune. Recruiting developers, designers and content creators who want to learn, take ownership and execute." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const roles = [
  { icon: Code2, title: "Developers", copy: "Turn validated problems into working products. Code, APIs, AI and automation." },
  { icon: PenTool, title: "UI/UX Designers", copy: "Understand users. Shape the experience. Make products clear and usable." },
  { icon: Video, title: "Content Creators", copy: "Tell the story, find the audience and bring real users to what we build." },
];
const commitments = [
  "Own agreed deliverables and finish what you commit to.",
  "Communicate early when blocked or unable to deliver.",
  "Make dependable progress every week.",
  "Learn unfamiliar skills; do not wait to be taught everything.",
  "Collaborate, respond reliably and take responsibility.",
  "Prioritize execution over endless brainstorming.",
];
const selection = [
  ["Application", "Motivation and how you think."],
  ["Review", "Potential, curiosity and aptitude."],
  ["Practical task", "A short, role-specific exercise."],
  ["Interview", "Your reasoning and commitment."],
  ["Decision", "A clear next step."],
];
const faqs = [
  ["Who can apply?", `Current students at ${studio.collegeName} (${studio.collegeAbbreviation}), Pune. The application asks for a college ID to verify eligibility. This is a student-led initiative; no official college sponsorship or endorsement is claimed.`],
  ["Do I need previous projects or experience?", "No. Previous projects, portfolio links, GitHub and professional experience are optional supporting evidence—not qualifications. You will not be rejected or ranked lower for having none. Potential matters more than past output."],
  ["What does the practical task test?", "Reasoning, problem-solving, creativity, communication and willingness to learn—not past professional experience. Shortlisted applicants receive clear instructions for a fairly scoped exercise. It is never unpaid production work for a live venture."],
  ["What do I gain—and is pay or equity guaranteed?", "Real execution, ownership, business learning and ambitious peers. We are new. Income, jobs, funding and equity are not promised. Any venture-specific equity would require separate agreements and legal considerations."],
];

function ApplyCTA({ inverse = false }: { inverse?: boolean }) {
  return <Button asChild size="lg" className={inverse ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}>
    <Link to="/apply">Build something real <ArrowRight /></Link>
  </Button>;
}

function Landing() {
  return <div className="min-h-screen">
    <SiteHeader />
    <main>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-14 sm:pb-16 sm:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <p>STUDENT-LED · {studio.collegeAbbreviation}, PUNE</p>
            <p>{studio.recruitmentOpen ? `Founding cohort · ${studio.cohortSize} students` : "Applications closed"}</p>
          </div>
          <h1 className="display mt-9 text-5xl sm:text-7xl lg:text-8xl">Ideas are everywhere.<br /><span className="text-muted-foreground">Builders are rare.</span></h1>
          <p className="mt-7 max-w-2xl text-lg text-muted-foreground">A small team of APCOER students validating real problems and building real businesses—not just projects.</p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <ApplyCTA />
            <Button asChild variant="link" className="px-0"><a href="#commitment">What we expect <ArrowRight /></a></Button>
          </div>
          <p className="mt-7 text-sm font-medium">Built at APCOER, Pune.</p>
          <p className="mt-1 text-xs text-muted-foreground">{studio.collegeName} · Student-led, not an official college programme.</p>
        </div>
      </section>

      <section aria-labelledby="build-heading" className="border-b">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          <div className="grid items-start gap-7 md:grid-cols-[1fr_260px]">
            <div>
              <p className="eyebrow">01 — What we build + who we need</p>
              <h2 id="build-heading" className="mt-3 text-3xl font-semibold sm:text-4xl">Businesses, not busywork.</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Find a real customer problem. Interview people. Validate demand. Build a focused MVP, test it with users and improve it. Then work on distribution, revenue and retention.</p>
            </div>
            <figure className="max-w-sm">
              <img src={concept.url} alt="Stock illustration of people collaborating on ideas in an office; not an APCOER campus or studio photograph" width="1170" height="590" className="aspect-[117/59] w-full object-contain grayscale" loading="lazy" />
              <figcaption className="mt-1 text-[10px] text-muted-foreground">Concept illustration · not an APCOER campus or team photo</figcaption>
            </figure>
          </div>
          <div className="mt-7 grid gap-6 border-t pt-6 sm:grid-cols-3">
            {roles.map(({ icon: Icon, title, copy }) => <div key={title}>
              <div className="flex items-center gap-3"><Icon className="size-4 text-muted-foreground" /><h3 className="font-semibold">{title}</h3></div>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </div>)}
          </div>
          <p className="mt-6 max-w-3xl text-sm"><span className="font-semibold">Potential over portfolio.</span> You do not need previous projects, a polished portfolio, or professional experience. We are looking for people with potential who are willing to learn and build.</p>
        </div>
      </section>

      <section id="commitment" aria-labelledby="commitment-heading" className="scroll-mt-16 border-b bg-secondary">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          <p className="eyebrow">02 — Commitment</p>
          <h2 id="commitment-heading" className="mt-3 text-3xl font-semibold sm:text-4xl">This is not for everyone.</h2>
          <div className="mt-6 grid gap-7 md:grid-cols-2 md:gap-12">
            <div className="space-y-3 text-sm">
              <p className="text-xl font-semibold">We need commitment, not just interest.</p>
              <p>This is not a club you join and forget about. We intend to build real products and real businesses. That takes consistent effort, ownership, communication and follow-through.</p>
              <p className="font-semibold">If you are here only for a title, a certificate, social status or a resume line—or to waste time—this is not for you. Do not apply unless you are prepared to contribute.</p>
              <p className="text-muted-foreground">We do not expect you to know everything. We do expect you to learn, show up, take responsibility and finish what you commit to. Your current skill level matters less than your willingness to improve and execute. No portfolio required. A serious attitude is.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">In practice, that means:</h3>
              <ul className="mt-3 space-y-3 text-sm">{commitments.map(item => <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>{item}</span></li>)}</ul>
              <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">College responsibilities come first. No fixed minimum hours and no around-the-clock expectation. Commitment means dependable progress and accountability—not performative busyness.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="process" aria-labelledby="selection-heading" className="scroll-mt-16 border-b">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          <p className="eyebrow">03 — How selection works</p>
          <h2 id="selection-heading" className="mt-3 text-3xl font-semibold">A clear process. A high standard.</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-5">{selection.map(([title, copy], index) => <li key={title} className="flex gap-3 border-t pt-3 sm:block">
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            <div><h3 className="text-sm font-semibold sm:mt-2">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
          </li>)}</ol>
          <div id="faq" className="mt-7 scroll-mt-16 border-t">
            <Accordion type="single" collapsible>{faqs.map(([q, a]) => <AccordionItem key={q} value={q ?? ""}>
              <AccordionTrigger className="py-3 text-left text-sm">{q}</AccordionTrigger>
              <AccordionContent className="max-w-3xl text-sm text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>)}</Accordion>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12">
          <div><h2 className="text-3xl font-semibold sm:text-4xl">Less talk. More building.</h2><p className="mt-3 max-w-xl text-sm opacity-80">Bring curiosity, ownership and follow-through. Previous work is welcome, never required.</p></div>
          <div className="shrink-0"><ApplyCTA inverse /></div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
