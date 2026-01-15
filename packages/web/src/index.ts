import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/manifest.json": Bun.file("./public/manifest.json"),
    "/sw.js": Bun.file("./public/sw.js"),
    "/icons/*": async req => {
      const name = new URL(req.url).pathname.split("/").pop();
      return new Response(Bun.file(`./public/icons/${name}`));
    },
    "/logo.svg": Bun.file("./src/logo.svg"),

    // API Routes
    "/api/hello": {
      async GET(req) {
        return Response.json({ message: "Hello, world!", method: "GET" });
      },
      async PUT(req) {
        return Response.json({ message: "Hello, world!", method: "PUT" });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({ message: `Hello, ${name}!` });
    },

    // Serve index.html for all other unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
