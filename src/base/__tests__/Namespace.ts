import { Context, Entity, Namespace } from '~/base';

describe('Namespace class', () => {
  describe('constructor', () => {
    test('should assign parent and context to instance', () => {
      const context = ('context' as unknown) as Context;
      const parent = ('entity' as unknown) as Entity<{}>;
      const namespace = new Namespace(parent, context);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect((namespace as any).parent).toEqual(parent);
      expect((namespace as any).context).toEqual(context);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });
  });
});
