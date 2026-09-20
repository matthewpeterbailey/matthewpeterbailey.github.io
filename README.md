# Matthew Peter Bailey — portfolio

A static portfolio and Markdown blog with an atmospheric paper mountain scene, a scroll-linked runner, and a portrait reveal. No client framework, external fonts, database, or server runtime is needed in production.

## Local development

Requires Node.js 22 or newer.

```sh
npm install
npm run build
npm run dev
```

Open http://127.0.0.1:4321. Re-run the build after changing content; reload the browser after edits.

## Edit your introduction

Edit `content/site.json`. The headline and introduction are provisional copy. The headline accepts trusted HTML for the italic second line. Add your portrait to `dist/assets/portrait.webp`, then set `portrait` to `./assets/portrait.webp`. Until supplied, an explicitly labelled monogram placeholder fades in instead. Edit the full biography in `content/about.md`.

## Publish a post

Add a numbered Markdown file such as `content/04-my-investigation.md`:

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

Only numbered Markdown files are posts. Dates sort newest first. Slugs must be unique lowercase words separated by hyphens. Content is trusted author input; do not build untrusted submissions. The three initial posts are labelled samples, not claims about your work. Replace or remove them before a public launch.

## Free deployment with GitHub Pages

1. Create a public repository under `matthewpeterbailey` and push this project to its `main` branch.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
3. The included workflow builds and publishes after each push to `main`.

For `matthewpeterbailey.github.io`, use that exact repository name. A repository named `portfolio` produces `https://matthewpeterbailey.github.io/portfolio/`. Relative links support either location. An optional custom domain is the only expected ongoing cost for this setup; GitHub Pages is free for public repositories. No GitHub repository has been created or modified by this build.

The `.openai/hosting.json` manifest also supports a separate private Sites deployment for review. It does not connect or publish to GitHub Pages.

## Implementation notes

- Authored shared styles, animation, favicon, and optimized assets live in `dist`; keep these files tracked.
- HTML is generated from `content` by `scripts/build.mjs`.
- Reduced-motion preference disables the pinned sequence and displays the portrait immediately.
- Navigation and articles work without JavaScript.
- Artwork was generated with the built-in image generator. Landscape prompt: atmospheric layered green paper mountains, clear offwhite sky, mist and tactile paper grain, no text or people. Runner prompt: full-body black runner silhouette facing right, separated limbs, crisp paper-cut style, transparent background. Assets: `dist/assets/mountains.webp`, `dist/assets/runner.webp`.
