import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

let sockets: WebSocket[] = [];

router.get("/ws", (ctx) => {
  if (ctx.isUpgradable) {
    const ws = ctx.upgrade();
    sockets.push(ws);
    ws.addEventListener("message", (event) => {
      // Broadcast to all except sender
      sockets.forEach((sock) => {
        if (sock !== ws && sock.readyState === WebSocket.OPEN) {
          sock.send(event.data);
        }
      });
    });
    ws.addEventListener("close", () => {
      sockets = sockets.filter((sock) => sock !== ws);
    });
  }
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

// Serve index.html for all other routes
app.use(async (ctx) => {
  await send(ctx, "/index.html", {
    root: `${Deno.cwd()}`,
  });
});

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
