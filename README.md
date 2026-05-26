# Chrome-Scripts

A collection of browser bookmarklets and userscripts maintained by Cobblestone Learning.

The script catalog below is regenerated automatically by GitHub Actions on every push to `main`. Everything above the `AUTO-GENERATED:START` marker is hand-maintained and safe to edit — the workflow only rewrites the block between the two sentinel comments.

## How it works

- Drop a `.js` file in the repo root and push to `main`.
- The [Generate README](.github/workflows/generate-readme.yml) workflow asks OpenAI (`openai`, default model `gpt-4o-mini`) for a description and usage notes for any new or changed script, builds a minified `javascript:` bookmarklet, and rebuilds the **Scripts** section below.
- Descriptions are cached in `.github/cache/script-descriptions.json` keyed by file content hash — unchanged scripts cost zero API calls on subsequent runs.

## Setup

Add an `OPENAI_API_KEY` repository secret (Settings → Secrets and variables → Actions). Optionally override the model with an `OPENAI_MODEL` repo variable. The workflow uses the default `GITHUB_TOKEN` to commit the regenerated README, so no PAT is needed unless branch protection rules block bot pushes to `main`.

<!-- AUTO-GENERATED:START — do not edit below this line -->
<!-- AUTO-GENERATED:END -->
