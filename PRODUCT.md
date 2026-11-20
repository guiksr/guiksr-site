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

- **Nuxt + Nuxt Content + MDC.** Every page is a markdown file in `content/`; editing the site means editing `.md` files. No CMS, no database to babysit.
- Frontmatter carries `title`, `date` and `kind` (`post`, `foto`, `filme`, `página`, `índice`). Folders map to sections: `content/blog/`, `content/fotolog/`, `content/filmes/`.
- MDC block components in `components/content/` (English names: `::photos`, `::right`, `::facts`) cover the few things plain markdown can't, like a photo grid or a note beside the text.
- **Two-way links.** Internal links are plain markdown links (`[blog](/blog)`). Backlinks ("linkado por") are derived at build time by extracting links from every file, so pages never need to list who points at them.
- **Window navigation, not page loads.** Internal links open a new window on a diagonal grid instead of replacing the page (see DESIGN.md §7). The URL holds every open window, so a copied link restores the whole arrangement.
- **Every window is a real route.** `/blog/janelas` server-renders as a normal page; the window desk is progressive enhancement on top.

## Accessibility & Inclusion

Basic: semantic HTML, alt text on images, reasonable contrast, no seizure-inducing animations. Respect `prefers-reduced-motion`. The site should be usable without JavaScript.
