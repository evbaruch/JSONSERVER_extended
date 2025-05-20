// server.js
import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_PATH = path.join(__dirname, 'train_urls.index.json');
const URLS_PATH = path.join(__dirname, 'train_urls.txt');

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

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

server.use(middlewares);

// Custom route handler
server.get('/pothos/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const db = router.db;
  const existingItem = db.get('pothos').find({ id }).value();

  if (existingItem) {
    res.jsonp(existingItem);
  } else if (id < index.length) {
    // If not in db but within the range of pre-indexed file
    const imageUrl = getUrlById(id);
    res.jsonp({
      id,
      name: `Generated Pothos #${id}`,
      image_url: imageUrl
    });
  } else {
    res.status(404).jsonp({ error: 'ID not found' });
  }
});

server.use(router);
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server with dynamic fallback running on http://localhost:${PORT}`);
});
