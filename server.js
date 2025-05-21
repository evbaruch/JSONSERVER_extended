import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_PATH = path.join(__dirname, "train_urls.index.json");
const URLS_PATH = path.join(__dirname, "train_urls.txt");

const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));

const latinWords = [
  "Amor",
  "Lux",
  "Aquila",
  "Veritas",
  "Natura",
  "Fortuna",
  "Pax",
  "Virtus",
  "Fides",
  "Gloria",
  "Caelum",
  "Vita",
  "Ignis",
  "Aestas",
  "Aurum",
];

function getUrlById(id) {
  const start = index[id];

  // Open the file for reading
  const fd = fs.openSync(URLS_PATH, "r");

  // Read in chunks until we find a line break
  const chunkSize = 1024; // Read 1KB at a time
  let buffer = Buffer.alloc(chunkSize);
  let position = start;
  let result = "";
  let bytesRead;

  try {
    // Read in chunks until we find \r\n or EOF
    do {
      bytesRead = fs.readSync(fd, buffer, 0, chunkSize, position);
      if (bytesRead === 0) break; // End of file

      const chunk = buffer.toString("utf8", 0, bytesRead);
      const lineEndIndex = chunk.indexOf("\r\n");

      if (lineEndIndex !== -1) {
        // Found a line break, add only up to that point
        result += chunk.substring(0, lineEndIndex);
        break;
      } else {
        // No line break in this chunk, keep reading
        result += chunk;
        position += bytesRead;
      }
    } while (bytesRead === chunkSize);

    return result.trim();
  } finally {
    // Always close the file descriptor
    fs.closeSync(fd);
  }
}

function getRandomLatinTitle(numWords = 2) {
  // shuffle latinWords and pick first numWords
  const shuffled = latinWords
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled.slice(0, numWords).join(" ");
}

server.use(middlewares);

server.get("/photos/:id", (req, res) => {
  const id = req.params.id;
  const db = router.db;
  const existingItem = db.get("photos").find({ id }).value();
  // debugger;
  if (existingItem) {
    // 304
    res.jsonp(existingItem);
  } else if (id < index.length) {
    const albumId = Math.floor(Math.random() * 100) + 1;
    const imageUrl = getUrlById(id);
    const title = getRandomLatinTitle(2);
    // 201 for created
    // a code for "returned from 9 millions entries" should be a code that couldn't be return from the normal db.json
    // so a good code will be ?
    res.status(203).jsonp({
      albumId,
      id,
      title: `${title} #${id}`,
      url: imageUrl,
      thumbnailUrl: imageUrl,
    });
  } else {
    // 404 for not found
    console.log(`Sending error: ID ${id} is out of range ${index.length}`);
    return res
      .status(404)
      .json({ error: `ID is out of range ${index.length}` });
  }
});

server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(
    `🚀 JSON Server with dynamic fallback running on http://localhost:${PORT}`
  );
});
