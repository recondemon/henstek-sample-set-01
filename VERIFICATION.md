# Verification record

Core workflow checks completed October 22, 2026. Fieldwork presentation checks completed October 23, 2026. These are focused sample checks, not a complete production accessibility, security or platform certification.

| Area | Result |
| --- | --- |
| Node model suite | 9 tests pass: website content/inquiry validation, browser storage fallback, desktop archive validation, serialized saves/restart, previous-revision preservation, corrupt-file protection, generated asset paths, local-only renderer checks, public import fixtures and native URL boundaries |
| Swift model checks | Archive round trip, unsupported version, duplicate IDs, invalid fields/checklists, size limit, cold load, saved changes, previous revision and corrupt-file preservation pass |
| iPhone build | Xcode 26.2 simulator Debug build succeeds, iOS 17 deployment target, no signing or external packages |
| Desktop build | Electron 45.0.0, unsigned Apple silicon macOS packaging succeeds |
| Dependency audit | Desktop install reports zero known npm audit findings at the checked lockfile; repeat after dependency updates |
| Website browser flow | Chrome: editor preview/save/reload/undo, inquiry review, 390px navigation and horizontal layout checks, Tab focus and Escape dialog closure pass |
| Desktop browser preview | Chrome: create job, save/reload, search and validated archive import with replacement confirmation and exported JSON validation pass |
| Native iPhone interaction | iPhone 17 Pro simulator, iOS 26.3.1: new visit, typed note, checklist/completion, filter, full restart persistence, share-sheet export to Files, validated import review/replacement and reset confirmation pass; portrait and landscape layouts inspected |
| Native desktop interaction | Apple silicon macOS: create/edit job, scheduled status, search/filter, restricted internal navigation, native export/save dialog, JSON validation, import confirmation, reset and packaged-app cold restart persistence pass |

The Fieldwork refresh passes the nine Node checks and a new iPhone simulator build and Apple silicon desktop package. The website navigation and editor, native desktop search/editor, and native iPhone editor in portrait/landscape were inspected with the new styling. HensTek and personal-site galleries were checked at 390px and desktop width; the mixed brief preserves functional and visual references independently. Screenshots reflect the refreshed interfaces. Data models and persistence behavior did not change in this refresh.

A fresh clone installs, builds the browser site without output drift, passes the Node suite, and installs/audits the desktop dependencies successfully. GitHub Actions also passes the clean Node and macOS Swift/Xcode jobs.

The native checks found an import-confirmation presentation issue on iPhone. Import now validates the selected archive without changing saved visits, displays a persistent review panel with current/imported counts, and replaces data only after confirmation. A live export/import round trip restored the saved note and checklist and removed the later test visit as expected. Both samples were returned to fictional seed data after testing.

Physical iPhone, Android, iPad, Windows and Linux checks, assistive-technology audits, app-store submission, signed installers and automatic updates are not included. The iPhone app is native SwiftUI; no Android app is present.

The browser previews store edits locally. The iPhone and desktop apps have separate local files and compatible exports only within their own respective archive formats. There is no shared backend or cross-sample synchronization.

Public source contains synthetic examples and no customer records, service credentials or production integrations. Website assets are original code/vector content or system fonts. The repository's MIT notice covers its original code and illustration; dependencies have their own notices.
