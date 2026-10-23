import SwiftUI
import UniformTypeIdentifiers

@main
struct CedarFieldNotesApp: App {
  var body: some Scene { WindowGroup { FieldHome() } }
}
@MainActor final class FieldStore: ObservableObject {
  @Published var visits: [Visit] = []
  @Published var error: String?
  @Published var blocked = false
  private let disk: VisitDisk
  init() {
    disk = VisitDisk(
      directory: URL.documentsDirectory.appendingPathComponent("FieldNotes", isDirectory: true))
    do { visits = try disk.load().visits } catch {
      blocked = true
      self.error =
        "Saved data needs recovery. Export or preserve visits.json and visits.previous.json in this app’s Files folder before reinstalling. Existing data has not been overwritten."
    }
  }
  func save(_ next: [Visit]) {
    guard !blocked else {
      error = "Saving is blocked until the damaged saved file is recovered."
      return
    }
    do {
      try disk.save(VisitArchive(visits: next))
      visits = next
    } catch { self.error = error.localizedDescription }
  }
  func upsert(_ visit: Visit) {
    var next = visits
    if let i = next.firstIndex(where: { $0.id == visit.id }) {
      next[i] = visit
    } else {
      next.append(visit)
    }
    save(next)
  }
  func readImport(_ url: URL) -> VisitArchive? {
    let scoped = url.startAccessingSecurityScopedResource()
    defer { if scoped { url.stopAccessingSecurityScopedResource() } }
    do {
      let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
      guard size <= 500_000 else { throw VisitError.invalid }
      return try VisitArchive.decode(Data(contentsOf: url))
    } catch {
      self.error = error.localizedDescription
      return nil
    }
  }
  func exportFile() -> URL? {
    do {
      let url = FileManager.default.temporaryDirectory.appendingPathComponent(
        "Cedar-Field-Notes.json")
      try VisitArchive(visits: visits).encoded().write(to: url, options: .atomic)
      return url
    } catch {
      self.error = error.localizedDescription
      return nil
    }
  }
}
struct FieldHome: View {
  @StateObject private var store = FieldStore()
  @State private var filter = "Upcoming"
  @State private var editor: Visit?
  @State private var importing = false
  @State private var pendingImport: VisitArchive?
  @State private var reset = false
  @State private var exportURL: URL?
  private let green = Color(red: 0.78, green: 0.91, blue: 0.55)
  var visible: [Visit] {
    store.visits.filter { filter == "All" || (filter == "Complete" ? $0.complete : !$0.complete) }
      .sorted { $0.date < $1.date }
  }
  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          HStack {
            Image("CedarMark").renderingMode(.template).resizable().scaledToFit()
              .frame(width: 34, height: 34).foregroundStyle(green).accessibilityHidden(true)
            Text("CEDAR & FERN").tracking(3).font(.caption.weight(.semibold))
            Spacer()
            Text("CF-01 / MOBILE").font(.caption2.weight(.bold)).padding(8).background(
              .white.opacity(0.08), in: Capsule())
          }
          VStack(alignment: .leading, spacing: 10) {
            Text("Out in the field.").font(
              .system(size: 38, weight: .semibold, design: .default))
            Text("FIELD NOTES / CEDAR & FERN").font(.system(.caption, design: .monospaced)).tracking(1)
            Text("Plan the visit. Do the work. Keep the details.").foregroundStyle(.secondary)
          }
          HStack {
            VStack(alignment: .leading) {
              Text("\(store.visits.filter { !$0.complete }.count)").font(.largeTitle.bold())
              Text("visits ahead").font(.caption)
            }
            Spacer()
            Image(systemName: "viewfinder").font(.system(size: 58, weight: .ultraLight))
          }.padding(24).background(
            Color(red: 0.78, green: 0.91, blue: 0.55), in: RoundedRectangle(cornerRadius: 8)).foregroundStyle(Color(red: 0.08, green: 0.17, blue: 0.13))
          Picker("Visit filter", selection: $filter) {
            ForEach(["Upcoming", "Complete", "All"], id: \.self) { Text($0) }
          }.pickerStyle(.segmented)
          HStack {
            Text("\(filter) visits").font(.title2.weight(.semibold))
            Spacer()
            Button {
              editor = Visit(
                id: UUID(), client: "", title: "", date: Date(), complete: false, notes: "",
                checks: [false, false, false])
            } label: {
              Label("New", systemImage: "plus")
            }.disabled(store.blocked)
          }
          if visible.isEmpty {
            ContentUnavailableView(
              "A little room to grow", systemImage: "leaf",
              description: Text(
                store.blocked
                  ? "Recover the saved file to continue." : "Add a visit or choose another filter.")
            )
          }
          ForEach(visible) { visit in
            Button {
              editor = visit
            } label: {
              VStack(alignment: .leading, spacing: 12) {
                HStack {
                  Text(visit.date, format: .dateTime.month(.abbreviated).day()).font(
                    .caption.weight(.semibold))
                  Spacer()
                  Image(systemName: visit.complete ? "checkmark.circle.fill" : "arrow.up.right")
                }
                Text(visit.title).font(.title3.weight(.semibold))
                Text(visit.client).foregroundStyle(.secondary)
                HStack {
                  Text("\(visit.checks.filter { $0 }.count) of 3 steps")
                  Spacer()
                  Text(visit.complete ? "Complete" : "Planned")
                }.font(.caption)
              }.frame(maxWidth: .infinity, alignment: .leading).padding(20).background(
                Color(red: 0.10, green: 0.18, blue: 0.14), in: RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).stroke(.white.opacity(0.12)))
            }.buttonStyle(.plain).accessibilityLabel(
              "\(visit.title), \(visit.client), \(visit.complete ? "complete" : "planned")")
          }
          VStack(alignment: .leading, spacing: 8) {
            Text("CF-01 / MOBILE · FIELDWORK").font(.caption.bold())
            Text(
              "Fictional visits. No account, cloud sync or customer messaging. Your edits stay on this device until you export them."
            ).font(.caption).foregroundStyle(.secondary)
          }
        }.padding(24)
      }.background(Color(red: 0.06, green: 0.12, blue: 0.10)).foregroundStyle(Color(red: 0.93, green: 0.96, blue: 0.89))
        .safeAreaInset(edge: .bottom) {
          if let archive = pendingImport {
            VStack(alignment: .leading, spacing: 12) {
              Text("Review import").font(.headline)
              Text(
                "Replace all \(store.visits.count) current visits with \(archive.visits.count) imported visits? Export a copy first if you need to keep your current work."
              ).font(.subheadline)
              HStack {
                Button("Cancel import") { pendingImport = nil }.buttonStyle(.bordered)
                Spacer()
                Button("Replace visits", role: .destructive) {
                  store.save(archive.visits)
                  pendingImport = nil
                }.buttonStyle(.borderedProminent)
              }
            }.padding(20).background(.regularMaterial)
          }
        }
        .navigationTitle("Field Notes").navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .topBarTrailing) {
            Menu {
              Button("Export visits", systemImage: "square.and.arrow.up") {
                exportURL = store.exportFile()
              }
              Button("Import visits", systemImage: "square.and.arrow.down") { importing = true }
                .disabled(store.blocked)
              Button("Reset sample", systemImage: "arrow.counterclockwise", role: .destructive) {
                reset = true
              }.disabled(store.blocked)
            } label: {
              Image(systemName: "ellipsis.circle").accessibilityLabel("Data options")
            }
          }
        }
        .sheet(item: $editor) { visit in
          VisitEditor(
            visit: visit, save: store.upsert,
            remove: { id in store.save(store.visits.filter { $0.id != id }) })
        }
        .sheet(isPresented: Binding(get: { exportURL != nil }, set: { if !$0 { exportURL = nil } }))
      { if let url = exportURL { ShareSheet(url: url) } }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in
          switch result {
          case .success(let url): pendingImport = store.readImport(url)
          case .failure(let error): store.error = error.localizedDescription
          }
        }
        .confirmationDialog(
          "Replace your edits with fictional sample visits?", isPresented: $reset,
          titleVisibility: .visible
        ) { Button("Reset sample", role: .destructive) { store.save(Visit.examples) } }
        .alert(
          "Field Notes",
          isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })
        ) {
          Button("OK") { store.error = nil }
        } message: {
          Text(store.error ?? "")
        }
    }.tint(green).preferredColorScheme(.dark)
  }
}
struct VisitEditor: View {
  @State var visit: Visit
  let save: (Visit) -> Void
  let remove: (UUID) -> Void
  @Environment(\.dismiss) private var dismiss
  @State private var deleting = false
  var valid: Bool { (try? VisitArchive(visits: [visit]).validated()) != nil }
  var body: some View {
    NavigationStack {
      Form {
        Section("The visit") {
          TextField("Client or place", text: $visit.client)
          TextField("Visit title", text: $visit.title)
          DatePicker("Date", selection: $visit.date, displayedComponents: .date)
          Toggle("Visit complete", isOn: $visit.complete)
        }
        Section("Care checklist") {
          ForEach(0..<3) { i in Toggle(Visit.checklist[i], isOn: $visit.checks[i]) }
        }
        Section {
          TextEditor(text: $visit.notes).frame(minHeight: 140).accessibilityLabel("Care notes")
        } header: {
          Text("Care notes")
        } footer: {
          Text(
            "\(visit.notes.count)/2,000 characters. Fictional sample; avoid sensitive information.")
        }
        Section { Button("Delete visit", role: .destructive) { deleting = true } }
      }.navigationTitle("Visit details").navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
          ToolbarItem(placement: .confirmationAction) {
            Button("Save") {
              save(visit)
              dismiss()
            }.disabled(!valid)
          }
        }
        .confirmationDialog(
          "Delete this visit? Export a copy first if you need it.", isPresented: $deleting,
          titleVisibility: .visible
        ) {
          Button("Delete visit", role: .destructive) {
            remove(visit.id)
            dismiss()
          }
        }
    }
  }
}
struct ShareSheet: UIViewControllerRepresentable {
  let url: URL
  func makeUIViewController(context: Context) -> UIActivityViewController {
    UIActivityViewController(activityItems: [url], applicationActivities: nil)
  }
  func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
