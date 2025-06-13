import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

let currentSlide = 0;
let clients: Array<
  { controller: ReadableStreamDefaultController; id: string }
> = [];

// SSE endpoint for receiving slide updates
router.get("/events", (ctx) => {
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // Add client to the list
      clients.push({ controller, id: clientId });

      // Send initial slide state
      controller.enqueue(
        `data: ${JSON.stringify({ type: "slide", index: currentSlide })}\n\n`,
      );

      // Keep connection alive with periodic pings
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Clean up when client disconnects
      const cleanup = () => {
        clients = clients.filter((client) => client.id !== clientId);
        clearInterval(keepAlive);
        try {
          controller.close();
        } catch {
          // Connection already closed
        }
      };

      // Set up cleanup on connection close
      setTimeout(cleanup, 300000); // 5 minute timeout
    },
  });

  ctx.response.headers.set("Content-Type", "text/event-stream");
  ctx.response.headers.set("Cache-Control", "no-cache");
  ctx.response.headers.set("Connection", "keep-alive");
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = stream;
});

// Endpoint to get slides data
router.get("/api/slides", async (ctx) => {
  try {
    const slidesData = await Deno.readTextFile("slides.json");
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = slidesData;
  } catch (error) {
    console.error("Error reading slides.json:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to load slides" };
  }
});

// Endpoint to update slide (for presenter)
router.post("/slide", async (ctx) => {
  const body = await ctx.request.body.json();
  const slideIndex = parseInt(body.index);

  if (!isNaN(slideIndex)) {
    currentSlide = slideIndex;

    // Broadcast to all connected clients
    const message = `data: ${
      JSON.stringify({ type: "slide", index: currentSlide })
    }\n\n`;
    clients = clients.filter((client) => {
      try {
        client.controller.enqueue(message);
        return true;
      } catch {
        // Client disconnected, remove from list
        return false;
      }
    });
  }

  ctx.response.body = { success: true, currentSlide };
});

// Presenter route
router.get("/presenter", async (ctx) => {
  await send(ctx, "/presenter.html", {
    root: `${Deno.cwd()}`,
  });
});

// Viewer route
router.get("/viewer", async (ctx) => {
  await send(ctx, "/viewer.html", {
    root: `${Deno.cwd()}`,
  });
});

// Serve static files
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith("/static/")) {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}`,
    });
  } else {
    await next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// Serve index.html for root route (landing page)
app.use(async (ctx) => {
  if (ctx.request.url.pathname === "/") {
    await send(ctx, "/index.html", {
      root: `${Deno.cwd()}`,
    });
  } else {
    ctx.response.status = 404;
    ctx.response.body = "Not Found";
  }
});

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
