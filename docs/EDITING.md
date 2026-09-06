# Editing the site

This is the plain-language guide for keeping the plant pages up to date. You do not need to touch code.

## Where things are

- **The site**: https://lakota-plants.netlify.app (change this if the site name changes)
- **The editor**: https://lakota-plants.netlify.app/admin/
- **Visitor submissions**: your Netlify dashboard, under Forms
- **Printable QR codes**: https://lakota-plants.netlify.app/qr/yarrow.png (one per plant, named after the plant's web address; there is also a `.svg` version for the printer)

## Logging in the first time

The editor saves changes straight into the site's GitHub repository, so it needs permission to write there. As the only editor right now, the simplest way is a personal token.

1. Open https://github.com/settings/personal-access-tokens/new while signed in to GitHub.
2. Token name: `Lakota plants editor`. Expiration: pick the longest you are comfortable with (you can make a new one later).
3. Resource owner: the account that owns the `lakota-plants` repository.
4. Repository access: **Only select repositories**, then choose `lakota-plants`.
5. Permissions, under Repository permissions: set **Contents** to **Read and write**. Leave everything else alone.
6. Generate the token and copy it. GitHub only shows it once.
7. Open the editor, choose **Sign in with token**, and paste it. The token stays in your browser, so you only do this once per device.

When more people need to edit, switch to GitHub login through Netlify: create a GitHub OAuth app with callback `https://api.netlify.com/auth/done`, then in Netlify open Project configuration, Access and security, OAuth, and install it. Nothing in the editor needs to change.

## What each plant field means

- **Lakota name**: shown very large at the top of the page and in the tabs. Diacritics are fine.
- **English name**: shown under the Lakota name. It also becomes the web address (for example "Wild Bergamot" makes `/plants/wild-bergamot/`), so set it once and leave it, or the printed QR code stops working.
- **Scientific name**: optional, shown in italics.
- **How to say it**: the phonetic spelling, always shown.
- **Pronunciation recording**: optional. Upload a voice recording and a Listen button appears. Phone voice memos work.
- **Photo**: optional. Big photos are fine, the site makes smaller copies for phones.
- **Plant color**: a color taken from the plant. It tints the top of the page and the plant's tab.
- **Order on the home page**: lower numbers come first.
- **Hide from the site**: turn on while you are still working on a plant.
- **About the name (story)**: the paragraph under the name, for what the name means and who shared it.
- **Uses**: one per line. **Cautions**: one per line, shown in a red box.
- **Sources**: who the names, spelling, pronunciation and uses came from.

## Saving and how long it takes

Every time you press Save, the site rebuilds and goes live about a minute later. Each rebuild uses some of Netlify's free monthly allowance (300 credits a month, 15 per rebuild, and the site's own traffic uses a little too). Around fifteen saves a month is comfortable. Finish an entry, then save once, rather than saving after every field. If the allowance ever runs out, the site pauses until the first of the next month. You can see the usage in the Netlify dashboard under Usage.

## Adding something a visitor sent in

1. In Netlify, open Forms, then the `share` form. Each submission shows which plants they ticked, their message, name, tribe, email and any photo.
2. Decide whether it is a recipe, a story, or a use.
   - A **use**: open the plant, add a line under Uses, save.
   - A **recipe**: open Recipes, press New, fill in the title, tick the plant(s), add the ingredients and method, and put the person's name and tribe in "Shared by" and "Tribe or affiliation". Save.
   - A **story or photo**: open Community stories, press New, and do the same. There is a hidden example story you can copy.
3. If you want to check with the person first, their email is in the submission.

## Adding a new plant

Open Plants, press New, fill in the fields, save. The page, the tab, and the QR code appear automatically on the next deploy. Download the QR code from `/qr/<web-address>.png` for the placard.

## If the site address changes

Two files mention the address: `site.config.mjs` and `public/robots.txt`. They can be edited on GitHub in the browser. After a change, every QR code is regenerated on the next deploy, and the old printed codes stop working unless the old address is redirected.
