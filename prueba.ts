import { Polymesh } from './src/Polymesh';

// eslint-disable-next-line require-jsdoc
async function main(): Promise<void> {
  const api = await Polymesh.connect({
    nodeUrl: 'wss://pme.polymath.network',
    accountSeed: 'Alice'.padEnd(32, ' '),
  });
  const balance = await api.getPolyBalance();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
