/**
 * @hidden
 *
 * @note the multiple awaits are because of Bluebird internally awaiting many promises,
 *   and hence we need to await a lot of them to assure our tests return control to the tested functions
 */
export async function fakePromise(): Promise<void> {
  await new Promise(resolve => setImmediate(() => resolve(null)));
  await new Promise(resolve => setImmediate(() => resolve(null)));
  await new Promise(resolve => setImmediate(() => resolve(null)));
  await new Promise(resolve => setImmediate(() => resolve(null)));
}
