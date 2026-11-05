const { spawnSync } = require('node:child_process');

const result = spawnSync(
  process.execPath,
  ['node_modules/jest/bin/jest.js', '--runInBand', 'test/mapping.e2e.spec.ts'],
  {
    env: { ...process.env, RUN_INTEGRATION_TESTS: 'true' },
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 1);
