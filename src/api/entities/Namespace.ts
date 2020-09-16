import { Entity } from '~/api/entities';
import { Context } from '~/base';

/**
 * @hidden
 *
 * Represents a namespace within an Entity with the purpose of grouping related functionality
 */
export class Namespace<Parent extends Entity<{}>> {
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
