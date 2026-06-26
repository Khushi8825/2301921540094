import { Log } from '../src/middleware/logger.js';

async function runExamples() {
  console.log('--- Valid backend log ---');
  const r1 = await Log('backend', 'error', 'handler', 'received string, expected bool');
  console.log(r1);

  console.log('\n--- Valid frontend log ---');
  const r2 = await Log('frontend', 'info', 'component', 'component mounted successfully');
  console.log(r2);

  console.log('\n--- Shared package (works on both stacks) ---');
  const r3 = await Log('backend', 'warn', 'utils', 'deprecated function called');
  console.log(r3);

  console.log('\n--- Invalid: wrong package for stack ---');
  const r4 = await Log('backend', 'debug', 'component', 'this should fail validation');
  console.log(r4);

  console.log('\n--- Invalid: bad level ---');
  const r5 = await Log('frontend', 'verbose', 'page', 'this level does not exist');
  console.log(r5);
}

runExamples();