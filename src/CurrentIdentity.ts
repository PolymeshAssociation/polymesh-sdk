import { Context } from '~/internal';

/**
 * Handles functionality related to the Current Identity
 */
export class CurrentIdentity {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;
  }
}
