(function (root) {
  const statuses = ["New", "Scheduled", "In progress", "Complete"];
  const seed = {
    version: 1,
    jobs: [
      {
        id: "garden-one",
        client: "Rowan House",
        title: "Courtyard planting plan",
        service: "Design",
        status: "In progress",
        due: "This week",
        notes:
          "Fictional project. Review the planting palette and shaded seating corner.",
      },
      {
        id: "garden-two",
        client: "The Maple Courtyard",
        title: "Autumn garden visit",
        service: "Care",
        status: "Scheduled",
        due: "Next week",
        notes: "Fictional project. Seasonal tidy, mulch and a care note.",
      },
      {
        id: "garden-three",
        client: "Alder Apartment",
        title: "Balcony consultation",
        service: "Planting",
        status: "New",
        due: "To agree",
        notes:
          "Fictional project. Three containers and an afternoon-sun planting plan.",
      },
      {
        id: "garden-four",
        client: "Fern Cottage",
        title: "Front path refresh",
        service: "Design",
        status: "Complete",
        due: "Delivered",
        notes: "Fictional project. Handoff notes supplied.",
      },
    ],
  };
  function validate(value) {
    if (
      !value ||
      value.version !== 1 ||
      !Array.isArray(value.jobs) ||
      value.jobs.length > 500
    )
      throw Error(
        "Choose a Studio Board version 1 export with at most 500 jobs.",
      );
    const ids = new Set();
    const clean = {
      version: 1,
      jobs: value.jobs.map((j) => {
        if (
          !j ||
          typeof j.id !== "string" ||
          !/^[-\w]{1,100}$/.test(j.id) ||
          ids.has(j.id) ||
          !statuses.includes(j.status) ||
          !["Design", "Care", "Planting"].includes(j.service)
        )
          throw Error("Invalid job record.");
        ids.add(j.id);
        const result = { id: j.id, status: j.status, service: j.service };
        for (const k of ["client", "title", "due", "notes"]) {
          if (
            typeof j[k] !== "string" ||
            j[k].length > (k === "notes" ? 2000 : 140) ||
            (k !== "notes" && !j[k].trim())
          )
            throw Error("Check the job fields.");
          result[k] = j[k].trim();
        }
        return result;
      }),
    };
    if (
      new TextEncoder().encode(JSON.stringify(clean, null, 2)).length > 500000
    )
      throw Error(
        "Archive exceeds 500 KB. Export and reduce the number or size of jobs before saving.",
      );
    return clean;
  }
  const api = { statuses, seed, validate };
  if (typeof module !== "undefined") module.exports = api;
  else root.StudioModel = api;
})(typeof window === "undefined" ? {} : window);
