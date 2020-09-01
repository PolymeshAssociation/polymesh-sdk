/**
 * @hidden
 */
export function fakePromise(): Promise<void> {
  return new Promise(resolve => setImmediate(() => resolve()));
}
