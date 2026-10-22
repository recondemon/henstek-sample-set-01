import Foundation

@main struct ModelChecks {
 static func main() throws {
  func check(_ value: Bool, _ message: String) { precondition(value, message) }
  func rejects(_ work: () throws -> Void) { do { try work(); fatalError("Invalid archive accepted") } catch {} }
  let fixture = try VisitArchive.decode(Data(contentsOf: URL(fileURLWithPath: "fixtures/iphone-visits.json")))
  check(fixture.visits.count == 3, "Public fixture must contain valid fictional visits")
  let seed = VisitArchive(visits: Visit.examples)
  let roundTrip = try VisitArchive.decode(seed.encoded())
  check(roundTrip == seed, "Round trip loses records")
  rejects { _ = try VisitArchive(version: 9, visits: []).validated() }
  rejects { _ = try VisitArchive(visits: [Visit.examples[0], Visit.examples[0]]).validated() }
  var bad = Visit.examples[0]; bad.title = " "; rejects { _ = try VisitArchive(visits: [bad]).validated() }
  bad = Visit.examples[0]; bad.checks = []; rejects { _ = try VisitArchive(visits: [bad]).validated() }
  rejects { _ = try VisitArchive.decode(Data(repeating: 32, count: 500_001)) }
  let large = VisitArchive(visits: (0..<500).map { _ in var visit = Visit.examples[0]; visit.id = UUID(); visit.notes = String(repeating: "x", count: 2000); return visit })
  rejects { _ = try large.encoded() }
  let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: directory) }
  let disk = VisitDisk(directory: directory)
  check(try disk.load().visits.count == 3, "First run needs sample visits")
  try disk.save(seed)
  var edited = seed; edited.visits[0].notes = "A saved care note"; edited.visits[0].complete = true
  try disk.save(edited)
  check(try disk.load() == edited, "Restart lost changes")
  let previous = try VisitArchive.decode(Data(contentsOf: directory.appendingPathComponent("visits.previous.json")))
  check(previous == seed, "Previous revision not retained")
  let damaged = Data("broken".utf8); try damaged.write(to: disk.file)
  rejects { _ = try disk.load() }
  rejects { try disk.save(seed) }
  check(try Data(contentsOf: disk.file) == damaged, "Corrupt saved file overwritten")
  print("Field Notes model: validation, persistence and recovery checks passed")
 }
}
