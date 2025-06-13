# Realtime Slides Presentation

<!-- SLIDE_CONFIG
title: "Realtime Slides Presentation"
author: "Your Name"
theme: "dark"
-->

---

<!-- SLIDE: type=text, background=#1f2937 -->

# Welcome to Realtime Slides

This is a **real-time synchronized presentation app** built with modern web
technologies!

- Easy to write in Markdown
- Rich text formatting support
- Real-time synchronization
- Multiple slide types

---

<!-- SLIDE: type=image, background=#1f2937 -->

# How it Works

When the presenter changes slides, all viewers see the same slide instantly
using **Server-Sent Events**.

![Diagram showing real-time synchronization](/static/images/placeholder.svg)

The system uses modern web technologies to ensure smooth, real-time updates
across all connected devices.

---

<!-- SLIDE: type=mixed, background=#1f2937 -->

# Tech Stack

Built with modern, secure, and fast technologies:

## Core Technologies

- 🦕 **Deno** - Secure JavaScript/TypeScript runtime
- 🌳 **Oak** - Middleware framework for Deno
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 📡 **Server-Sent Events** - Real-time communication
- ☁️ **Deno Deploy** - Edge deployment platform

## Features

- Markdown-based content
- Rich text formatting
- Image and video support
- Custom styling options

![Technology stack](/static/images/placeholder.svg)

---

<!-- SLIDE: type=video, background=#1f2937 -->

# Demo Video

Watch how easy it is to create synchronized presentations:

<video controls poster="/static/images/video-poster.jpg">
  <source src="/static/videos/demo.mp4" type="video/mp4">
  Your browser doesn't support video playback.
</video>

**Key Benefits:**

- Write in familiar Markdown syntax
- Rich formatting with **bold**, _italic_, and `code`
- Easy to version control
- Simple to edit and maintain

---

<!-- SLIDE: type=text, background=#1e40af -->

# Markdown Features

This slide system supports extensive Markdown features:

## Text Formatting

- **Bold text** and _italic text_
- `Inline code` and code blocks
- ~~Strikethrough~~ text
- [Links](https://deno.land) to external resources

## Lists and Structure

1. Numbered lists
2. With multiple items
3. Easy to read and write

- Bullet points
- Nested lists
  - Sub-items
  - More details

## Code Blocks

```javascript
// Syntax highlighting supported
const slides = await loadMarkdownSlides();
console.log("Slides loaded!");
```

---

<!-- SLIDE: type=text, background=#059669 -->

# Get Started

Ready to create your own synchronized presentation?

## Quick Start Guide

1. 📝 **Edit slides.md** - Write your content in Markdown
2. 🖼️ **Add images** to `/static/images/`
3. 🎥 **Add videos** to `/static/videos/`
4. 🚀 **Deploy** to Deno Deploy
5. 🎉 **Share** with your audience!

## Slide Types Available

- **Text slides** - Rich markdown content
- **Image slides** - Photos with captions
- **Video slides** - Embedded video content
- **Mixed slides** - Combine text, images, and media

### Pro Tips

> Use `<!-- SLIDE: type=text, background=#color -->` to customize each slide
>
> Images and videos are automatically responsive
>
> Markdown syntax makes editing fast and intuitive
