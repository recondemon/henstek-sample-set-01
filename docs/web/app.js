import {
  defaults,
  validateContent,
  readState,
  validateInquiry,
} from "./content.mjs";
const $ = (s) => document.querySelector(s),
  editor = $("#editor"),
  form = $("#editor-form");
let content = readState(localStorage),
  previous = null,
  draftVisible = false,
  toastTimer;
function render(data) {
  document
    .querySelectorAll("[data-content]")
    .forEach((el) => (el.textContent = data[el.dataset.content]));
}
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
const labels = {
  name: "Studio name",
  headline: "Main headline",
  intro: "Introduction",
  hours: "Opening hours",
  area: "Service area",
  service1: "First service",
  service2: "Second service",
  service3: "Third service",
};
for (const key of Object.keys(defaults)) {
  const label = document.createElement("label");
  label.textContent = labels[key];
  const input = document.createElement(key === "intro" ? "textarea" : "input");
  input.name = key;
  input.required = true;
  input.maxLength = key === "intro" ? 320 : 100;
  input.value = content[key];
  label.append(input);
  form.append(label);
}
function draft() {
  return validateContent(Object.fromEntries(new FormData(form)));
}
function syncForm() {
  for (const key of Object.keys(defaults))
    form.elements[key].value = content[key];
}
$("#edit-site").addEventListener("click", () => {
  if (!draftVisible) syncForm();
  else {
    render(content);
    draftVisible = false;
  }
  $("#editor-error").textContent = "";
  $("#editor-status").textContent = "";
  editor.showModal();
});
document
  .querySelectorAll("[data-close]")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
$("#preview-content").addEventListener("click", () => {
  try {
    const next = draft();
    editor.close();
    render(next);
    draftVisible = true;
    notify("Draft preview only. Open the editor to save your changes.");
  } catch (e) {
    $("#editor-error").textContent = e.message;
  }
});
$("#save-content").addEventListener("click", () => {
  try {
    const next = draft();
    localStorage.setItem("cedar-fern-content-v1", JSON.stringify(next));
    previous = { ...content };
    content = next;
    draftVisible = false;
    render(content);
    editor.close();
    notify("Saved on this device. Other visitors see the original sample.");
  } catch (e) {
    $("#editor-error").textContent = e.message.includes("Check")
      ? e.message
      : "Could not save. Browser storage may be unavailable.";
  }
});
$("#undo-content").addEventListener("click", () => {
  if (!previous) {
    $("#editor-status").textContent =
      "No saved change to undo in this session.";
    return;
  }
  try {
    localStorage.setItem("cedar-fern-content-v1", JSON.stringify(previous));
    content = previous;
    previous = null;
    syncForm();
    render(content);
    $("#editor-status").textContent = "Previous saved content restored.";
  } catch {
    $("#editor-error").textContent =
      "Storage is unavailable; no saved change was made.";
  }
});
function download(name, value) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#export-content").addEventListener("click", () =>
  download("cedar-fern-content.json", content),
);
$("#import-content").addEventListener("change", async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 12000)
      throw Error("Content files must be smaller than 12 KB.");
    const next = validateContent(JSON.parse(await file.text()));
    for (const key of Object.keys(next)) form.elements[key].value = next[key];
    $("#editor-status").textContent =
      "Imported as a draft. Preview or save when ready.";
  } catch {
    $("#editor-error").textContent =
      "That file is not a valid Cedar & Fern content export.";
  } finally {
    e.target.value = "";
  }
});
$("#reset-content").addEventListener("click", () => {
  if (
    !confirm(
      "Restore the original sample on this device? Export any content you want to keep first.",
    )
  )
    return;
  try {
    localStorage.removeItem("cedar-fern-content-v1");
    previous = { ...content };
    content = { ...defaults };
    draftVisible = false;
    syncForm();
    render(content);
    $("#editor-status").textContent = "Original sample restored.";
  } catch {
    $("#editor-error").textContent =
      "Storage is unavailable; no saved change was made.";
  }
});
form.addEventListener("submit", (e) => e.preventDefault());
let inquiryText = "";
$("#inquiry").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const values = validateInquiry(Object.fromEntries(new FormData(e.target))),
      summary = $("#inquiry-summary");
    summary.replaceChildren();
    for (const [key, value] of Object.entries(values)) {
      const term = document.createElement("dt"),
        detail = document.createElement("dd");
      term.textContent = key;
      detail.textContent = value;
      summary.append(term, detail);
    }
    inquiryText = `Name: ${values.name}\nEmail: ${values.email}\nService: ${values.service}\n\n${values.message}`;
    $("#inquiry-error").textContent = "";
    $("#copy-status").textContent = "";
    $("#inquiry-preview").showModal();
  } catch (error) {
    $("#inquiry-error").textContent = error.message;
  }
});
$("#copy-inquiry").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(inquiryText);
    $("#copy-status").textContent =
      "Copied. This demo has not sent the inquiry.";
  } catch {
    $("#copy-status").textContent =
      "Clipboard unavailable. Select and copy the preview text instead.";
  }
});
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#nav").classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
  $("#menu-toggle").textContent = open ? "Close −" : "Menu +";
});
document.querySelectorAll("#nav a").forEach((a) =>
  a.addEventListener("click", () => {
    $("#nav").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").textContent = "Menu +";
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#nav").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").textContent = "Menu +";
  }
});
document
  .querySelectorAll("[data-service]")
  .forEach((a) =>
    a.addEventListener(
      "click",
      () => ($("#inquiry").elements.service.value = a.dataset.service),
    ),
  );
render(content);
