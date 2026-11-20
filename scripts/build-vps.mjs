import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  SITE_ORIGIN: process.env.SITE_ORIGIN || 'http://vps-5341.onecom-cloud.one:1423',
  BASE_PATH: '/',
};

const { status } = spawnSync('astro', ['build'], { env, stdio: 'inherit', shell: true });
process.exit(status ?? 1);
