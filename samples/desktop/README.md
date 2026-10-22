# Studio Board — desktop sample

A local job board for the fictional Cedar & Fern studio. Create and edit jobs, track status, search, filter, export and import. The desktop app uses a local JSON file; the [browser preview](https://recondemon.github.io/henstek-samples/desktop/) uses browser storage instead. Neither syncs to a server or another sample.

## Run

Install Node.js 22.12 or newer, then from the repository root:

```sh
npm --prefix samples/desktop ci
npm run desktop
```

Electron downloads its official runtime on first install or launch. Internet access is needed for that setup; the app itself works offline. This repository includes source, not a signed production installer.

To create a local unsigned Apple silicon macOS app:

```sh
npm --prefix samples/desktop run pack
```

Output is under `build/desktop/`. Do not distribute that as a notarized release. Signing, notarization, update distribution and Windows/Linux packaging must be scoped and verified before customer distribution. Only the platforms listed in the verification record have been tested.

## Walkthrough

Start with the four fictional jobs. Open one, change its status or notes and save. Create a new job. Search for a client or use a status filter. Relaunch to verify persistence. **Export** writes version 1 JSON; **Import** validates first and asks before replacement. **Reset sample** and deletion also ask for confirmation. Export your current work before any replacement.

## Customize

- `model.js`: synthetic data, status/service lists, schema and validation. Shared with the browser preview.
- `renderer.js`, `index.html`, `styles.css`: interface and interaction.
- `store.cjs`: serialized atomic saves and previous revision.
- `main.cjs`, `preload.cjs`: restricted native bridge and local protocol.

The renderer has no Node access. Context isolation and sandboxing are enabled. The main process restricts native calls to the app's own top-level page, serves only an asset allowlist, and rejects permission requests, new windows and external navigation. The preload exposes only load, save and export. Keep those boundaries when adding integrations.

## Storage and recovery

The native files are in Electron's `userData` folder for **Cedar Fern Studio** (typically `~/Library/Application Support/Cedar Fern Studio/` on macOS). `jobs.json` is the current state; `jobs.previous.json` is the previous save. Export copies independently; the previous file is a single revision, not a backup history. Exports are unencrypted.

If loading fails, native saves are blocked to preserve the existing data. Quit, copy both files somewhere safe, validate a copy of the previous revision and restore that copy as `jobs.json`. Relaunch only after preserving the originals. The browser preview warns on invalid browser data but does not provide filesystem recovery; preserve browser data before resetting.

This is a single-user, local sample without accounts, team sync, cloud backup, billing or email delivery. Use fictional data. A production job-management tool needs a separate data/access, support, deployment and recovery plan.
