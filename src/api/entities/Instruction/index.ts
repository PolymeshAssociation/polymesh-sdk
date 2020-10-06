import BigNumber from 'bignumber.js';

import { Entity, Identity, SecurityToken } from '~/api/entities';
import { Context } from '~/base';
import {
  balanceToBigNumber,
  identityIdToString,
  meshInstructionStatusToInstructionStatus,
  momentToDate,
  numberToU64,
  tickerToString,
  u32ToBigNumber,
} from '~/utils';

import { InstructionDetails, InstructionStatus, InstructionType, Leg } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a trusted claim issuer for a specific token in the Polymesh blockchain
 */
export class Instruction extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Identifier number of the venue
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Retrieve information specific to this Instruction
   */
  public async details(): Promise<InstructionDetails> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const {
      status,
      created_at: createdAt,
      valid_from: validFrom,
      settlement_type: type,
    } = await settlement.instructionDetails(numberToU64(id, context));

    const details = {
      status: meshInstructionStatusToInstructionStatus(status),
      createdAt: momentToDate(createdAt.unwrap()), // NOTE @monitz87: I'm pretty sure this can't be null, but I'll ask
      validFrom: validFrom.isSome ? momentToDate(validFrom.unwrap()) : null,
    };

    if (type.isSettleOnAuthorization) {
      return {
        ...details,
        type: InstructionType.SettleOnAuthorization,
      };
    }

    return {
      ...details,
      type: InstructionType.SettleOnBlock,
      endBlock: u32ToBigNumber(type.asSettleOnBlock),
    };
  }

  /**
   * Retrieve all legs of this Instruction
   */
  public async getLegs(): Promise<Leg[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const legs = await settlement.instructionLegs.entries(numberToU64(id, context));

    return legs.map(([, leg]) => {
      const { from, to, amount, asset } = leg;

      const ticker = tickerToString(asset);
      const fromDid = identityIdToString(from.did);
      const toDid = identityIdToString(to.did);

      return {
        from: new Identity({ did: fromDid }, context),
        to: new Identity({ did: toDid }, context),
        amount: balanceToBigNumber(amount),
        token: new SecurityToken({ ticker }, context),
      };
    });
  }

  /**
   * Retrieve the current status of this Instruction
   */
  public async getStatus(): Promise<InstructionStatus> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      id,
      context,
    } = this;

    const { status } = await settlement.instructionDetails(numberToU64(id, context));

    return meshInstructionStatusToInstructionStatus(status);
  }
}
