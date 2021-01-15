import {
  AddCountTransferRestrictionParams,
  addTransferRestriction,
  AddTransferRestrictionParams,
  Context,
  Namespace,
  SecurityToken,
} from '~/internal';
import { ProcedureMethod, TransferRestrictionType } from '~/types/internal';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Count Transfer Restriction related functionality
 */
export class Count extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.addRestriction = createProcedureMethod<
      Omit<AddCountTransferRestrictionParams, 'type'>,
      AddTransferRestrictionParams,
      number
    >(
      args => [addTransferRestriction, { ...args, type: TransferRestrictionType.Count, ticker }],
      context
    );
  }

  /**
   * Add a Count Transfer Restriction to this Security Token
   *
   * @param args.count - limit on the amount of different (unique) investors that can hold this Security Token at once
   * @param args.exempted - array of Scope IDs that are exempted from the Restriction
   *
   * @note the result is the total amount of restrictions after the procedure has run
   */
  public addRestriction: ProcedureMethod<Omit<AddCountTransferRestrictionParams, 'type'>, number>;
}
