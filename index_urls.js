import fs from 'fs';
import cliProgress from 'cli-progress';

const URLS_FILE = 'train_urls.txt';
const INDEX_FILE = 'train_urls.index.json';

console.log('🔍 Indexing URLs file...');
console.time('Indexing time');

const fileSize = fs.statSync(URLS_FILE).size;
const fd = fs.openSync(URLS_FILE, 'r');
const index = [];

let position = 0;
const buffer = Buffer.alloc(1);
let lineStart = 0;

// Progress bar setup
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(fileSize, 0);

while (fs.readSync(fd, buffer, 0, 1, position) === 1) {
  if (buffer[0] === 0x0a) { // newline \n
    index.push(lineStart);
    lineStart = position + 1;
  }
  position++;
  if (position % 1000 === 0) {
    bar.update(position);
  }
}
fs.closeSync(fd);

// save last line if file does not end with newline
if (lineStart < position) {
  index.push(lineStart);
}
bar.update(fileSize);
bar.stop();

fs.writeFileSync(INDEX_FILE, JSON.stringify(index));
console.timeEnd('Indexing time');
console.log(`✅ Indexed ${index.length} lines to ${INDEX_FILE}`);
