import { Context, Portfolio } from '~/internal';

export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents the default Portfolio for an Identity
 */
export class DefaultPortfolio extends Portfolio {
  /**
   * @hidden
   *
   * NOTE: this is necessary to remove `id` from the DefaultPortfolio constructor signature
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super({ ...identifiers, id: undefined }, context);
  }
}
