import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/site.webmanifest": Bun.file("./site.webmanifest"),
    "/sw.js": async req => {
      return new Response(Bun.file("./sw.js"), {
        headers: {
          "Content-Type": "application/javascript",
        },
      });
    },
    "/icons/*": async req => {
      const name = new URL(req.url).pathname.split("/").pop();
      return new Response(Bun.file(`./icons/${name}`));
    },
    // Serve index.html for all other unmatched routes.
    "/*": index,
  },
  port: process.env.PORT || 3000,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
