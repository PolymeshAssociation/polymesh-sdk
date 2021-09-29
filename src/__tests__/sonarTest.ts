import { firstElement } from '~/sonarTest';

describe('firstElement', () => {
  test('should return the first element', () => {
    expect(firstElement()).toBe(1);
  });
});
