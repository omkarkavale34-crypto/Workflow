import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { studio } from "@/config/studio";

export const Route = createFileRoute("/closed")({
  head: () => ({
    meta: [
      { title: `Applications closed — ${studio.name}` },
      { name: "description", content: "The founding cohort has been filled. Applications are currently closed." },
      { property: "og:title", content: `Applications closed — ${studio.name}` },
      { property: "og:description", content: "The founding cohort has been filled." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Closed,
});

function Closed() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-5 py-24">
        <p className="eyebrow">Recruitment closed</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The founding cohort is filled.</h1>
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          We're not accepting applications right now. Thank you for your interest — keep building.
        </p>
        <Link to="/" className="mt-10 w-fit rounded-md border px-5 py-2.5 font-medium hover:bg-accent">Back home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
