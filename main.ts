import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const app = new Application();
const router = new Router();

// Store current slide state
let currentSlide = 0;

// Store SSE connections
const connections = new Set<any>();

// Serve static files
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith("/static/")) {
    try {
      await ctx.send({
        root: `${Deno.cwd()}`,
        index: "index.html",
      });
    } catch {
      await next();
    }
  } else {
    await next();
  }
});

// Routes
router.get("/", async (ctx) => {
  const html = await Deno.readTextFile("index.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/presenter", async (ctx) => {
  const html = await Deno.readTextFile("presenter.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/viewer", async (ctx) => {
  const html = await Deno.readTextFile("viewer.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/reader", async (ctx) => {
  const html = await Deno.readTextFile("reader.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/test-sync", async (ctx) => {
  const html = await Deno.readTextFile("test-sync.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/test-jspdf", async (ctx) => {
  const html = await Deno.readTextFile("test-jspdf.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

router.get("/editor", async (ctx) => {
  const html = await Deno.readTextFile("editor.html");
  ctx.response.body = html;
  ctx.response.headers.set("Content-Type", "text/html");
});

// API endpoint to get slides from markdown
router.get("/api/slides", async (ctx) => {
  try {
    console.log("Loading slides from slides.md...");
    const markdownContent = await Deno.readTextFile("slides.md");

    // Parse markdown content
    const parsedData = parseMarkdownSlides(markdownContent);

    ctx.response.body = parsedData;
    ctx.response.headers.set("Content-Type", "application/json");
  } catch (error) {
    console.error("Error loading slides:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to load slides" };
  }
});

// API endpoint to save slides to markdown
router.post("/api/slides", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { slides, config } = body;

    console.log("Saving slides to slides.md...");

    // Generate markdown content
    let markdownContent = "";

    // Add config section
    if (config) {
      markdownContent += "<!-- SLIDE_CONFIG\n";
      for (const [key, value] of Object.entries(config)) {
        markdownContent += `${key}: "${value}"\n`;
      }
      markdownContent += "-->\n\n";
    }

    // Add slides
    slides.forEach((slide: any, index: number) => {
      if (index > 0) {
        markdownContent += "\n---\n\n";
      }

      // Add slide config comment with typography options
      const slideConfig = `type=${slide.type || "text"}, background=${
        slide.background || "#1f2937"
      }`;
      const titleStyle = slide.titleStyle
        ? `, titleStyle=${JSON.stringify(slide.titleStyle).replace(/"/g, "'")}`
        : "";
      const contentStyle = slide.contentStyle
        ? `, contentStyle=${
          JSON.stringify(slide.contentStyle).replace(/"/g, "'")
        }`
        : "";
      const listStyle = slide.listStyle
        ? `, listStyle=${JSON.stringify(slide.listStyle).replace(/"/g, "'")}`
        : "";
      const layout = slide.layout && slide.layout !== "default"
        ? `, layout=${slide.layout}`
        : "";

      markdownContent +=
        `<!-- SLIDE: ${slideConfig}${titleStyle}${contentStyle}${listStyle}${layout} -->\n\n`;

      // Add title
      if (slide.title) {
        markdownContent += `# ${slide.title}\n\n`;
      }

      // Add content
      if (slide.content) {
        markdownContent += `${slide.content}\n\n`;
      }

      // Add list items
      if (slide.list && slide.list.length > 0) {
        slide.list.forEach((item: string) => {
          markdownContent += `- ${item}\n`;
        });
        markdownContent += "\n";
      }

      // Add media
      if (slide.media) {
        if (slide.media.type === "image") {
          markdownContent += `![${
            slide.media.alt || "Image"
          }](${slide.media.src})\n\n`;
        } else if (slide.media.type === "video") {
          markdownContent += `<video${slide.media.controls ? " controls" : ""}${
            slide.media.poster ? ` poster="${slide.media.poster}"` : ""
          }>\n`;
          markdownContent +=
            `  <source src="${slide.media.src}" type="video/mp4">\n`;
          markdownContent += `</video>\n\n`;
        }
      }
    });

    // Write to file
    await Deno.writeTextFile("slides.md", markdownContent);

    console.log("Slides saved successfully");
    ctx.response.body = { success: true, message: "Slides saved successfully" };
  } catch (error) {
    console.error("Error saving slides:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to save slides",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// API endpoint for file uploads
router.post("/api/upload", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "form-data" });
    const formData = await body.value.read();

    if (!formData.files || formData.files.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No file uploaded" };
      return;
    }

    const file = formData.files[0];
    if (!file.filename || !file.content) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid file data" };
      return;
    }

    const fileExtension = file.filename.split(".").pop()?.toLowerCase();

    // Validate file type
    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "webm",
      "mov",
    ];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Invalid file type. Allowed: " + allowedExtensions.join(", "),
      };
      return;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const newFilename = `${timestamp}_${randomId}.${fileExtension}`;

    // Determine upload directory
    const isVideo = ["mp4", "webm", "mov"].includes(fileExtension);
    const uploadDir = isVideo ? "static/videos" : "static/images";
    const filePath = `${uploadDir}/${newFilename}`;

    // Ensure directory exists
    try {
      await Deno.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    await Deno.writeFile(filePath, file.content);

    console.log(`File uploaded: ${filePath}`);

    ctx.response.body = {
      success: true,
      filename: newFilename,
      path: `/${filePath}`,
      type: isVideo ? "video" : "image",
      size: file.content.length,
    };
  } catch (error) {
    console.error("Upload error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Upload failed",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Server-Sent Events endpoint
router.get("/events", (ctx) => {
  const target = ctx.sendEvents();
  connections.add(target);

  console.log(
    `New SSE connection established. Total connections: ${connections.size}`,
  );

  // Send current slide immediately
  try {
    target.dispatchMessage({
      data: JSON.stringify({ type: "slide", index: currentSlide }),
    });
  } catch (error) {
    console.log("Failed to send initial message:", error);
    connections.delete(target);
  }

  // Handle connection close
  const cleanup = () => {
    connections.delete(target);
    console.log(
      `SSE connection closed. Remaining connections: ${connections.size}`,
    );
  };

  // Listen for various close events
  target.addEventListener("close", cleanup);
  target.addEventListener("error", cleanup);
});

// Update slide endpoint
router.post("/slide", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  currentSlide = body.index;

  console.log(
    `Slide updated to: ${currentSlide}. Broadcasting to ${connections.size} connections`,
  );

  // Broadcast to all connected clients
  const message = { type: "slide", index: currentSlide };
  const deadConnections = new Set();

  for (const connection of connections) {
    try {
      connection.dispatchMessage({
        data: JSON.stringify(message),
      });
    } catch (error) {
      console.log(
        "Failed to send message to connection, marking for removal:",
        String(error),
      );
      deadConnections.add(connection);
    }
  }

  // Clean up dead connections
  for (const deadConnection of deadConnections) {
    connections.delete(deadConnection);
  }

  console.log(
    `Message sent successfully to ${
      connections.size - deadConnections.size
    } connections`,
  );

  ctx.response.body = { success: true };
});

// Sync endpoint for presenter to update current slide
router.post("/api/sync", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  currentSlide = body.slide;
  console.log(`Slide synced to: ${currentSlide}`);
  ctx.response.body = { success: true };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("🚀 Server running on http://localhost:8000");
console.log("📝 Edit slides.md to update your presentation content");
console.log("🎤 Presenter: http://localhost:8000/presenter");
console.log("👀 Viewer: http://localhost:8000/viewer");
console.log("📖 Reader: http://localhost:8000/reader");

await app.listen({ port: 8000 });

// Function to parse markdown slides
function parseMarkdownSlides(markdownText: string) {
  console.log("Parsing markdown content...");

  // Extract config from the beginning
  const config = extractConfig(markdownText);

  // Split by slide separators (---)
  const sections = markdownText.split(/^---$/gm);

  // Process sections - the first section might contain both config and first slide
  const slidesSections = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    if (i === 0) {
      // First section - remove config and keep slide content
      const withoutConfig = section.replace(
        /<!-- SLIDE_CONFIG[\s\S]*?-->\s*/g,
        "",
      ).trim();
      if (withoutConfig && withoutConfig.includes("<!-- SLIDE:")) {
        slidesSections.push(withoutConfig);
      }
    } else {
      // Other sections - include if they have slide content
      if (section.includes("<!-- SLIDE:")) {
        slidesSections.push(section);
      }
    }
  }

  const slides = slidesSections.map((section, index) => {
    return parseSlide(section.trim(), index);
  }).filter((slide) => slide !== null);

  console.log(`Parsed ${slides.length} slides`);
  return { slides, config };
}

function extractConfig(markdownText: string) {
  const configMatch = markdownText.match(
    /<!-- SLIDE_CONFIG\s*([\s\S]*?)\s*-->/,
  );
  const defaultConfig: Record<string, string> = {
    title: "Presentation",
    author: "Unknown",
    theme: "dark",
  };

  if (!configMatch) return defaultConfig;

  const configText = configMatch[1];
  const config = { ...defaultConfig };

  // Parse simple key: value pairs
  const lines = configText.split("\n");
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (match) {
      config[match[1]] = match[2];
    }
  }

  return config;
}

function parseSlide(section: string, index: number) {
  if (!section) return null;

  // Extract slide metadata
  const slideConfig = extractSlideConfig(section);

  // Remove slide config comments from content
  const content = section.replace(/<!-- SLIDE:.*?-->/g, "").trim();

  if (!content) return null;

  // Parse markdown content
  const parsedContent = parseMarkdownContent(content);

  // Parse typography styles
  let titleStyle = null;
  let contentStyle = null;
  let listStyle = null;

  if (slideConfig.titleStyle) {
    try {
      titleStyle = JSON.parse(slideConfig.titleStyle);
    } catch (e) {
      console.warn("Failed to parse titleStyle JSON:", e);
    }
  }

  if (slideConfig.contentStyle) {
    try {
      contentStyle = JSON.parse(slideConfig.contentStyle);
    } catch (e) {
      console.warn("Failed to parse contentStyle JSON:", e);
    }
  }

  if (slideConfig.listStyle) {
    try {
      listStyle = JSON.parse(slideConfig.listStyle);
    } catch (e) {
      console.warn("Failed to parse listStyle JSON:", e);
    }
  }

  return {
    id: index,
    type: slideConfig.type || "text",
    background: slideConfig.background || "#1f2937",
    layout: slideConfig.layout || "default",
    titleStyle: titleStyle,
    contentStyle: contentStyle,
    listStyle: listStyle,
    title: parsedContent.title || `Slide ${index + 1}`,
    content: parsedContent.content,
    list: parsedContent.list,
    media: parsedContent.media,
  };
}

function extractSlideConfig(section: string) {
  const configMatch = section.match(/<!-- SLIDE:\s*([^>]*)\s*-->/);
  const config: Record<string, string> = {
    type: "text",
    background: "#1f2937",
  };

  if (!configMatch) return config;

  const configText = configMatch[1];

  // Handle JSON-like attributes (titleStyle, contentStyle, listStyle)
  const titleStyleMatch = configText.match(/titleStyle=\{([^}]+)\}/);
  if (titleStyleMatch) {
    try {
      const jsonStr = "{" + titleStyleMatch[1].replace(/'/g, '"') + "}";
      config.titleStyle = jsonStr;
    } catch (e) {
      console.warn("Failed to parse titleStyle:", e);
    }
  }

  const contentStyleMatch = configText.match(/contentStyle=\{([^}]+)\}/);
  if (contentStyleMatch) {
    try {
      const jsonStr = "{" + contentStyleMatch[1].replace(/'/g, '"') + "}";
      config.contentStyle = jsonStr;
    } catch (e) {
      console.warn("Failed to parse contentStyle:", e);
    }
  }

  const listStyleMatch = configText.match(/listStyle=\{([^}]+)\}/);
  if (listStyleMatch) {
    try {
      const jsonStr = "{" + listStyleMatch[1].replace(/'/g, '"') + "}";
      config.listStyle = jsonStr;
    } catch (e) {
      console.warn("Failed to parse listStyle:", e);
    }
  }

  // Handle simple key=value pairs (remove style attributes first)
  const cleanConfigText = configText
    .replace(/titleStyle=\{[^}]+\}/g, "")
    .replace(/contentStyle=\{[^}]+\}/g, "")
    .replace(/listStyle=\{[^}]+\}/g, "");

  const pairs = cleanConfigText.split(",");
  for (const pair of pairs) {
    const [key, value] = pair.split("=").map((s) => s.trim());
    if (key && value) {
      config[key] = value;
    }
  }

  return config;
}

function parseMarkdownContent(markdown: string) {
  const lines = markdown.split("\n");
  let title = "";
  let content = "";
  let list: string[] = [];
  let media = null;

  const listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract title (first h1)
    if (line.startsWith("# ") && !title) {
      title = line.substring(2).trim();
      continue;
    }

    // Handle images
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      media = {
        type: "image",
        src: imageMatch[2],
        alt: imageMatch[1] || "Image",
      };
      continue;
    }

    // Handle videos
    const videoMatch = line.match(/<video([^>]*)>/);
    if (videoMatch) {
      const videoAttrs = videoMatch[1];
      const controlsMatch = videoAttrs.match(/controls/);
      const posterMatch = videoAttrs.match(/poster="([^"]+)"/);

      // Look for source tag in next lines
      let src = "";
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const sourceMatch = lines[j].match(/<source src="([^"]+)"/);
        if (sourceMatch) {
          src = sourceMatch[1];
          break;
        }
      }

      if (src) {
        media = {
          type: "video",
          src: src,
          controls: !!controlsMatch,
          poster: posterMatch ? posterMatch[1] : null,
        };
      }
      continue;
    }

    // Handle list items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(parseInlineMarkdown(line.substring(2).trim()));
      continue;
    }

    // Handle numbered lists
    if (line.match(/^\d+\.\s/)) {
      listItems.push(parseInlineMarkdown(line.replace(/^\d+\.\s/, "")));
      continue;
    }

    // Handle nested list items
    if (line.match(/^\s+[-*]\s/)) {
      const indent = line.match(/^(\s+)/)?.[1]?.length || 0;
      const text = line.replace(/^\s+[-*]\s/, "");
      listItems.push("&nbsp;".repeat(indent) + parseInlineMarkdown(text));
      continue;
    }

    // Skip empty lines and headers (except h1)
    if (!line || line.startsWith("#")) {
      continue;
    }

    // Skip HTML comments and code blocks
    if (line.startsWith("<!--") || line.startsWith("```")) {
      continue;
    }

    // Add to content
    if (line) {
      content += (content ? " " : "") + parseInlineMarkdown(line);
    }
  }

  // Set list if we found list items
  if (listItems.length > 0) {
    list = listItems;
  }

  return {
    title: title || "Untitled Slide",
    content: content || "",
    list: list.length > 0 ? list : null,
    media: media,
  };
}

function parseInlineMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code
    .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank">$1</a>',
    );
}
