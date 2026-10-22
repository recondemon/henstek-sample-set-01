# Field Notes — native iPhone sample

A SwiftUI visit planner for the fictional Cedar & Fern studio. Add visits, tick a care checklist, edit notes, mark work complete, filter the list and export or import a portable JSON archive. It works offline without an account.

## Run

Requires macOS and Xcode with an iOS SDK. The deployment target is iOS 17 or newer. There are no external packages or service credentials.

1. Open `CedarFieldNotes.xcodeproj` in Xcode.
2. Select the `CedarFieldNotes` scheme and an iPhone simulator.
3. Run. First launch shows three fictional visits.

For your own physical iPhone, select your own development team in Signing & Capabilities and use a unique bundle identifier. Signing and device provisioning are your responsibility; no App Store distribution, TestFlight build or signed installer is supplied.

```sh
xcodebuild -project samples/mobile/CedarFieldNotes.xcodeproj \
  -scheme CedarFieldNotes -sdk iphonesimulator -configuration Debug \
  -derivedDataPath build/mobile CODE_SIGNING_ALLOWED=NO build
npm run test:mobile
```

Run these commands from the repository root.

## Try it

Open a visit, edit a checklist and note, and save. Create another visit. Switch Upcoming / Complete / All. Close and relaunch to check that your changes persist. Use **Data options → Export visits** to share JSON through the system share sheet. Import validates the archive and asks before replacing all visits. Export before reset, import, delete or uninstall if you need a copy.

`Visit.swift` contains the model, synthetic records, archive validation and atomic file storage. `CedarFieldNotesApp.swift` contains the views and store. Customize the checklist carefully: version 1 archives require exactly three checklist values. A changed schema needs a migration and new archive version.

Archives are limited to 500 records and 500 KB, including formatting. Oversized saves and imports are rejected before replacing saved data.

## Data and recovery

Data stays in `Documents/FieldNotes/visits.json` inside this app's sandbox. The preceding save is kept as `visits.previous.json`. These files are available through the app's Files folder; the previous revision is not a full backup history. Use exported copies for independent backups.

If the current file is damaged, the app blocks saving and shows a recovery message. Preserve both files, validate a copy of the previous revision, and recover it as `visits.json` before reopening. Do not uninstall the app before retrieving the files. Exports are unencrypted; use fictional data and store exports appropriately.

This sample has no cloud sync, authentication, reminders, customer messaging, location tracking or payment processing. It is **iPhone only**; Android, iPad and store releases are outside this sample. See the root verification record for what was actually checked.
