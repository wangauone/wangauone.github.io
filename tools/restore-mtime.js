'use strict';

// Sets each committed file under source/ to the time of its last commit.
//
// A post that doesn't set `updated:` shows the file's modification time as
// its updated time (updated_option: 'mtime'). A fresh git checkout gives every
// file the checkout time, so without this each CI build would mark every such
// post as just updated. Files with uncommitted changes keep their own time.
// Runs before `npm run build` (the prebuild script in package.json).

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function split(output) {
  return output.split('\0').filter(Boolean);
}

try {
  git('rev-parse', '--git-dir');
} catch {
  console.warn('restore-mtime: not a git repository, leaving file times as they are');
  process.exit(0);
}

if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
  console.error('restore-mtime: shallow clone, so last-commit times would be wrong.\n'
    + 'Fetch the full history (actions/checkout: fetch-depth: 0).');
  process.exit(1);
}

const uncommitted = new Set(split(git('diff', '--name-only', '-z', 'HEAD', '--', 'source')));
let count = 0;
for (const file of split(git('ls-files', '-z', '--', 'source'))) {
  if (uncommitted.has(file)) continue;
  const time = Number(git('log', '-1', '--format=%ct', '--', file).trim());
  if (!time) continue;
  fs.utimesSync(file, time, time);
  count++;
}
console.log(`restore-mtime: set ${count} file(s) under source/ to their last commit time`);
