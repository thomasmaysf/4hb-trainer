# 4HB Trainer

A personal log for the slow-carb plate, kettlebell swings, Occam's Protocol, prehab, and a longer muscle day. Pick a plan from the objective on the Programs page. The Links page lists the web addresses printed in the book, grouped by chapter. It runs in the browser on a phone or a large desktop screen.

The copy in the app is original. It is not affiliated with Timothy Ferriss or the publisher of *The 4-Hour Body*. Form videos and articles open on their own sites.

## Run it locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints. On the same Wi-Fi, the Network URL opens on your phone.

Logs live in this browser under `4hb-trainer-v1`. Use Settings to download a JSON backup before you switch devices.

## Host it later

```bash
npm run build
```

Upload the `dist` folder to a static host such as Cloudflare Pages or Netlify. The build output URL should be the site root. `public/_redirects` sends unknown paths back to the app, and the build also copies `index.html` to `404.html` for hosts that use that fallback.

There is no account yet. When you add one, replace `load` and `save` in `src/lib/repository.ts`. The screens already read and write through that module.
