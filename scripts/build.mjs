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
await cp(resolve(root, "samples/website/assets"), resolve(root, "docs/web/assets"), { recursive: true });
await cp(resolve(root, "samples/desktop/assets"), resolve(root, "docs/desktop/assets"), { recursive: true });
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

// Browser companions are published alongside the native source and desktop renderer.
const previewFs = await import('node:fs/promises');
await previewFs.cp(resolve(root, 'samples/mobile-preview'), resolve(root, 'docs/mobile'), {recursive: true});
for (const name of ['sample-viewer.js', 'sample-viewer.css', 'preview-bridge.js'])
  await previewFs.copyFile(resolve(root, 'public', name), resolve(root, 'docs', name));
for (const platform of ['web', 'desktop', 'mobile']) {
  const file = resolve(root, 'docs', platform, 'index.html');
  const html = await previewFs.readFile(file, 'utf8');
  await previewFs.writeFile(file, html.replace('</body>', '<script src="../preview-bridge.js" defer></script></body>'));
}
