# Cedar & Fern — service website

Part of **[Sample Set 01 — Cedar & Fern](../../sets/set-01/README.md)**.

A responsive, single-page website with five sections: Home, Services, Studio, FAQ and Contact. The garden studio, copy and records are fictional.

[Try the demo](https://recondemon.github.io/henstek-sample-set-01/web/)

## Walkthrough

1. Browse the service cards and FAQ. On a narrow screen, use the Menu button.
2. Open **Try the content editor**. Change the headline or services and preview your draft.
3. Reopen the editor and save. Reload to see the locally saved content. **Undo last save** restores the previous save during the same tab session.
4. Export content to JSON. Import fills a draft for review; it does not publish automatically. Restore sample returns this browser to the original copy.
5. Use fictional details in Contact and choose **Preview your inquiry**. Review or copy the summary. Nothing is sent or stored as an inquiry.

Editor changes live in this browser’s local storage. Other visitors see the original sample. Private browsing, clearing site data or switching devices can remove or hide your saved changes. Export anything you want to retain.

## Run and customize

From the repository root, run `npm ci` and `npm run dev`, then open `http://127.0.0.1:4325/web/`.

- `content.mjs`: default copy, field limits and inquiry validation.
- `index.html`: sections, service descriptions, FAQs and metadata.
- `styles.css`: colors, type, spacing and responsive layouts.
- `assets/cedar-fern-mark.png`: transparent botanical studio emblem.
- `assets/courtyard.webp` and `assets/planting-detail.webp`: illustrative garden scenes for the fictional studio; not completed client commissions.
- `app.js`: safe text rendering, local editing and inquiry preview.

Update both the content defaults and the initial HTML copy when changing the template, so the site remains readable before scripts run. Keep labels and validation aligned. Rebuild with `npm run build`; `docs/web/` is generated output.

## Production choices to agree

A commissioned site can use the client's domain and hosting, an authenticated CMS, approved content publishing, a real inquiry endpoint, appointment booking or payments. Those require their own scope, access controls, privacy/retention decisions, abuse protection and end-to-end verification. This demo has no authenticated CMS or working mail delivery. It uses no analytics, cookies, external fonts or remote images. Following an external link leaves the demo.
