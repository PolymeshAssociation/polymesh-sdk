import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';

import { CorporateActionKind, CorporateActionTargets, TaxWithholding } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface Params {
  kind: CorporateActionKind;
  declarationDate: Date;
  description: string;
  targets: CorporateActionTargets;
  defaultTaxWithholding: BigNumber;
  taxWithholdings: TaxWithholding[];
}

/**
 * Represents an action initiated by the issuer of a Security Token which may affect the positions of
 *   the Tokenholders
 */
export class CorporateAction extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * internal Corporate Action ID
   */
  public id: BigNumber;

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * date at which the Corporate Action was created
   */
  public declarationDate: Date;

  /**
   * brief text description of the Corporate Action
   */
  public description: string;

  /**
   * tokenholder identities related to this Corporate action. If the treatment is `Exclude`, the identities
   *   are not targeted by the Action, and any identities left out of the array will be targeted, and vice versa
   */
  public targets: CorporateActionTargets;

  /**
   * default percentage of tax withholding for this Corporate Action
   */
  public defaultTaxWithholding: BigNumber;

  /**
   * percentage of tax withholding per Identity. Any Identity not present
   *   in this array uses the default tax withholding percentage
   */
  public taxWithholdings: TaxWithholding[];

  protected kind: CorporateActionKind;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const {
      kind,
      declarationDate,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
      ...identifiers
    } = args;

    super(identifiers, context);

    const { id, ticker } = identifiers;

    this.id = id;
    this.ticker = ticker;
    this.kind = kind;
    this.declarationDate = declarationDate;
    this.description = description;
    this.targets = targets;
    this.defaultTaxWithholding = defaultTaxWithholding;
    this.taxWithholdings = taxWithholdings;
  }
}
