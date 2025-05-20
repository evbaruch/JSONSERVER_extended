import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_PATH = path.join(__dirname, 'train_urls.index.json');
const URLS_PATH = path.join(__dirname, 'train_urls.txt');

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

const latinWords = [
  "Amor", "Lux", "Aquila", "Veritas", "Natura",
  "Fortuna", "Pax", "Virtus", "Fides", "Gloria",
  "Caelum", "Vita", "Ignis", "Aestas", "Aurum"
];

function getUrlById(id) {
  const start = index[id];
  const end = index[id + 1] ?? fs.statSync(URLS_PATH).size;
  const length = end - start;

  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(URLS_PATH, 'r');
  fs.readSync(fd, buffer, 0, length, start);
  fs.closeSync(fd);

  return buffer.toString().trim();
}

function getRandomLatinTitle(numWords = 2) {
  // shuffle latinWords and pick first numWords
  const shuffled = latinWords
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled.slice(0, numWords).join(' ');
}

server.use(middlewares);

server.get('/pothos/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = router.db;
  const existingItem = db.get('pothos').find({ id }).value();

  if (existingItem) {
    // 200 for existing item
    res.jsonp(existingItem);
  } else if (id < index.length) {
    const albumId = Math.floor(Math.random() * 100) + 1;
    const imageUrl = getUrlById(id);
    const title = getRandomLatinTitle(2);
    // 201 for created
    res.status(201).jsonp({
      albumId,
      id,
      title: `${title} #${id}`,
      url: imageUrl,
      image_url: imageUrl
    });
  } else {
    // 404 for not found
    res.status(404).jsonp({ error: `ID is out of range ${index.length}` });
  }
});

server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server with dynamic fallback running on http://localhost:${PORT}`);
});
