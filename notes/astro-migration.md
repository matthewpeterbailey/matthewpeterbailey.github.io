# Astro migration journal

Started: 26 September 2026

## Why change the application?

The original site used a bespoke Node.js script to read Markdown, assemble HTML strings and write every page into `dist`. It was fast in production, but page structure, metadata parsing and build behaviour all lived in one growing file. The migration aims to keep the static output and Markdown workflow while giving pages, components and content explicit structure.

## Baseline

Before the migration, the generated `dist` directory contained:

- 29 files, including 16 HTML pages;
- 1,513,195 bytes in total, most of which were images;
- 67,336 bytes of HTML;
- 9,579 bytes of CSS;
- 3,502 bytes of JavaScript.

The site had 12 published Markdown posts, an About page written in Markdown, a tag filter and a scroll-driven runner animation. GitHub Actions ran `npm install --ignore-scripts` followed by `npm run build`, then deployed `dist` to GitHub Pages.

## Steps taken

1. Installed Astro, the Astro React integration, React and React DOM.
2. Added Astro's strict TypeScript configuration and a static-site configuration for `https://matthewpeterbailey.github.io`.
3. Moved the 12 blog posts into an Astro content collection and described their frontmatter with a schema.
4. Kept site-wide editable copy in JSON and moved reusable images into `public/assets`, separating source assets from generated output.
5. Replaced the single HTML-generating script with Astro layouts, pages and components.
6. Rebuilt the runner and tag filter as small React components. They are hydrated only on the pages that use them; article and About pages remain static HTML.
7. Preserved the existing `/`, `/about/`, `/blog/` and `/blog/{slug}/` URLs so existing links continue to work.
8. Retained the current GitHub Pages workflow: the implementation changes, but deployment still publishes the generated `dist` directory.

The first content sync failed on two titles containing colons. The original hand-written parser treated everything after `title:` as plain text, while Astro uses YAML frontmatter and correctly identified the ambiguity. Quoting those titles made the metadata valid without changing the displayed copy. This was a small example of stricter tooling exposing a format assumption that the original build had hidden.

## Decisions worth discussing in a post

- Astro is the page and content framework; React is reserved for browser interaction rather than used for every page.
- Static generation means GitHub Pages still needs no server, database or runtime.
- A content schema makes malformed post metadata fail during the build instead of producing a broken page.
- Files in `public` retain stable URLs, which matters for images already referenced by published articles.
- Preserving URLs is part of the migration, not a follow-up task.

## First build results

The production command runs `astro check` before `astro build`. It completed with no errors, warnings or hints. Astro generated the same 16 pages in 2.93 seconds; the complete command took longer because the type and template check runs first.

The new `dist` directory contains:

- 32 files, including the same 16 HTML pages;
- 1,751,113 bytes in total;
- 83,556 bytes of HTML;
- 9,681 bytes of CSS;
- 225,099 bytes of JavaScript before compression.

The JavaScript increase is the main trade-off. React and its browser renderer account for most of it; the runner and blog filter components themselves are small. Articles and the About page do not load React. The homepage still contains the ten most recent posts, the blog archive contains all twelve posts, every existing article slug generated successfully and the tag query-string filter was checked in a browser.

## Remaining production check

- verify that GitHub Pages publishes the Astro output successfully before treating the migration as complete.
