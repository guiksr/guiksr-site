# Product

## Register

brand

## Users

General visitors and peers (designers, developers, internet friends). People stumbling onto the site should feel like they found someone's actual corner of the internet — not a resume, not a portfolio, not a product. The site is a living scrapbook: blog posts, photos, movie logs, things that caught attention. Visitors should walk away feeling like they got a genuine sense of who guiksr is.

## Product Purpose

A personal website that works as a home base on the internet — part blog, part fotolog, part media tracker, part digital scrapbook. It exists because personal websites should feel personal, not templated. Success looks like a site that's fun to maintain and fun to visit, where the medium is part of the message.

## Brand Personality

Playful, curious, authentic. The energy of someone who makes things because they like making things. Not trying to impress — just sharing. A little weird, a little messy, comfortable with imperfection. The tone is casual Portuguese-speaking internet, not corporate English.

## Anti-references

- **Polished portfolios**: no Dribbble-perfect case studies, no corporate design agency presentations, no "selected works" with hover animations
- **Generic dev blogs**: no cookie-cutter blog templates, no Medium/Substack/Ghost defaults with serif headings and reading-time estimates
- **Minimalist one-pagers**: no sparse white-space-heavy pages with just a name and three links (the current site, ironically)
- **SaaS / startup sites**: no hero sections with gradient CTAs, feature grids, or social proof strips
- **Tumblr nostalgia cosplay**: the early-web reference is about the energy (personal, scrapbook, authentic), not about literally recreating 2012 Tumblr themes with pixel fonts and GIF backgrounds

## Design Principles

1. **The site is the sketchbook, not the exhibition** — it should feel like a living, evolving space, not a finished artifact. Rough edges are fine if they're honest.
2. **Personality over polish** — every design choice should reveal something about who guiksr is. Generic "good design" is the enemy.
3. **Show the collection** — the value is in the accumulation of things: posts, photos, films, links. The design should make browsing and discovering feel natural.
4. **Keep it maintainable** — if it's painful to update, it won't get updated. The tech should stay simple enough that adding a new post or photo isn't a chore.
5. **The web is the medium** — lean into what the web does well. Links, pages, scroll, color. Not an app, not a PDF, not a social profile.

## Stack & Content Model

- **Astro, static.** Every page is a markdown file in `src/content/`; editing the site means editing `.md` files. `astro build` outputs plain HTML. No CMS, no server, no database.
- Frontmatter carries `title`, `kind` (`home`, `índice`, `post`, `foto`, `filme`, `página`) and optional `date`/`description`. Folders map to sections (only `blog/` at launch). Full authoring reference: `docs/writing.md`.
- A few block components cover what plain markdown can't: `:::left` / `:::right` (things beside the text), `:::facts` (a fact sheet), `:::photos` (a photo grid). See README.md.
- **Two-way links.** Internal links are plain markdown links (`[blog](/blog)`). Backlinks ("linkado por") are computed at build time from the links in every file.
- **The trail, not page loads.** With JavaScript, internal links open the next page beside the current one along a diagonal (see DESIGN.md §7). The address holds the whole trail (`/blog/janelas/?w=index,blog`), so a copied link restores it.
- **Every page is a real page.** `/blog/janelas/` is static HTML that works on its own and without JavaScript; the trail is progressive enhancement on top.
- **Not published yet.** When it is: GitHub Pages via Actions (the domain is already set up there, `public/CNAME`) or Firebase Hosting.

## Accessibility & Inclusion

Basic: semantic HTML, alt text on images, reasonable contrast, no seizure-inducing animations. Respect `prefers-reduced-motion`. The site should be usable without JavaScript.
