# Realtime Slides App

A modern presentation system with real-time synchronization, built with Deno,
Oak, TailwindCSS, and ready for Deno Deploy. Features a flexible JSON-based
slide system with full media support.

## Features

- **JSON-based slide content** - Centralized slide management
- **Multiple slide types** - Text, Image, Video, and Mixed layouts
- **Media support** - Images, videos, and custom backgrounds
- **Separate URLs** for presenter and viewer modes
- **Real-time slide sync** using Server-Sent Events
- **Full screen presentation mode**
- **Keyboard navigation** for presenters (arrow keys, spacebar)
- **Responsive design** with TailwindCSS
- **Deno Deploy compatible** (uses SSE instead of WebSockets)

## URLs

- **Landing Page**: `/` - Choose between presenter or viewer mode
- **Presenter Mode**: `/presenter` - Control slides with full navigation
- **Viewer Mode**: `/viewer` - Read-only slide viewing that syncs with presenter

## Slide Types Supported

### 1. Text Slides

```json
{
  "type": "text",
  "title": "Slide Title",
  "content": "Main content text",
  "list": ["Bullet point 1", "Bullet point 2"],
  "background": "#1f2937"
}
```

### 2. Image Slides

```json
{
  "type": "image",
  "title": "Slide Title",
  "content": "Description text",
  "media": {
    "type": "image",
    "src": "/static/images/your-image.jpg",
    "alt": "Image description"
  },
  "background": "#1f2937"
}
```

### 3. Video Slides

```json
{
  "type": "video",
  "title": "Slide Title",
  "content": "Video description",
  "media": {
    "type": "video",
    "src": "/static/videos/your-video.mp4",
    "poster": "/static/images/video-poster.jpg",
    "controls": true
  },
  "background": "#1f2937"
}
```

### 4. Mixed Slides

```json
{
  "type": "mixed",
  "title": "Slide Title",
  "content": "Main content",
  "list": ["Item 1", "Item 2"],
  "media": {
    "type": "image",
    "src": "/static/images/side-image.jpg",
    "alt": "Side image"
  },
  "background": "#1f2937"
}
```

## File Structure

```
├── main.ts                 # Deno server
├── slides.json            # Slide content (edit this!)
├── index.html             # Landing page
├── presenter.html         # Presenter interface
├── viewer.html           # Viewer interface
└── static/
    ├── slide-renderer.js  # Slide rendering engine
    ├── presenter.js       # Presenter logic
    ├── viewer.js         # Viewer logic
    ├── images/           # Your images here
    └── videos/           # Your videos here
```

## Running Locally

1. Install [Deno](https://deno.land/)
2. Run the server:
   ```sh
   deno run --allow-net --allow-read main.ts
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your browser
4. Choose "Start Presenting" or "Join as Viewer"

## Customizing Your Presentation

### 1. Edit Slide Content

Edit `slides.json` to customize your presentation:

- Add/remove slides
- Change slide types
- Update content and media
- Customize backgrounds

### 2. Add Media Files

- **Images**: Place in `/static/images/` (supports JPG, PNG, SVG, WebP)
- **Videos**: Place in `/static/videos/` (supports MP4, WebM)

### 3. Supported Media Formats

- **Images**: JPG, PNG, SVG, WebP, GIF
- **Videos**: MP4, WebM (with fallback support)
- **Background colors**: Any valid CSS color value

## How to Use

1. **Presenter**:
   - Go to `/presenter` or click "Start Presenting"
   - Use mouse clicks or keyboard (←/→ arrows, spacebar) to navigate
   - Press 'F' or F11 for fullscreen

2. **Viewers**:
   - Go to `/viewer` or click "Join as Viewer"
   - Slides automatically sync when presenter changes them
   - Press 'F' or F11 for fullscreen

## Deploying to Deno Deploy

1. Push this folder to a GitHub repository.
2. Go to [Deno Deploy](https://deno.com/deploy) and create a new project.
3. Link your repository and set the entry point to `main.ts`.
4. Deploy and share your live URL!

## Example slides.json Structure

```json
{
  "slides": [
    {
      "id": 1,
      "type": "text",
      "title": "Welcome",
      "content": "Your presentation content here",
      "background": "#1f2937"
    }
  ],
  "config": {
    "title": "Your Presentation Title",
    "author": "Your Name",
    "theme": "dark"
  }
}
```

---

**Pro Tips:**

- Use high-quality images (recommended: 1920x1080 or similar)
- Keep video files under 50MB for better loading
- Test your presentation locally before deploying
- Use descriptive alt text for accessibility
