import {
  AddPercentageTransferRestrictionParams,
  addTransferRestriction,
  AddTransferRestrictionParams,
  Context,
  Namespace,
  SecurityToken,
} from '~/internal';
import { ProcedureMethod, TransferRestrictionType } from '~/types/internal';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Percentage Transfer Restriction related functionality
 */
export class Percentage extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.addRestriction = createProcedureMethod<
      Omit<AddPercentageTransferRestrictionParams, 'type'>,
      AddTransferRestrictionParams,
      number
    >(
      args => [
        addTransferRestriction,
        { ...args, type: TransferRestrictionType.Percentage, ticker },
      ],
      context
    );
  }

  /**
   * Add a Percentage Transfer Restriction to this Security Token
   *
   * @param args.percentage - limit on the percentage of the total supply of this Security Token that a single (unique) investor can hold at once
   * @param args.exempted - array of Scope IDs that are exempted from the Restriction
   *
   * * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction: ProcedureMethod<
    Omit<AddPercentageTransferRestrictionParams, 'type'>,
    number
  >;
}
