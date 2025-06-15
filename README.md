# Realtime Slides - Markdown-Based Presentation System

A modern, real-time synchronized presentation app built with **Deno** and
**Markdown**. Write your slides in familiar Markdown syntax and present with
real-time synchronization across all devices.

## ✨ Features

- 📝 **Markdown-based slides** - Write content in familiar Markdown syntax
- 🔄 **Real-time synchronization** - All viewers see slides instantly when
  presenter changes them
- 🎨 **Rich formatting** - Support for **bold**, _italic_, `code`, links, lists,
  and more
- 🖼️ **Media support** - Images and videos with responsive design
- 🎤 **Three viewing modes** - Presenter, Viewer, and Reader modes for different
  use cases
- 📄 **PDF export** - Download slides as PDF with one slide per page
- ⌨️ **Keyboard navigation** - Arrow keys, spacebar for easy slide control
- 🌐 **Deploy anywhere** - Works on Deno Deploy, Vercel, or any Deno-compatible
  platform
- 📱 **Mobile responsive** - Works great on phones, tablets, and desktops

## 🎭 Viewing Modes

### 🎤 Presenter Mode

- Full slide control with navigation
- Real-time sync to all viewers
- Keyboard shortcuts and fullscreen
- **URL**: `/presenter`

### 👀 Viewer Mode

- Automatically syncs with presenter
- No navigation controls
- Perfect for audience members
- **URL**: `/viewer`

### 📖 Reader Mode

- Independent slide navigation
- Browse slides at your own pace
- PDF download functionality
- Touch/swipe support for mobile
- **URL**: `/reader`

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo>
cd cacing
```

### 2. Edit Your Slides

Edit `slides.md` to create your presentation:

```markdown
# My Presentation

<!-- SLIDE_CONFIG
title: "My Amazing Presentation"
author: "Your Name"
theme: "dark"
-->

---

<!-- SLIDE: type=text, background=#1f2937 -->

# Welcome

This is my **first slide** with _rich formatting_!

- Bullet points work great
- Easy to read and write
- Version control friendly

---

<!-- SLIDE: type=image, background=#1f2937 -->

# With Images

Add images easily with standard Markdown syntax.

![My Image](/static/images/my-image.jpg)

---

<!-- SLIDE: type=video, background=#1f2937 -->

# Video Support

<video controls poster="/static/images/poster.jpg">
  <source src="/static/videos/demo.mp4" type="video/mp4">
</video>
```

### 3. Add Media Files

- Place images in `/static/images/`
- Place videos in `/static/videos/`

### 4. Run Locally

```bash
deno run --allow-net --allow-read main.ts
```

### 5. Open in Browser

- **Home**: http://localhost:8000
- **Presenter**: http://localhost:8000/presenter
- **Viewer**: http://localhost:8000/viewer
- **Reader**: http://localhost:8000/reader

## 📝 Markdown Slide Syntax

### Slide Configuration

Add configuration at the top of your `slides.md`:

```markdown
<!-- SLIDE_CONFIG
title: "Presentation Title"
author: "Your Name"
theme: "dark"
-->
```

### Slide Types

#### Text Slides

```markdown
<!-- SLIDE: type=text, background=#1f2937 -->

# Slide Title

Regular paragraph text with **bold** and _italic_ formatting.

- Bullet point lists
- Support multiple items
- Easy to read

1. Numbered lists
2. Also supported
3. Great for steps
```

#### Image Slides

```markdown
<!-- SLIDE: type=image, background=#1f2937 -->

# Image Slide

Description text goes here.

![Alt text](/static/images/image.jpg)
```

#### Video Slides

```markdown
<!-- SLIDE: type=video, background=#1f2937 -->

# Video Slide

<video controls poster="/static/images/poster.jpg">
  <source src="/static/videos/video.mp4" type="video/mp4">
</video>
```

#### Mixed Content Slides

```markdown
<!-- SLIDE: type=mixed, background=#1f2937 -->

# Mixed Content

Text content with lists:

- Feature one
- Feature two
- Feature three

![Diagram](/static/images/diagram.png)
```

### Supported Markdown Features

- **Bold text**: `**bold**` → **bold**
- _Italic text_: `*italic*` → _italic_
- `Inline code`: `` `code` `` → `code`
- ~~Strikethrough~~: `~~text~~` → ~~text~~
- [Links](https://example.com): `[text](url)` → [text](url)
- Lists: `- item` or `1. item`
- Headers: `# H1`, `## H2`, etc.

## 📄 PDF Export

The Reader mode includes a powerful PDF export feature:

- **One slide per page** in landscape format
- **High-quality rendering** using html2canvas
- **Maintains formatting** and media content
- **Progress indicator** during generation
- **Automatic filename** with timestamp

### How to Export PDF

1. Go to Reader mode (`/reader`)
2. Click the "Download PDF" button
3. Wait for processing (progress bar shows status)
4. PDF automatically downloads when complete

## 🎮 Controls

### Presenter Mode

- **Arrow Keys**: Navigate slides (←/→ or ↑/↓)
- **Spacebar**: Next slide
- **F or F11**: Toggle fullscreen
- **Mouse**: Click Previous/Next buttons

### Viewer Mode

- **F or F11**: Toggle fullscreen
- Automatically syncs with presenter

### Reader Mode

- **Arrow Keys**: Navigate slides (←/→ or ↑/↓)
- **Spacebar**: Next slide
- **Home/End**: Jump to first/last slide
- **Escape**: Exit fullscreen
- **Touch/Swipe**: Mobile navigation
- **PDF Button**: Download as PDF

## 🚀 Deployment

### Deno Deploy

1. Push your code to GitHub
2. Connect to [Deno Deploy](https://deno.com/deploy)
3. Set entry point to `main.ts`
4. Deploy!

### Other Platforms

The app works on any platform that supports Deno:

- Vercel (with Deno runtime)
- Railway
- Fly.io
- Self-hosted servers

## 🛠️ Development

### Project Structure

```
cacing/
├── main.ts                 # Deno server
├── slides.md              # Your presentation content
├── index.html             # Landing page
├── presenter.html         # Presenter interface
├── viewer.html           # Viewer interface
├── static/
│   ├── presenter.js      # Presenter logic
│   ├── viewer.js         # Viewer logic
│   ├── slide-renderer.js # Slide rendering
│   ├── images/           # Image assets
│   └── videos/           # Video assets
└── README.md
```

### API Endpoints

- `GET /` - Landing page
- `GET /presenter` - Presenter interface
- `GET /viewer` - Viewer interface
- `GET /api/slides` - Slide data (parsed from markdown)
- `GET /events` - Server-Sent Events for real-time sync
- `POST /slide` - Update current slide (presenter only)

### Adding New Features

1. Edit `slides.md` for content changes
2. Modify `static/slide-renderer.js` for rendering changes
3. Update `main.ts` for server-side changes

## 🎨 Customization

### Custom Backgrounds

Set custom background colors per slide:

```markdown
<!-- SLIDE: type=text, background=#ff6b6b -->
```

### Custom Styling

Edit the TailwindCSS classes in the renderer or add custom CSS.

### New Slide Types

1. Add parsing logic in `main.ts` (parseMarkdownContent function)
2. Add rendering logic in `static/slide-renderer.js`
3. Update slide type in markdown: `<!-- SLIDE: type=custom -->`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Slides not loading

- Check that `slides.md` exists and has valid syntax
- Verify slide separators (`---`) are on their own lines
- Check browser console for errors

### Images/videos not showing

- Ensure files are in `/static/images/` or `/static/videos/`
- Check file paths in markdown match actual file locations
- Verify file permissions

### Sync not working

- Check that both presenter and viewer are connected to the same server
- Verify Server-Sent Events are working (check Network tab)
- Try refreshing both presenter and viewer

### Deployment issues

- Ensure all files are committed to your repository
- Check that `main.ts` has proper permissions
- Verify environment supports Deno and required permissions

---

**Happy presenting! 🎉**
