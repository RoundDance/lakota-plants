# Lakota Plant Relatives

A small static site for garden placards. Visitors scan a QR code and land on a page for one plant: its Lakota name, how to say it, what the name means, its uses, recipes, community stories, a form to share what they know, and the sources.

Editors manage everything at `/admin/` (Sveltia CMS, git-based). Visitor submissions go through Netlify Forms. See [docs/EDITING.md](docs/EDITING.md) for the editor guide.

## Stack

- [Astro 7](https://astro.build) static site, content collections in `src/content`
- [Sveltia CMS](https://sveltiacms.app) at `public/admin` (Decap-compatible config)
- Netlify hosting and forms, config in `netlify.toml`
- Fonts: Gentium Book Plus and Andika (both cover every Lakota character; verified against the font files)

## Commands

```
npm install
npm run dev        # http://localhost:4321
npm test           # unit tests for src/lib
npm run build      # astro check, astro build, QR codes into dist/qr, post-build checks
npm run preview    # serve the built site
```

Node 24 is the supported version (`.node-version`). Node 25 also works locally.

## Layout

```
site.config.mjs            public URL, baked into QR codes and the sitemap
src/content/plants/*.md    one file per plant; filename is the URL slug
src/content/recipes/*.md
src/content/stories/*.md   approved community contributions
src/data/site.json         title, tagline, intro, disclaimer, credits
src/lib/plants.ts          sorting, links, form field names (tested)
src/lib/markdown.ts        markdown in string fields
src/layouts/Base.astro     head, fonts, header, footer
src/components/            PlantNav, Pronunciation, ShareForm, cards, Disclaimer, Sources
src/pages/                 index, plants/[slug], share, thank-you, 404
src/styles/global.css      tokens (light and dark), typography, layout
public/admin/              CMS shell and config.yml
public/audio/              pronunciation recordings
src/assets/uploads/        CMS photos (optimized by astro:assets)
scripts/make-qr.mjs        QR codes, run in the build
scripts/check-dist.mjs     asserts every plant page has the form, disclaimer, pronunciation, QR
```

## Design notes

Each plant page is tinted by the plant's own color (the `accent` field). The Lakota name is the hero. One motion only: the Listen button pulses while audio plays. High contrast for reading in sunlight; light and dark mode follow the phone.

## Deploying

Push to `main` and Netlify builds. Each production deploy costs 15 of the free plan's 300 monthly credits, so batch content edits. Form detection must be enabled once in the Netlify Forms UI, and the email notification set there.
