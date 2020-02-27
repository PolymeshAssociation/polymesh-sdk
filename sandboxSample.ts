import { Polymesh } from './src/Polymesh';

/**
 * Polymesh SDK connection
 */
async function run(): Promise<void> {
  await Polymesh.connect({
    nodeUrl: 'ws://78.47.38.110:9944',
  });
}

run();
