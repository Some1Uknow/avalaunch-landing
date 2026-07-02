# AvaLaunch Landing

Full-screen AvaLaunch landing page built with TanStack Start, React 19, Vite 7, and Tailwind v4.

The page ports the Avalanche grant app content and waitlist behavior into the existing dark cinematic hero theme. Each section is one viewport tall and uses scroll snap plus transition states so the current section moves up while the next section rises in from below.

## Sections

- Hero: AvaLaunch headline, video background, animated SVG logo, CTA, and launch-record card.
- Metrics: launch prompt, approval gate, local L1 deploys, and launch record.
- Workflow: describe the L1, review the plan, deploy and manage.
- Outputs: launch plan, deployment record, and run history.
- Avalanche: why the workflow matters for Avalanche L1 builders.
- Comparison: manual process vs existing tools vs AvaLaunch.
- Waitlist: email capture backed by libsql/Turso-compatible storage.
- FAQ: product scope and release path.

## Waitlist Storage

The waitlist uses `@libsql/client`. Configure production storage with any of:

```bash
DATABASE_TURSO_DATABASE_URL=
DATABASE_TURSO_AUTH_TOKEN=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
DATABASE_URL=
DATABASE_AUTH_TOKEN=
WAITLIST_IP_HASH_SALT=
```

Local development falls back to `file:./data/waitlist.db`. Generated DB files are ignored.

## Run

```bash
pnpm install
pnpm dev       # http://localhost:5199
pnpm build
pnpm verify   # requires Playwright Chromium
```

The layout remains desktop-first and preserves the original `html { min-width: 1024px }` constraint.
