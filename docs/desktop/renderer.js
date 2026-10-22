const { seed, statuses, validate } = window.StudioModel,
  $ = (s) => document.querySelector(s);
let state = structuredClone(seed),
  filter = "All",
  editing = null;
const native = !!window.studioStore;
if (native) document.querySelector(".brand").href = "#main";
function status(message) {
  $("#status").textContent = message;
}
async function persist(next) {
  const clean = validate(next);
  if (native) await window.studioStore.save(clean);
  else localStorage.setItem("cedar-studio-v1", JSON.stringify(clean));
  state = clean;
  render();
}
function render() {
  const query = $("#search").value.toLowerCase(),
    jobs = state.jobs.filter(
      (j) =>
        (filter === "All" || j.status === filter) &&
        [j.title, j.client, j.notes].some((s) =>
          s.toLowerCase().includes(query),
        ),
    );
  $("#active-count").textContent = state.jobs.filter(
    (j) => j.status !== "Complete",
  ).length;
  $("#progress-count").textContent = state.jobs.filter(
    (j) => j.status === "In progress",
  ).length;
  $("#complete-count").textContent = state.jobs.filter(
    (j) => j.status === "Complete",
  ).length;
  $("#jobs").replaceChildren();
  $("#empty").hidden = jobs.length > 0;
  for (const job of jobs) {
    const row = document.createElement("button");
    row.className = "job";
    const title = document.createElement("span"),
      name = document.createElement("strong"),
      client = document.createElement("small");
    name.textContent = job.title;
    client.textContent = job.client;
    title.append(name, client);
    const service = document.createElement("span");
    service.textContent = job.service;
    const badgeCell = document.createElement("span"),
      badge = document.createElement("span");
    badge.className = "badge" + (job.status === "Complete" ? " complete" : "");
    badge.textContent = job.status;
    badgeCell.append(badge);
    const due = document.createElement("span");
    due.textContent = job.due;
    row.append(title, service, badgeCell, due);
    row.addEventListener("click", () => openJob(job));
    $("#jobs").append(row);
  }
  document
    .querySelectorAll("[data-filter]")
    .forEach((b) =>
      b.classList.toggle("selected", b.dataset.filter === filter),
    );
}
function openJob(job) {
  editing = job?.id || null;
  $("#dialog-title").textContent = job ? "The details." : "A new beginning.";
  $("#job-form").reset();
  if (job)
    for (const key of ["client", "title", "service", "status", "due", "notes"])
      $("#job-form").elements[key].value = job[key];
  $("#delete").hidden = !job;
  $("#form-error").textContent = "";
  $("#job-dialog").showModal();
}
$("#new-job").addEventListener("click", () => openJob());
$("#close").addEventListener("click", () => $("#job-dialog").close());
$("#job-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target)),
    record = { ...values, id: editing || crypto.randomUUID() };
  try {
    await persist({
      version: 1,
      jobs: editing
        ? state.jobs.map((j) => (j.id === editing ? record : j))
        : [record, ...state.jobs],
    });
    $("#job-dialog").close();
    status("Saved locally.");
  } catch (e) {
    $("#form-error").textContent = e.message;
  }
});
$("#delete").addEventListener("click", async () => {
  if (
    !confirm("Delete this sample job? Export first if you want to keep a copy.")
  )
    return;
  try {
    await persist({
      version: 1,
      jobs: state.jobs.filter((j) => j.id !== editing),
    });
    $("#job-dialog").close();
    status("Job removed.");
  } catch (e) {
    $("#form-error").textContent = e.message;
  }
});
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    render();
  }),
);
$("#search").addEventListener("input", render);
$("#all-jobs").addEventListener("click", () => {
  filter = "All";
  render();
});
$("#scheduled-jobs").addEventListener("click", () => {
  filter = "Scheduled";
  render();
});
$("#reset").addEventListener("click", async () => {
  if (
    !confirm("Restore fictional sample jobs? Export your current work first.")
  )
    return;
  try {
    await persist(structuredClone(seed));
    filter = "All";
    $("#search").value = "";
    render();
    status("Sample restored.");
  } catch (e) {
    status("Could not restore: " + e.message);
  }
});
$("#export").addEventListener("click", async () => {
  try {
    if (native) {
      const saved = await window.studioStore.export();
      status(saved ? "Export saved." : "Export canceled.");
    } else {
      const url = URL.createObjectURL(
          new Blob([JSON.stringify(state, null, 2)], {
            type: "application/json",
          }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "cedar-studio.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status("Export downloaded.");
    }
  } catch (e) {
    status("Export failed: " + e.message);
  }
});
$("#import-button").addEventListener("click", () => $("#import").click());
$("#import").addEventListener("change", async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) throw Error("Maximum import size is 500 KB.");
    const next = validate(JSON.parse(await file.text()));
    if (
      !confirm(
        "Replace this device’s jobs with the imported export? Export current work first.",
      )
    )
      return;
    await persist(next);
    status("Import saved.");
  } catch (e) {
    status("Import refused: " + e.message);
  } finally {
    e.target.value = "";
  }
});
(async () => {
  try {
    if (native) {
      state = validate(await window.studioStore.load());
      $("#storage-mode").textContent = "Offline desktop storage";
      $("#footer-note").textContent =
        "Desktop sample · Data stays in this app’s local storage. Export a copy before reset or uninstall.";
    } else {
      const saved = localStorage.getItem("cedar-studio-v1");
      if (saved) state = validate(JSON.parse(saved));
    }
    render();
  } catch {
    render();
    status(
      "Saved data could not be read. The sample is shown without overwriting your saved file. Export/recover your existing data before saving.",
    );
  }
})();
