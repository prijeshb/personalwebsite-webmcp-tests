import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 4173;
const canonicalUrl = `http://${host}:${port}`;

const tools = [
  ["get_profile", "Return the public profile and canonical identity URL."],
  ["get_resume", "Return public experience, education, and skills."],
  ["list_projects", "List published projects and their canonical URLs."],
  ["search_posts", "Search published writing by a public query."],
  ["contact", "Return the owner's approved public contact channels."],
];

const home = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Portfolio contract fixture</title>
  </head>
  <body>
    <main>
      <h1>Portfolio Owner</h1>
      <nav aria-label="Portfolio">
        <a href="/resume">Resume</a>
        <a href="/projects">Projects</a>
        <a href="/writing">Writing</a>
      </nav>
      <label>Ask about this work <input type="text" name="question"></label>
    </main>
    <script>
      const tools = ${JSON.stringify(tools)};
      if (document.modelContext) {
        for (const [name, description] of tools) {
          document.modelContext.registerTool({
            name,
            description,
            inputSchema: { type: "object", properties: {} },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute: async () => name === "get_profile"
              ? { name: "Portfolio Owner", canonicalUrl: "${canonicalUrl}" }
              : { source: "fixture", tool: name },
          });
        }
      }
    </script>
  </body>
</html>`;

const responses = new Map([
  ["/robots.txt", ["text/plain", "User-agent: *\nAllow: /\n"]],
  [
    "/sitemap.xml",
    [
      "application/xml",
      `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${canonicalUrl}/</loc></url></urlset>`,
    ],
  ],
  ["/llms.txt", ["text/plain", `# Portfolio fixture\nCanonical: ${canonicalUrl}\n`]],
  [
    "/api/profile",
    ["application/json", JSON.stringify({ name: "Portfolio Owner", canonicalUrl })],
  ],
  ["/api/projects", ["application/json", JSON.stringify({ projects: [] })]],
  ["/api/posts", ["application/json", JSON.stringify({ posts: [] })]],
]);

const server = createServer((request, response) => {
  response.setHeader("Origin-Agent-Cluster", "?1");
  response.setHeader("Permissions-Policy", "tools=(self)");

  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(home);
    return;
  }

  const entry = responses.get(request.url);
  if (entry) {
    response.writeHead(200, { "Content-Type": `${entry[0]}; charset=utf-8` });
    response.end(entry[1]);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`WebMCP fixture listening on ${canonicalUrl}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
