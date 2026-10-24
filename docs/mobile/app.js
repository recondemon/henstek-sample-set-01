import { $, escape as e, shell, editor, field, check, notes, wireReset } from "./ui.js";
const seed = [
  {
    id: "rowan",
    client: "Rowan House",
    title: "Courtyard planting",
    date: "2026-10-23",
    complete: false,
    checks: [true, false, false],
    notes: "Check the shaded seating corner and planting palette.",
  },
  {
    id: "maple",
    client: "The Maple Courtyard",
    title: "Seasonal garden care",
    date: "2026-10-24",
    complete: false,
    checks: [false, false, false],
    notes: "Mulch, tidy and leave watering notes.",
  },
  {
    id: "alder",
    client: "Alder Apartment",
    title: "Balcony consultation",
    date: "2026-10-22",
    complete: true,
    checks: [true, true, true],
    notes: "Three containers selected for afternoon sun.",
  },
];
let visits = structuredClone(seed),
  filter = "Upcoming";
function edit(visit) {
  const v = visit || {
    client: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    checks: [],
    notes: "",
  };
  editor(
    "Visit details",
    field("Client or place", "client", v.client) +
      field("Visit title", "title", v.title) +
      field("Date", "date", v.date, "date") +
      check("Visit complete", "complete", v.complete) +
      "<h3>Care checklist</h3>" +
      ["Review the space", "Complete agreed work", "Leave a care note"]
        .map((t, i) => check(t, "step" + i, v.checks[i]))
        .join("") +
      notes(v.notes),
    (form) => {
      if (!String(form.get("client")).trim() || !String(form.get("title")).trim())
        throw Error("Add a client and a visit title.");
      const next = {
        id: v.id || crypto.randomUUID(),
        client: form.get("client").trim(),
        title: form.get("title").trim(),
        date: form.get("date"),
        complete: form.has("complete"),
        checks: [0, 1, 2].map((i) => form.has("step" + i)),
        notes: form.get("notes"),
      };
      visits = visit ? visits.map((item) => (item.id === v.id ? next : item)) : [...visits, next];
      render();
    },
    visit
      ? () => {
          visits = visits.filter((item) => item.id !== v.id);
          render();
        }
      : null,
  );
}
function render() {
  const visible = visits
    .filter((v) => filter === "All" || (filter === "Complete" ? v.complete : !v.complete))
    .sort((a, b) => a.date.localeCompare(b.date));
  shell(
    "Field Notes",
    `<div class="spread eyebrow"><span><img class="brand-mark" src="../web/assets/cedar-fern-mark.png" alt="">CEDAR & FERN</span><span>CF-01 / MOBILE</span></div><h1>Out in the field.</h1><p class="eyebrow">Field notes / Cedar & Fern</p><p class="muted">Plan the visit. Do the work. Keep the details.</p><div class="summary spread"><div><strong>${visits.filter((v) => !v.complete).length}</strong><br>visits ahead</div><span aria-hidden="true">＋</span></div><div class="filters" aria-label="Visit filter">${["Upcoming", "Complete", "All"].map((f) => `<button data-filter="${f}" aria-pressed="${filter === f}">${f}</button>`).join("")}</div><div class="spread section-head"><h2>${filter} visits</h2><button id="new">＋ New</button></div><div class="stack">${visible.map((v) => `<button class="card" data-visit="${v.id}"><div class="spread eyebrow"><span>${e(v.date)}</span><span>${v.complete ? "✓" : "↗"}</span></div><h3>${e(v.title)}</h3><small>${e(v.client)}</small><div class="spread caption"><span>${v.checks.filter(Boolean).length} of 3 steps</span><span>${v.complete ? "Complete" : "Planned"}</span></div></button>`).join("") || '<p class="empty">A little room to grow.<br>Add a visit or choose another filter.</p>'}</div><p class="app-note">Fictional visits · Browser preview of the iPhone app.<br>Edits last until you reload or reset this demo.</p>`,
  );
  $("[id=new]").onclick = () => edit();
  document.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        render();
        document.querySelector(`[data-filter="${filter}"]`).focus();
      }),
  );
  document
    .querySelectorAll("[data-visit]")
    .forEach((b) => (b.onclick = () => edit(visits.find((v) => v.id === b.dataset.visit))));
  wireReset(() => {
    visits = structuredClone(seed);
    filter = "Upcoming";
    render();
  });
}
render();
