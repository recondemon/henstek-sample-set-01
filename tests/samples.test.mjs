import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  defaults,
  validateContent,
  readState,
  validateInquiry,
} from "../samples/website/content.mjs";
const require = createRequire(import.meta.url);
const { seed, validate } = require("../samples/desktop/model.js");
const { Store } = require("../samples/desktop/store.cjs");
test("website imports whitelist fields and reject incomplete, oversized and mistyped content", () => {
  assert.deepEqual(validateContent({ ...defaults }), defaults);
  for (const input of [
    { ...defaults, intro: "x".repeat(321) },
    { ...defaults, headline: 3 },
    { ...defaults, name: " " },
    { ...defaults, extra: "x" },
    [],
  ])
    assert.throws(() => validateContent(input));
  assert.equal(
    validateContent({ ...defaults, headline: " <img src=x onerror=alert(1)> " })
      .headline,
    "<img src=x onerror=alert(1)>",
  );
});
test("website tolerates absent, corrupt or inaccessible browser storage", () => {
  for (const storage of [
    {
      getItem() {
        return null;
      },
    },
    {
      getItem() {
        return "{broken";
      },
    },
    {
      getItem() {
        throw Error("denied");
      },
    },
  ])
    assert.deepEqual(readState(storage), defaults);
  const data = { ...defaults, headline: "A new garden" };
  assert.deepEqual(readState({ getItem: () => JSON.stringify(data) }), data);
});
test("inquiries validate email, length and permitted services without sending", () => {
  assert.deepEqual(
    validateInquiry({
      name: " Alex ",
      email: "alex@example.com",
      service: "Care",
      message: "A fictional garden visit.",
    }),
    {
      name: "Alex",
      email: "alex@example.com",
      service: "Care",
      message: "A fictional garden visit.",
    },
  );
  for (const change of [
    { email: "invalid" },
    { name: "" },
    { service: "Other" },
    { message: "short" },
    { message: "x".repeat(2001) },
  ])
    assert.throws(() =>
      validateInquiry({
        name: "Alex",
        email: "alex@example.com",
        service: "Care",
        message: "A fictional garden visit.",
        ...change,
      }),
    );
});
test("desktop imports reject duplicate IDs, unsupported formats and invalid job fields", () => {
  assert.deepEqual(validate(seed), seed);
  for (const data of [
    { ...seed, version: 2 },
    { version: 1, jobs: [seed.jobs[0], seed.jobs[0]] },
    { version: 1, jobs: [{ ...seed.jobs[0], status: "Unknown" }] },
    { version: 1, jobs: [{ ...seed.jobs[0], notes: "x".repeat(2001) }] },
    { version: 1, jobs: [{ ...seed.jobs[0], id: "../escape" }] },
  ])
    assert.throws(() => validate(data));
  assert.equal(
    validate({
      version: 1,
      jobs: [{ ...seed.jobs[0], secret: "not retained" }],
    }).jobs[0].secret,
    undefined,
  );
});
test("desktop saves serialize, persist across restart and retain the preceding revision", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cedar-store-"));
  try {
    const store = new Store(directory);
    assert.deepEqual(await store.load(), seed);
    const first = structuredClone(seed);
    first.jobs[0].notes = "First change";
    const second = structuredClone(first);
    second.jobs[0].status = "Complete";
    await Promise.all([store.save(first), store.save(second)]);
    assert.deepEqual(await new Store(directory).load(), second);
    assert.deepEqual(
      JSON.parse(await readFile(join(directory, "jobs.previous.json"), "utf8")),
      first,
    );
    assert.throws(() => store.save({ version: 9, jobs: [] }));
    assert.deepEqual((await readdir(directory)).sort(), [
      "jobs.json",
      "jobs.previous.json",
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("desktop corrupt files are preserved and cannot silently be overwritten", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cedar-recovery-"));
  try {
    await writeFile(join(directory, "jobs.json"), "broken");
    const store = new Store(directory);
    await assert.rejects(store.load(), /recovery/);
    await assert.rejects(store.save(seed), /not been overwritten/);
    assert.equal(
      await readFile(join(directory, "jobs.json"), "utf8"),
      "broken",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("public site assets resolve and browser demos contain no network submission code", async () => {
  for (const folder of ["docs", "docs/web", "docs/desktop"]) {
    const html = await readFile(join(folder, "index.html"), "utf8");
    for (const match of html.matchAll(
      /(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g,
    )) {
      const target = match[1];
      if (/^(https?:|mailto:)/.test(target) || target.endsWith("/")) continue;
      assert.ok(
        (await readFile(join(folder, target))).length > 0,
        `${folder}/${target}`,
      );
    }
  }
  for (const path of [
    "samples/website/app.js",
    "samples/desktop/renderer.js",
  ]) {
    const code = await readFile(path, "utf8");
    assert.doesNotMatch(code, /innerHTML|fetch\(|XMLHttpRequest|sendBeacon/);
  }
});

test('published import fixtures match their sample schemas', async () => {
  assert.deepEqual(validateContent(JSON.parse(await readFile('fixtures/website-content.json', 'utf8'))), defaults);
  assert.deepEqual(validate(JSON.parse(await readFile('fixtures/desktop-jobs.json', 'utf8'))), seed);
});
