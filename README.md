# HensTek samples

Working examples you can explore, run and adapt. **Cedar & Fern** is a fictional garden studio used across three independent samples: a service website, an iPhone visit planner, and a desktop job board.

[Explore the collection](https://recondemon.github.io/henstek-samples/) · [Discuss a commissioned build](https://henstek.dev/start?project=website)

| Sample | What you can try | Source and setup |
| --- | --- | --- |
| **Cedar & Fern website** | Responsive service site, content preview/save/undo, JSON content import/export, inquiry review | [Website guide](samples/website/README.md) · [Live demo](https://recondemon.github.io/henstek-samples/web/) |
| **Field Notes for iPhone** | Visits, checklist, notes, completion, local persistence, JSON import/export | [iPhone guide](samples/mobile/README.md) |
| **Studio Board for desktop** | Jobs, search, status filters, editing, local file storage, portable exports | [Desktop guide](samples/desktop/README.md) · [Browser preview](https://recondemon.github.io/henstek-samples/desktop/) |

These examples demonstrate interface design, state management, validation, persistence, recovery and handoff. Each can be used on its own; they do **not** sync with each other. All records are fictional. There are no connected customer accounts, payments, messages or cloud databases.

![Cedar & Fern website](screenshots/website.png)

## Run the website and browser previews

Use Node.js **22.12 or newer** (a current LTS release is recommended).

```sh
git clone https://github.com/recondemon/henstek-samples.git
cd henstek-samples
npm ci
npm run dev
```

Open `http://127.0.0.1:4325`. No runtime dependencies, API keys or account setup are needed for the browser demos. `npm run build` refreshes the generated `docs/` directory after edits; the local server serves those files. It does not watch source files.

The iPhone app needs macOS and Xcode. The desktop app has its own dependency install; see its guide.

## Reuse and customize

Start with the sample closest to your workflow, change its fictional branding and example records, and add only the integrations you need. The code and original courtyard illustration are [MIT licensed](LICENSE); keep the copyright and license notice when redistributing. Third-party dependencies retain their own licenses. The license does not grant an endorsement or permission to present HensTek as your business.

For a commissioned version, we agree the deliverables, publishing/editing access, data handling, hosting, integrations, support and handoff before work begins. [The sample walkthrough](CUSTOMER-WALKTHROUGH.md) explains the choices a client can make. A public example is not a fixed-price quote or a claim that a production integration is included.

## Verify changes

```sh
npm run build
npm test
npm run test:mobile   # macOS + Swift
```

The Node suite checks content and inquiry validation, import rejection, desktop persistence, previous-revision recovery and public asset paths. The Swift checks exercise archive validation, round trips, saved changes and preservation of damaged files. See [verification details](VERIFICATION.md) for platform checks and limits.

## Repository layout

- `samples/website/` — original website source and illustration
- `samples/mobile/` — SwiftUI iPhone project, no external packages
- `samples/desktop/` — Electron app and shared browser renderer
- `public/` — collection landing page
- `scripts/` — dependency-free build and local server
- `docs/` — generated GitHub Pages site; edit source then rebuild
- `fixtures/` — fictional import files for all three samples
- `tests/` — data and recovery checks

Contributions: [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).
