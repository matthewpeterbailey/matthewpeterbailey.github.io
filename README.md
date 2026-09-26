# Matthew Peter Bailey — portfolio

A statically generated portfolio and Markdown blog built with Astro, TypeScript and focused React components. It includes an atmospheric paper mountain scene, a scroll-linked runner and topic filtering without requiring a database or production server.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321. Astro refreshes the page as source and content change.

Run the production checks and static build with:

```sh
npm run build
```

## Edit your introduction

Edit `content/site.json` for the homepage copy and links. The portrait and other stable media live in `public/assets`. Edit the full biography in `src/content/about/about.md`.

## Publish a post

Add a dated Markdown file such as `src/content/blog/2026-09-26-my-investigation.md`:

```markdown
---
title: My investigation
date: 2026-09-20
tag: Engineering
summary: A short description of the question and what you found.
slug: my-investigation
sample: false
---
Your Markdown content goes here.
```

Dates sort newest first. Slugs must be unique lowercase words separated by hyphens. Astro validates the metadata during the build, so malformed frontmatter or an invalid slug stops publication. Content is trusted author input; do not build untrusted submissions.

## Free deployment with GitHub Pages

The included GitHub Actions workflow installs the locked dependencies, checks and builds the Astro application, then publishes `dist` after each push to `main`. In repository Settings → Pages, the source must be **GitHub Actions**.

The production repository is https://github.com/matthewpeterbailey/matthewpeterbailey.github.io and the live site is https://matthewpeterbailey.github.io/. This workspace tracks the production repository as `origin`. An optional custom domain is the only expected ongoing cost for this setup; GitHub Pages is free for public repositories.

The `.openai/hosting.json` manifest also supports a separate private Sites deployment for review. It does not connect or publish to GitHub Pages.

## Implementation notes

- Astro generates the homepage, About page, blog index and each article as static HTML.
- Markdown posts form a typed content collection described in `src/content.config.ts`.
- React powers the runner and topic filtering; the rest of the site remains static.
- Reduced-motion preference disables the pinned sequence and hides the decorative runner.
- Navigation and articles work without JavaScript.
- Shared styles live in `src/styles/global.css`; stable images and the favicon live in `public`.
- The migration record in `notes/astro-migration.md` captures the steps and measurements for a future blog post.


