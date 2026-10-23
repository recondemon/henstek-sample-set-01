import { mkdir, copyFile, rm, cp } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
await rm(resolve(root, "docs"), { recursive: true, force: true });
for (const dir of ["docs", "docs/web", "docs/web/assets", "docs/desktop"])
  await mkdir(resolve(root, dir), { recursive: true });
for (const name of ["index.html", "catalog.css"])
  await copyFile(resolve(root, "public", name), resolve(root, "docs", name));
for (const name of ["index.html", "styles.css", "app.js", "content.mjs"])
  await copyFile(
    resolve(root, "samples/website", name),
    resolve(root, "docs/web", name),
  );
await copyFile(
  resolve(root, "samples/website/assets/garden.svg"),
  resolve(root, "docs/web/assets/garden.svg"),
);
for (const name of ["index.html", "styles.css", "renderer.js", "model.js"])
  await copyFile(
    resolve(root, "samples/desktop", name),
    resolve(root, "docs/desktop", name),
  );
await (
  await import("node:fs/promises")
).writeFile(resolve(root, "docs/.nojekyll"), "");
console.log(
  "Built public catalog, website and desktop browser preview in docs/.",
);

await cp(resolve(root,"public/previews"),resolve(root,"docs/previews"),{recursive:true});
