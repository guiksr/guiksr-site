<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: guiksr
description: A personal corner of the internet — blog, fotolog, film log, digital scrapbook.
---

# Design System: guiksr

## 1. Overview

**Creative North Star: "The Bedroom Desk"**

A surface covered in ticket stubs, magazine cutouts, postcards, and half-finished sketches. Not curated for display — curated by use. The site should feel like someone's actual space: warm, specific, a little chaotic, deeply personal. The design is opinionated without being precious. It has the energy of someone who makes things because they like making things.

The system operates in two modes: **committed** on the home page (a saturated brand color carries the identity, the surface IS the statement) and **restrained** on content-focused pages (tinted neutrals + accent, letting posts, photos, and logs breathe). This dual strategy prevents the brand from competing with its own content.

Motion is restrained — state changes, hovers, transitions. The content is the show, not the container. The site should be usable without JavaScript.

**Key Characteristics:**
- Warm honey-amber primary anchors the brand on the home page
- Display typeface from Velvetyne (or similarly characterful independent foundry) paired with a monospace body
- No entrance animations or scroll-driven choreography — interactions respond, they don't perform
- Playful without being juvenile; curious without being random
- The accumulation of content IS the design — the system should make collections feel rich, not repetitive

This system explicitly rejects: polished portfolio aesthetics (no case studies, no "selected works"), generic dev blog templates (no Medium/Substack defaults), minimalist one-pagers (no sparse white-space-heavy pages with just links), SaaS/startup patterns (no hero CTAs, feature grids, gradient buttons), and Tumblr nostalgia cosplay (the early-web reference is energy, not literal recreation).

## 2. Colors

A committed honey-amber palette on the home page; restrained warm neutrals + accent on content pages.

### Primary
- **Honey Amber** — oklch(0.72 0.140 77): The brand's anchor color. Carries 30-60% of the home page surface. Warm, confident, a little unexpected for a personal site (not the default dev-blue or portfolio-black). White text on primary fills.

### Desk
- **Rosa**: oklch(0.9 0.055 350), grid lines oklch(0.85 0.07 350). The color of the infinite desk the windows sit on, and a nod to the old site's pink. Chosen over amber, paper, white, sage, graphite and indigo in the prototypes. Text on it stays ink.

### Neutral
- **Pure White** — oklch(1.000 0.000 0): Default page background on content pages. No hidden warmth — the primary and accent carry the brand's temperature.
- **Warm Paper** — oklch(0.955 0.005 77): Surface color for cards, panels, sections. Barely perceptible warmth.
- **Near-Black** — oklch(0.15 0.010 77): Body text ink. Hint of warmth at the hue level, reads as black.
- **Warm Gray** — oklch(0.52 0.008 77): Secondary text, metadata, timestamps. Clearly subordinate to ink.

### Accent
- **Deep Indigo** — oklch(0.42 0.195 285): Links, badges, interactive highlights. Strong hue contrast against the honey primary (77° vs 285°). White text on filled accent elements.

[Exact values to be resolved during implementation. Palette direction is set; fine-tuning happens when there's code to test against.]

### Named Rules
**The Two-Mode Rule.** The home page is committed — honey amber IS the page. Content pages are restrained — white ground, amber and indigo as accents only. Never mix: don't drench a blog post, don't neutralize the home.

## 3. Typography

**Display Font:** [Velvetyne or similarly characterful independent foundry — to be chosen at implementation. VG5000 energy but potentially less maximal. Candidates: Sporting Grotesque, Lack, Bricolage Grotesque, or another face that's quirky without being illegible.]

**Body Font:** System monospace stack or a specific mono (not IBM Plex Mono — reflex-reject). Mono-forward: code-native energy, builder's workshop.

**Character:** The pairing should feel like a handmade zine's title set against typewriter body text. The display face has personality and opinion; the mono body is functional and honest. The contrast between the two IS the brand voice.

### Hierarchy
- **Display** (bold, clamp scale, ~1.0 line-height): Page titles, home page statement. The face does the work.
- **Headline** (display face, lighter weight or smaller, ~1.2 line-height): Section headings, post titles in lists.
- **Body** (mono, regular, ~16-18px, ~1.6 line-height, max 65-75ch): Blog posts, descriptions, long-form content.
- **Label** (mono, small, ~13-14px): Dates, metadata, tags, navigation items.

[Font pairing to be chosen at implementation.]

### Named Rules
**The Honest Mono Rule.** Body text is monospace because the author writes code and the site is built by hand. It's not decoration — it's voice. If the mono ever feels like costume, the font choice is wrong.

## 4. Elevation

Flat by default. No shadows. Depth is conveyed through color shifts (surface vs. background) and spatial separation (generous spacing between sections). The scrapbook metaphor works through layering of content, not through drop shadows or z-axis illusion.

### Named Rules
**The Flat Desk Rule.** Everything sits on the same surface. Items are distinguished by their content and position, not by floating above each other. If something needs emphasis, use color or scale, not elevation.

## 5. Components

[No components exist yet. To be documented after implementation.]

## 6. Do's and Don'ts

### Do:
- **Do** use the display typeface as the primary brand signal — it should be recognizable and specific to this site.
- **Do** let content accumulate visually. A page with 30 photo thumbnails or 50 movie titles should feel rich, not overwhelming.
- **Do** use the committed honey-amber surface on the home page. Let it be bold.
- **Do** write in casual Portuguese. The site's voice is pt-BR internet, not corporate English.
- **Do** keep the tech simple enough that adding a new post is never a chore.
- **Do** respect `prefers-reduced-motion` — all transitions should have a reduced-motion alternative.

### Don't (navigation):
- **Don't** scatter windows. Positions always snap to the grid; the diagonal is a rule, not a vibe.
- **Don't** use drop shadows to lift windows (Flat Desk Rule). Borders and z-order do the work.
- **Don't** use drag and drop, not for windows and not for panning. Navigation is clicks and scroll: click opens and focuses, scroll reads a window or pans the desk.

### Don't:
- **Don't** build polished portfolio case studies with hover animations and "selected works" sections.
- **Don't** use generic blog templates — no Medium/Substack/Ghost defaults with serif headings and reading-time estimates.
- **Don't** make it a minimalist one-pager with just a name and three links (that's the current site, and it's what we're leaving behind).
- **Don't** use SaaS patterns — no hero sections with gradient CTAs, feature grids, or social proof.
- **Don't** cosplay early-web Tumblr with pixel fonts and GIF backgrounds. The reference is the energy (personal, authentic), not the literal aesthetic.
- **Don't** use IBM Plex Mono, IBM Plex Sans, Inter, Space Mono, Space Grotesk, or other training-data default fonts.
- **Don't** use side-stripe borders, gradient text, glassmorphism, or identical card grids.
- **Don't** put tiny uppercase tracked eyebrows above every section.
- **Don't** default to editorial-magazine aesthetics (display serif + italic + drop caps + broadsheet grid).

## 7. Navigation: Janelas

The site is one infinite desk, not a stack of pages. Clicking an internal link opens the target as a **window** placed on the desk's grid, one step right and down from where it came from, so a browsing session reads as a diagonal trail. Inspired by Obsidian-style stacked notes, but with more window and more grid: less paper, more desk.

**Prototypes:** `prototypes/` (open `prototypes/index.html`). Three takes on the same content:
1. **Escada**: a single linear trail. Opening a link from an older window cuts the trail there. Scrolling outside the windows walks the trail, one window per gesture: down/right goes to the next window, up/left to the previous.
2. **Árvore**: nothing closes on its own. Each link branches a child to the right, siblings stack in lanes, and wires connect the exact link to the window it opened. Scrolling outside the windows moves between them like the arrow keys, one window per gesture: up/down goes to the previous/next window in reading order, sideways goes to the parent/child (returning down the branch you came up). Zoomed out, scroll pans instead.
3. **Cascata**: a small window manager. One window per page, click to bring a window to the front, double-click the title bar to minimize. Layout comes only from the "cascata" and "grade" buttons; "grade" makes columns stepped down a diagonal.

4. **Fluxo**: escada without windows, and the current direction. No boxes, no internal scroll, no grid: the trail is one continuous dark page of narrow (~360px) text columns. Each page sits one column right of the previous one and starts 42vh below where it ends, so the trail reads as a diagonal and even a short page (like `blog`) holds the reader for most of a screen of scrolling. The active column is the one whose top has crossed the reading line (40% down). The track slides (0.5s) to center it, and the other columns fade to 20% (55% on hover) but their links still work. Small type: 13px mono body, 30px display titles. Dark palette: night oklch(0.16 0.008 350), text oklch(0.9 0.01 350), dim oklch(0.6 0.012 350), and rosa oklch(0.82 0.08 350) as the link/accent color. Scrolling down follows the trail; scrolling up goes back. No prototype chrome. A fixed header holds the `guiksr` mark and the section links (blog, fotolog, filmes, coisas, sobre: focus it if it's already on the trail, otherwise open it after the page you're reading). A fixed footer holds the trail as breadcrumbs (click to focus) and "copiar link". Faded ghosts above and below the active column ("↑ veio de …", "↓ segue pra …") name the previous and next pages on the trail; clicking one scrolls there. The column doesn't slide or fade in on first load. The document title follows the active page. Images come from gatinho.guiksr.com (`/<w>/<h>/<id>`); the size in the URL reserves the image's space so lazy loading doesn't shift the trail. The scroll-driven fades are a deliberate exception to "no scroll-driven choreography" in §1.

**Shared rules (all variants):** (the window rules apply to 1–3; fluxo keeps the trail, the URL state, the two-way links and the centered focus)
- **The desk carries the identity, the windows are restrained.** The grid desk is always visible around the windows; window bodies are white. This is the Two-Mode Rule applied spatially. The desk is **rosa** (see §2); amber was rejected for it.
- **Links work in any window.** Clicking a link in an unfocused window opens it directly; no need to focus the window first.
- **Grid unit is 40px.** Window sizes, steps and positions are multiples of it.
- **Focused window** gets the indigo title bar. All other windows keep paper bars.
- **Two-way links are visible.** A link whose target is open is filled indigo (`is-open`). In the target's "linkado por" footer, the link back to where you came from is filled too (`is-from`). Unwritten pages show as dashed gray links.
- **The URL is the state.** Copying the link restores every open window; back and forward step through openings.
- **Every link is still a real link.** Modifier-click or middle-click opens the page on its own.
- **The focused window is always vertically centered.** Opening or focusing a window moves the desk so the window sits in the middle of the screen, with equal space above and below.
- **Motion is the camera.** The desk pans to the focused window (~320ms, eased) and new windows fade in (~160ms). Everything snaps when `prefers-reduced-motion` is set.
- **Small screens** collapse the diagonal into an offset card stack.

**Current lean:** escada, with scroll navigation borrowed from árvore. Árvore's branching got confusing at forks: with more than one child, it's unclear where scroll or → will go.

**Open questions:** confirm escada as the variant (or a hybrid, e.g. escada's simplicity plus árvore's wires), decide the URL shape in Nuxt (likely `/<last-slug>?w=<stack>`), and decide what the home window looks like when it's the only one open.
