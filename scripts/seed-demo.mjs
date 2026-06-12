import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(process.cwd());
const sqliteDir = join(rootDir, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const isRemote = process.argv.includes('--remote');
const sqlFile = join(rootDir, 'scripts', isRemote ? 'demo-data.remote.sql' : 'demo-data.sql');

if (isRemote) {
  const result = spawnSync(
    './node_modules/.bin/wrangler',
    ['d1', 'execute', 'paws', '--remote', '--file', sqlFile],
    { stdio: 'inherit' },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

if (!existsSync(sqliteDir)) {
  console.error(`找不到本機 D1 目錄：${sqliteDir}`);
  process.exit(1);
}

const dbFiles = readdirSync(sqliteDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.sqlite'))
  .map((entry) => join(sqliteDir, entry.name));

if (!dbFiles.length) {
  console.error(`找不到本機 D1 SQLite 檔案：${sqliteDir}`);
  process.exit(1);
}

const dbFile = dbFiles[0];
const result = spawnSync('sqlite3', [dbFile, `.read ${sqlFile}`], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
