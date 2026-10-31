import { Link } from "@tanstack/react-router";
import { studio } from "@/config/studio";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="max-w-[60%] text-sm font-semibold">
          {studio.name}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm">
          <a href="/#process" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            Process
          </a>
          <a href="/#faq" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            FAQ
          </a>
          <Button asChild size="sm"><Link to="/apply">Apply</Link></Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div><span className="font-semibold">{studio.name}</span><p className="mt-1 text-xs text-muted-foreground">Made by {studio.makerName}</p></div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
          <a href={`mailto:${studio.contactEmail}`} className="hover:text-foreground">
            {studio.contactEmail}
          </a>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy policy
          </Link>
          <span>© {new Date().getFullYear()} {studio.name}</span>
        </div>
      </div>
    </footer>
  );
}
