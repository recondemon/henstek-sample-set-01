export const defaults = Object.freeze({
  name: "Cedar & Fern",
  headline: "Room to grow.",
  intro:
    "Thoughtful gardens for everyday living. From a quiet corner to a complete outdoor space, start with a little possibility.",
  hours: "Monday–Friday, 9am–5pm",
  area: "A fictional Pacific Northwest garden studio",
  service1: "Garden design",
  service2: "Seasonal care",
  service3: "Small-space planting",
});
export function validateContent(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== Object.keys(defaults).length
  )
    throw Error("Choose a Cedar & Fern content export.");
  const clean = {};
  for (const key of Object.keys(defaults)) {
    if (
      typeof value[key] !== "string" ||
      !value[key].trim() ||
      value[key].length > (key === "intro" ? 320 : 100)
    )
      throw Error("Check the length of " + key + ".");
    clean[key] = value[key].trim();
  }
  return clean;
}
export function readState(storage) {
  try {
    const raw = storage.getItem("cedar-fern-content-v1");
    return raw ? validateContent(JSON.parse(raw)) : { ...defaults };
  } catch {
    return { ...defaults };
  }
}
export function validateInquiry(value) {
  const name = String(value.name || "").trim(),
    email = String(value.email || "").trim(),
    message = String(value.message || "").trim();
  if (
    !name ||
    name.length > 100 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254 ||
    message.length < 10 ||
    message.length > 2000
  )
    throw Error(
      "Add your name, a valid email and at least 10 characters about the project.",
    );
  if (!["Design", "Care", "Planting", "Help me choose"].includes(value.service))
    throw Error("Choose a service.");
  return { name, email, message, service: value.service };
}
