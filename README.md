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

## Updating the CMS

The admin page pins Sveltia CMS to an exact version with an integrity hash. To update:

```
npm view @sveltia/cms version
curl -sSL -o /tmp/cms.js https://unpkg.com/@sveltia/cms@<version>/dist/sveltia-cms.js
openssl dgst -sha384 -binary /tmp/cms.js | openssl base64 -A
```

Put the new version and `sha384-<hash>` into `public/admin/index.html`.

## Deploying

Code changes deploy on push. Content saved from `/admin/` does not — it waits on `main` until a publish, because each deploy costs 15 of the free plan's 300 monthly credits and CMS saves are frequent. `scripts/should-build.sh` makes that call and runs as the `ignore` command below.

Publishing happens Mondays and Thursdays at 14:00 UTC, and on demand from the repository's Actions tab, through `.github/workflows/publish.yml`. Twice a week rather than daily because 300 credits at 15 each is only 20 deploys a month, shared with code pushes and traffic. It builds and tests on GitHub's runners first — free on a public repo — then POSTs the `NETLIFY_BUILD_HOOK_URL` secret so Netlify runs the real build. A publish with nothing waiting is skipped and costs nothing.

Setting that up needs a build hook at Netlify, Project configuration, Build & deploy, Build hooks, saved as the `NETLIFY_BUILD_HOOK_URL` repository secret under Settings, Secrets and variables, Actions.

**The repository has to stay public.** On a private repo the free plan builds commits from one Git contributor only; a save by any other editor fails the build outright with "unrecognized Git contributor" and never reaches the site. Nothing in the deploy log says the site is stale, so this is silent. Making the repo private again would break every editor except the account linked to Netlify. The paid alternatives are Netlify Pro, or issuing one shared editor token so every commit lands under the same account.

Netlify parses forms only when Netlify itself runs the build. Prebuilt deploys (`netlify deploy --dir`, or building in CI and uploading `dist`) skip form detection, so moving the build off Netlify would silently stop the share form collecting submissions. Form detection and the submission email notifications are set in the Netlify UI, not in this repo.
