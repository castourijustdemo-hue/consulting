import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const children = [
  spawn(process.execPath, [
    resolve(root, 'node_modules/@angular/cli/bin/ng.js'),
    'serve',
    '--proxy-config',
    'proxy.conf.json'
  ], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [
    '--import',
    'tsx',
    'scripts/local-api.ts'
  ], { cwd: root, stdio: 'inherit' })
];

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

for (const child of children) {
  child.on('error', error => {
    console.error('Could not start a local development process.', error);
    stop(1);
  });
  child.on('exit', code => {
    if (!stopping) stop(code ?? 1);
  });
}

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
