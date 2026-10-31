import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { studio } from "@/config/studio";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy policy — ${studio.name}` },
      { name: "description", content: "How the studio collects, stores and deletes applicant information." },
      { property: "og:title", content: `Privacy policy — ${studio.name}` },
      { property: "og:description", content: "How applicant data is handled during recruitment." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const sections = [
  ["What we collect", "Only what we need to assess your application: contact and academic details, your role and skills, previous work, answers to our questions, and any files you upload (college ID, resume, project evidence)."],
  ["Why we collect your college ID", "Solely to confirm you are a current student. Once eligibility is verified, the file is deleted and only the outcome (verified or not) is kept."],
  ["How files are stored", "Uploads go to private storage. They never have public links and can only be opened by authorised studio administrators through short-lived access. College IDs are never sent by email."],
  ["Browser drafts", "Form drafts are saved only in your own browser on your device so you don't lose progress. They are not a secure record and never include uploaded files. Clearing your browser data removes them."],
  ["Who can see your data", "Only the studio administrators reviewing applications. We don't sell or share applicant data."],
  ["Retention", "Applications are kept for the duration of recruitment and a reasonable period after, then deleted. You can ask us to delete your application at any time."],
  ["Contact", `Email ${studio.contactEmail} for any privacy questions or deletion requests.`],
];

function Privacy() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Privacy policy</h1>
        <div className="mt-14 divide-y border-y">
          {sections.map(([t, d]) => (
            <section key={t} className="py-8">
              <h2 className="text-lg font-semibold">{t}</h2>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
