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

// Function to parse markdown slides
function parseMarkdownSlides(markdownText: string) {
  console.log("Parsing markdown content...");

  // Extract config from the beginning
  const config = extractConfig(markdownText);

  // Split by slide separators (---)
  const sections = markdownText.split(/^---$/gm);

  // Skip the first section if it only contains config
  const slidesSections = sections.filter((section) => {
    const trimmed = section.trim();
    return trimmed && !trimmed.startsWith("<!-- SLIDE_CONFIG");
  });

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

  return {
    id: index,
    type: slideConfig.type || "text",
    background: slideConfig.background || "#1f2937",
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
  const pairs = configText.split(",");

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
