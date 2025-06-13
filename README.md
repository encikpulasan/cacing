# Realtime Slides App

A simple website to display presentation slides in full screen and synchronize
the current slide for all viewers, built with Deno, Oak, TailwindCSS, and ready
for Deno Deploy.

## Features

- Full screen presentation mode
- Real-time slide sync for all viewers
- Presenter mode toggle
- Built with Deno and Oak
- Styled with TailwindCSS CDN

## Running Locally

1. Install [Deno](https://deno.land/)
2. Run the server:
   ```sh
   deno run --allow-net --allow-read main.ts
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your browser.

## Deploying to Deno Deploy

1. Push this folder to a GitHub repository.
2. Go to [Deno Deploy](https://deno.com/deploy) and create a new project.
3. Link your repository and set the entry point to `main.ts`.
4. Deploy and share your live URL!

---

Feel free to customize the slides in `static/app.js`.
