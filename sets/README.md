# HensTek sample sets

Each numbered set is a distinct scenario and design direction with its own guide. A set may contain website, mobile and desktop examples; its guide lists only the platforms actually present.

| Set | Scenario and design | Examples |
| --- | --- | --- |
| **[Sample Set 01](set-01/README.md)** | Cedar & Fern — warm, editorial garden studio | Website, native iPhone, Electron desktop/browser preview |

## Naming and references

Use **Sample Set 01 — Cedar & Fern** in customer conversations. Reference an individual example as **Set 01 / Website**, **Set 01 / iPhone**, or **Set 01 / Desktop**. The stable machine identifiers are `set-01-website`, `set-01-iphone` and `set-01-desktop`.

New alternate scenarios or substantially different visual directions get Set 02, Set 03 and subsequent numbers. Improvements to an existing set stay within that set and are tracked by Git commit or release version. A set number is not a software version or quality certification.

When adding a set, add a guide in `sets/set-NN/`, list its source paths, runnable demos, actual platform support, customization points and license, then add it to this index and the public catalog. Keep existing source/demo links working. Do not list unfinished sets as available.

The first set's existing source paths are retained for link compatibility. Later sets can keep their sources under `samples/set-NN/<platform>/`; the set guide provides the authoritative mapping.
