import { Context, Entity } from '~/internal';

/**
 * @hidden
 *
 * Represents a namespace within an Entity with the purpose of grouping related functionality
 */
export class Namespace<Parent extends Entity<unknown, unknown>> {
  protected parent: Parent;

  protected context: Context;

  /**
   * @hidden
   */
  constructor(parent: Parent, context: Context) {
    this.parent = parent;
    this.context = context;
  }
}
