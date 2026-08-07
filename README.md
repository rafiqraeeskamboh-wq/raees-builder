# Raees Builder

Website and installable app for **Raees Builder** - precast RCC roofing, free site estimation and professional installation.

Live: https://rafiqraeeskamboh-wq.github.io/raees-builder/

## Install it as an app

The site is a Progressive Web App (PWA), so it can be installed on a phone or a computer without an app store.

- **Android (Chrome):** open the site and tap **Install App** in the hero section, or use the browser menu and choose *Install app*.
- **iPhone / iPad (Safari):** open the site, tap the Share button, then *Add to Home Screen*.
- **Windows / Mac (Chrome or Edge):** open the site and click the install icon in the address bar.

Once installed it opens full screen with its own icon, and previously visited pages keep working without internet.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Main page |
| `style.css` | Styling |
| `script.js` | Menu, FAQ and WhatsApp form |
| `pwa.js` | Install button and service worker registration |
| `manifest.json` | App name, colours, icons and shortcuts |
| `sw.js` | Service worker - offline caching |
| `offline.html` | Shown when there is no internet |
| `icon.svg`, `icon-maskable.svg` | App icons |
| `logo.png` | Company logo |

## Things to update

Search for `CHANGE ME` in `index.html` and replace the placeholder phone number (`+92 300 1234567`), WhatsApp number, email, office address and the sample project photos with the real ones.

## Bumping the cache

After changing site files, increase the version in `sw.js`:

```js
const CACHE = 'raees-builder-v2';
```

That makes installed apps pick up the new files.
