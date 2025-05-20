import fs from 'fs/promises';
import cliProgress from 'cli-progress';

const DB_FILE = 'db.json';
const URLS_FILE = 'train_urls.txt';
const INDEX_FILE = 'train_urls.index.json';

console.log('📂 Loading db.json and URLs index file...');
console.time('Replace URLs total time');

async function readLineAtPosition(fd, start, nextStart) {
  const length = nextStart ? nextStart - start : 1024;
  const buffer = Buffer.alloc(length);
  await fd.read(buffer, 0, length, start);
  return buffer.toString('utf-8').replace(/\r?\n$/, '');
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(DB_FILE)) || !(await fileExists(URLS_FILE)) || !(await fileExists(INDEX_FILE))) {
    console.error('❌ Missing db.json or train_urls.txt or train_urls.index.json');
    process.exit(1);
  }

  const [dbData, indexData] = await Promise.all([
    fs.readFile(DB_FILE, 'utf-8'),
    fs.readFile(INDEX_FILE, 'utf-8')
  ]);

  const db = JSON.parse(dbData);
  const index = JSON.parse(indexData);

  if (!db.photos || db.photos.length === 0) {
    console.error('⚠️ No photos found in db.json. Aborting.');
    process.exit(1);
  }

  if (index.length < db.photos.length) {
    console.error('❌ Index length is smaller than photos length!');
    process.exit(1);
  }

  console.log(`🔁 Replacing URLs for ${db.photos.length} items...`);
  console.time('URL replacement time');

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(db.photos.length, 0);

  const fd = await fs.open(URLS_FILE, 'r');

  for (let i = 0; i < db.photos.length; i++) {
    const start = index[i];
    const nextStart = index[i + 1];
    const url = await readLineAtPosition(fd, start, nextStart);
    if (url) {
      db.photos[i].url = url;
      db.photos[i].thumbnailUrl = url;
    }
    bar.increment();
  }

  await fd.close();
  bar.stop();

  console.timeEnd('URL replacement time');
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  console.timeEnd('Replace URLs total time');

  console.log('✅ Updated URLs in db.json!');
}

main().catch(err => {
  console.error('Error:', err);
});
