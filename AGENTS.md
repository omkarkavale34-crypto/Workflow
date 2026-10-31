<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Studio branding, contact, cohort size, upload limits live in src/config/studio.ts — keeps operational settings changeable in one place.
- Keep college identity and maker attribution in the studio configuration; use the shared site chrome and design-system buttons for landing navigation so branding and controls remain consistent.
- Spec asked for Next.js/Vercel; the project uses TanStack Start on Lovable hosting (platform constraint) with Lovable Cloud for data/storage/auth.
