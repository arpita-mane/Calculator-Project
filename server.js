
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const publicDirectory = path.join(__dirname, "public");
const files = {
  "/": { name: "index.html", type: "text/html; charset=utf-8" },
  "/styles.css": { name: "styles.css", type: "text/css; charset=utf-8" },
  "/app.js": { name: "app.js", type: "text/javascript; charset=utf-8" },
};
const port = Number(process.env.PORT) || 8000;
const host = "0.0.0.0";

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, `http://${host}`).pathname;
  const file = files[pathname];

  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.readFile(path.join(publicDirectory, file.name), (error, content) => {
    if (error) {
      console.error(`Unable to read ${file.name}:`, error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unable to load the calculator.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": file.type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`Calculator is running on port ${port}`);
});

server.on("error", (error) => {
  console.error("Could not start the calculator server:", error);
  process.exitCode = 1;
});
