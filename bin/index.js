#!/usr/bin/env node

import semver from 'semver';
import chalk from 'chalk';

const REQUIRED_NODE_VERSION = '>=18.0.0';

if (!semver.satisfies(process.version, REQUIRED_NODE_VERSION)) {
  console.error(
    chalk.red(
      `\nError: create-aios requires Node.js ${REQUIRED_NODE_VERSION}.\n` +
      `You are running ${process.version}.\n` +
      `Please upgrade Node.js and try again.\n`
    )
  );
  process.exit(1);
}

try {
  const { run } = await import('../lib/cli.js');
  await run();
} catch (error) {
  console.error(chalk.red('\nUnexpected error:'), error.message);

  if (process.env.DEBUG) {
    console.error(error.stack);
  }

  process.exit(1);
}
