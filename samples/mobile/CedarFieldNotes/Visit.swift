import Foundation

struct Visit: Codable, Identifiable, Equatable {
  var id: UUID
  var client: String
  var title: String
  var date: Date
  var complete: Bool
  var notes: String
  var checks: [Bool]
  static let checklist = ["Review the space", "Complete agreed work", "Leave a care note"]
  static let examples: [Visit] = [
    Visit(
      id: UUID(uuidString: "00000000-0000-4000-8000-000000000001")!, client: "Rowan House",
      title: "Courtyard planting", date: Date(), complete: false,
      notes: "Fictional visit. Check the shaded seating corner and planting palette.",
      checks: [true, false, false]),
    Visit(
      id: UUID(uuidString: "00000000-0000-4000-8000-000000000002")!, client: "The Maple Courtyard",
      title: "Seasonal garden care", date: Date().addingTimeInterval(86400), complete: false,
      notes: "Fictional visit. Mulch, tidy and leave watering notes.",
      checks: [false, false, false]),
    Visit(
      id: UUID(uuidString: "00000000-0000-4000-8000-000000000003")!, client: "Alder Apartment",
      title: "Balcony consultation", date: Date().addingTimeInterval(-86400), complete: true,
      notes: "Fictional visit. Three containers selected for afternoon sun.",
      checks: [true, true, true]),
  ]
}
struct VisitArchive: Codable, Equatable {
  var version = 1
  var visits: [Visit]
  func validated() throws -> VisitArchive {
    guard version == 1, visits.count <= 500, Set(visits.map(\.id)).count == visits.count else {
      throw VisitError.invalid
    }
    for v in visits {
      guard !v.client.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
        !v.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
        v.client.count <= 140, v.title.count <= 140, v.notes.count <= 2000,
        v.checks.count == Visit.checklist.count, v.date.timeIntervalSince1970.isFinite,
        (0...4_102_444_800).contains(v.date.timeIntervalSince1970)
      else { throw VisitError.invalid }
    }
    return self
  }
  static func decode(_ data: Data) throws -> VisitArchive {
    guard data.count <= 500_000 else { throw VisitError.invalid }
    return try JSONDecoder().decode(VisitArchive.self, from: data).validated()
  }
  func encoded() throws -> Data {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
    let data = try encoder.encode(validated())
    guard data.count <= 500_000 else { throw VisitError.invalid }
    return data
  }
}
enum VisitError: LocalizedError {
  case invalid
  var errorDescription: String? {
    "Choose a valid Field Notes version 1 export (up to 500 visits and 500 KB). Names and titles are required; notes can contain up to 2,000 characters."
  }
}
struct VisitDisk {
  let directory: URL
  var file: URL { directory.appendingPathComponent("visits.json") }
  func load() throws -> VisitArchive {
    if !FileManager.default.fileExists(atPath: file.path) {
      return VisitArchive(visits: Visit.examples)
    }
    return try VisitArchive.decode(Data(contentsOf: file))
  }
  func save(_ archive: VisitArchive) throws {
    let data = try archive.encoded()
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    if FileManager.default.fileExists(atPath: file.path) {
      let old = try Data(contentsOf: file)
      _ = try VisitArchive.decode(old)
      try old.write(to: directory.appendingPathComponent("visits.previous.json"), options: .atomic)
    }
    try data.write(to: file, options: .atomic)
  }
}
