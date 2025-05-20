import fs from 'fs';
import cliProgress from 'cli-progress';

const DB_FILE = 'db.json';
const URLS_FILE = 'train_urls.txt';

console.log('📂 Loading db.json and URLs file...');
console.time('Replace URLs total time');

if (!fs.existsSync(DB_FILE) || !fs.existsSync(URLS_FILE)) {
  console.error('❌ Missing db.json or train_urls.txt');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const urls = fs.readFileSync(URLS_FILE, 'utf-8').split('\n').map(u => u.trim()).filter(Boolean);

if (!db.pothos || db.pothos.length === 0) {
  console.error('⚠️ No pothos found in db.json. Aborting.');
  process.exit(1);
}

console.log(`🔁 Replacing URLs for ${db.pothos.length} items...`);
console.time('URL replacement time');

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(db.pothos.length, 0);

db.pothos = db.pothos.map((item, index) => {
  const url = urls[index] || item.url;
  bar.increment();
  return {
    ...item,
    url,
    thumbnailUrl: url,
  };
});

bar.stop();
console.timeEnd('URL replacement time');

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.timeEnd('Replace URLs total time');

console.log('✅ Updated URLs in db.json!');
