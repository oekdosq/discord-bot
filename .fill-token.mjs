import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

const envPath = resolve('.env');
const src = existsSync(envPath) ? readFileSync(envPath, 'utf8') : readFileSync(resolve('.env.example'), 'utf8');

function replaced(src, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  return re.test(src) ? src.replace(re, line) : `${src.replace(/\s+$/, '')}\n${line}\n`;
}

function askHidden(question) {
  return new Promise((res) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(question);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.setRawMode(true);
    let out = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdin.pause();
          stdout.write('\n');
          res(out);
          return;
        }
        if (ch === '\u0003') process.exit();
        if (ch === '\u007f') { out = out.slice(0, -1); continue; }
        out += ch;
      }
    };
    stdin.on('data', onData);
  });
}

const token = await askHidden('Tempel DISCORD_TOKEN (tersembunyi) lalu Enter: ').catch(() => '');
if (!token.trim()) {
  console.error('Kosong — batal.');
  process.exit(1);
}
if (token.trim().split('.').length !== 3) {
  console.error('Bentuk token tidak valid (harus 3 bagian dipisah titik). Token TIDAK ditulis — ulang.');
  process.exit(1);
}
writeFileSync(envPath, replaced(src, 'DISCORD_TOKEN', token.trim()));
console.log(`OK: DISCORD_TOKEN ditulis ke ${envPath} (panjang ${token.trim().length}). Jangan bagikan token ini ke siapa pun.`);