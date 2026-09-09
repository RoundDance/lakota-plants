#!/usr/bin/env bash
#
# Decides whether a push deserves a deploy. Netlify runs this as the `ignore`
# command in netlify.toml: exit 0 means skip the build, anything else means
# build it.
#
# A deploy costs 15 of the free plan's 300 monthly credits, so saving after
# every field in the CMS would burn the month in a week. Content edits
# therefore pile up on main without deploying, and go live together when
# somebody asks for a publish. Code changes still deploy on push, because
# those are rare and usually wanted straight away.
#
# "Asking for a publish" means triggering the build hook, which Netlify tells
# us about through INCOMING_HOOK_TITLE. The Actions workflow in
# .github/workflows/publish.yml does that on a schedule and on demand.

set -u

# Everything an editor can reach from /admin/. Compare with the media_folder
# and public_folder settings in public/admin/config.yml.
CONTENT=(
  ':!src/content'
  ':!src/data'
  ':!src/assets/uploads'
  ':!public/audio'
  ':!public/uploads'
)

# Things that cannot change the built site: notes about the project, the CI
# workflow, and this script. All three only decide when to ask Netlify for a
# build; none of them is read while one runs. netlify.toml is deliberately not
# here, because its headers and redirects do ship.
PROSE=(':!docs' ':!README.md' ':!.github' ':!scripts/should-build.sh')

# CACHED_COMMIT_REF is the last commit Netlify built successfully. Without it
# there is nothing to compare against, and `git diff` against the working tree
# would report no changes and skip forever. Build instead.
if [ -z "${CACHED_COMMIT_REF:-}" ] || [ -z "${COMMIT_REF:-}" ]; then
  echo "should-build: no previous deploy to compare against. Building."
  exit 1
fi

# Netlify clones shallowly, so the last built commit is often not in the
# checkout. `git diff` then dies with "bad revision" and every push looks like
# a change, which quietly turns the batching off. Go and get it.
have() { git cat-file -e "$1^{commit}" 2>/dev/null; }

if ! have "$CACHED_COMMIT_REF"; then
  git fetch --quiet --deepen=50 origin 2>/dev/null || true
fi
if ! have "$CACHED_COMMIT_REF"; then
  git fetch --quiet origin "$CACHED_COMMIT_REF" 2>/dev/null || true
fi
if ! have "$CACHED_COMMIT_REF"; then
  echo "should-build: cannot reach the last built commit $CACHED_COMMIT_REF to compare against. Building rather than guessing."
  exit 1
fi

# In practice Netlify does not appear to run this script when a build hook
# asks for the build — two hook publishes of an unchanged site both built.
# The workflow therefore decides whether to fire the hook at all. This branch
# stays as a second line of defence in case that behaviour differs or changes.
if [ -n "${INCOMING_HOOK_TITLE:-}" ]; then
  if git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . "${PROSE[@]}"; then
    echo "should-build: publish requested, but nothing has changed since the last deploy. Skipping."
    exit 0
  fi
  echo "should-build: publish requested and there are changes. Building."
  exit 1
fi

if git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . "${PROSE[@]}" "${CONTENT[@]}"; then
  echo "should-build: only content or prose changed. It will go out with the next publish."
  exit 0
fi

echo "should-build: code or configuration changed. Building."
exit 1
