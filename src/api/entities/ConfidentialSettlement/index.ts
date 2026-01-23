import BigNumber from 'bignumber.js';

import {
  ConfidentialSettlementDetails,
  ConfidentialSettlementStatus,
} from '~/api/entities/ConfidentialSettlement/types';
import { Context, Entity, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

export interface UniqueIdentifiers {
  /**
   * The settlement reference (unique identifier)
   */
  id: string;
}

/**
 * Represents a DART Confidential Settlement on the Polymesh blockchain.
 *
 * Confidential Settlements enable privacy-preserving transfers of confidential assets
 * using zero-knowledge proofs. Unlike regular settlements, confidential settlements
 * do not use venues.
 */
export class ConfidentialSettlement extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return typeof id === 'string';
  }

  /**
   * The settlement reference (unique identifier)
   */
  public id: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * @hidden
   * Helper to get the confidentialAssets query module
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getConfidentialAssetsQuery(): any {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidentialAssets = (query as any).confidentialAssets;
    if (!confidentialAssets) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential assets module is not available on this chain',
      });
    }

    return confidentialAssets;
  }

  /**
   * Determine whether this Confidential Settlement exists on chain
   */
  public async exists(): Promise<boolean> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawStatus = await confidentialAssets.settlementState(id);

    return rawStatus.isSome;
  }

  /**
   * Get the current status of this settlement
   *
   * @throws if the settlement does not exist
   */
  public async getStatus(): Promise<ConfidentialSettlementStatus> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawStatus = await confidentialAssets.settlementState(id);

    if (rawStatus.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Settlement does not exist',
      });
    }

    const status = rawStatus.unwrap();

    if (status.isPending) {
      return ConfidentialSettlementStatus.Pending;
    } else if (status.isExecuted) {
      return ConfidentialSettlementStatus.Executed;
    } else if (status.isRejected) {
      return ConfidentialSettlementStatus.Rejected;
    }

    return ConfidentialSettlementStatus.Pending;
  }

  /**
   * Get the memo attached to this settlement (if any)
   */
  public async getMemo(): Promise<string | null> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawMemo = await confidentialAssets.settlementMemo(id);

    if (rawMemo.isNone) {
      return null;
    }

    return rawMemo.unwrap().toString();
  }

  /**
   * Get the number of pending affirmations for this settlement
   */
  public async getPendingAffirmationsCount(): Promise<BigNumber> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawCount = await confidentialAssets.settlementPendingAffirmations(id);

    return new BigNumber(rawCount.toNumber());
  }

  /**
   * Check if this settlement can be executed (all affirmations received)
   */
  public async canExecute(): Promise<boolean> {
    const [status, pendingCount] = await Promise.all([
      this.getStatus(),
      this.getPendingAffirmationsCount(),
    ]);

    return status === ConfidentialSettlementStatus.Pending && pendingCount.isZero();
  }

  /**
   * Get the details of this settlement
   *
   * @throws if the settlement does not exist
   */
  public async details(): Promise<ConfidentialSettlementDetails> {
    const { id } = this;

    const [status, memoResult] = await Promise.all([this.getStatus(), this.getMemo()]);

    const result: ConfidentialSettlementDetails = {
      id: new BigNumber(0), // Settlement ID parsing would need to be implemented based on the ref format
      status,
      createdAt: new BigNumber(0), // Would need to query historical data
      legs: [], // Would need to query settlementLegs storage
    };

    if (memoResult !== null) {
      result.memo = memoResult;
    }

    return result;
  }

  /**
   * Return the Confidential Settlement's ID
   */
  public toHuman(): string {
    return this.id;
  }
}
