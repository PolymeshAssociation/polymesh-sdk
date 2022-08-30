import P from 'bluebird';
import { range } from 'lodash';

/**
 * @hidden
 *
 * @note the multiple awaits are because of Bluebird internally awaiting many promises,
 *   and hence we need to await a lot of them to assure our tests return control to the tested functions
 */
export async function fakePromise(n = 4): Promise<void> {
  for (let i = 0; i < n; i += 1) {
    await new Promise(resolve => setImmediate(() => resolve(null)));
  }
}

/**
 * @hidden
 *
 * Awaits multiple promises and advances jest time after each one
 */
export async function fakePromises(): Promise<void> {
  await P.each(range(6), async () => {
    await fakePromise();

    jest.advanceTimersByTime(2000);
  });
}
