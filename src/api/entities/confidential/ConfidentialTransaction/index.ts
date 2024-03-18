import { Option } from '@polkadot/types';
import { PalletConfidentialAssetTransactionStatus } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { convertSubQueryAssetIdToUuid } from '~/api/entities/confidential/ConfidentialAccount/helpers';
import {
  affirmConfidentialTransactions,
  Context,
  Entity,
  executeConfidentialTransaction,
  Identity,
  PolymeshError,
  rejectConfidentialTransaction,
} from '~/internal';
import { getConfidentialTransactionProofsQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  AffirmConfidentialTransactionParams,
  ConfidentialLeg,
  ConfidentialLegState,
  ConfidentialLegStateWithId,
  ConfidentialTransactionDetails,
  ConfidentialTransactionStatus,
  ErrorCode,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SenderProofs,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  bigNumberToConfidentialTransactionId,
  bigNumberToConfidentialTransactionLegId,
  bigNumberToU32,
  bigNumberToU64,
  confidentialLegIdToId,
  confidentialLegStateToLegState,
  confidentialTransactionLegIdToBigNumber,
  identityIdToString,
  meshConfidentialLegDetailsToDetails,
  meshConfidentialTransactionDetailsToDetails,
  meshConfidentialTransactionStatusToStatus,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a confidential Asset Transaction to be executed on a certain Venue
 */
export class ConfidentialTransaction extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Unique identifier number of the settlement transaction
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;

    this.execute = createProcedureMethod(
      {
        getProcedureAndArgs: () => [executeConfidentialTransaction, { transaction: this }],
        optionalArgs: true,
      },
      context
    );

    this.affirmLeg = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          affirmConfidentialTransactions,
          { transaction: this, ...args },
        ],
      },
      context
    );

    this.reject = createProcedureMethod(
      {
        getProcedureAndArgs: () => [rejectConfidentialTransaction, { transaction: this }],
        optionalArgs: true,
      },
      context
    );
  }

  /**
   * Fetch details about this transaction
   */
  public async details(): Promise<ConfidentialTransactionDetails> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToU64(id, context);

    const [rawDetails, rawStatus] = await Promise.all([
      confidentialAsset.transactions(rawId),
      confidentialAsset.transactionStatuses(rawId),
    ]);

    if (rawDetails.isNone || rawStatus.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential transaction details were not found',
        data: { id },
      });
    }

    const details = meshConfidentialTransactionDetailsToDetails(rawDetails.unwrap());
    const status = meshConfidentialTransactionStatusToStatus(rawStatus.unwrap());

    return {
      ...details,
      status,
    };
  }

  /**
   * Retrieve current status of the ConfidentialTransaction. This can be subscribed to know if transaction fails
   *
   * @note can be subscribed to
   */
  public async onStatusChange(
    callback: SubCallback<ConfidentialTransactionStatus>
  ): Promise<UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
      context,
    } = this;

    const assembleResult = (
      rawStatus: Option<PalletConfidentialAssetTransactionStatus>
    ): ConfidentialTransactionStatus => {
      if (rawStatus.isNone) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'The status of the transaction was not found',
        });
      }

      return meshConfidentialTransactionStatusToStatus(rawStatus.unwrap());
    };

    return confidentialAsset.transactionStatuses(bigNumberToU64(id, context), status => {
      return callback(assembleResult(status));
    });
  }

  /**
   * Returns the identities involved in this transaction
   *
   * @throws if the transaction has been completed
   */
  public async getInvolvedParties(): Promise<Identity[]> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToU64(id, context);

    const rawDids = await confidentialAsset.transactionParties.entries(rawId);

    if (rawDids.length === 0) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'No involved parties were found for this transaction. Its likely been completed and the chain storage has been pruned',
        data: { id },
      });
    }

    return rawDids.map(([key]) => {
      const rawDid = key.args[1];
      const did = identityIdToString(rawDid);

      return new Identity({ did }, context);
    });
  }

  /**
   * Get number of pending affirmations for this transaction
   */
  public async getPendingAffirmsCount(): Promise<BigNumber> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToU32(id, context);
    const rawAffirmCount = await confidentialAsset.pendingAffirms(rawId);

    if (rawAffirmCount.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Affirm count not available. The transaction has likely been completed and pruned',
        data: { confidentialTransactionId: id },
      });
    }

    return u32ToBigNumber(rawAffirmCount.unwrap());
  }

  /**
   * Determine whether this settlement Transaction exists on chain (or existed and was pruned)
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
    } = this;

    if (id.lte(new BigNumber(0))) {
      return false;
    }

    const transactionCounter = await confidentialAsset.transactionCounter();

    return id.lte(u64ToBigNumber(transactionCounter.unwrap()));
  }

  /**
   * Get the legs of this Confidential Transaction
   */
  public async getLegs(): Promise<ConfidentialLeg[]> {
    const {
      context,
      id,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToU64(id, context);

    const rawLegs = await confidentialAsset.transactionLegs.entries(rawId);

    const legs = rawLegs.map(([key, detailsOpt]) => {
      const rawLegId = key.args[1];
      const legId = confidentialLegIdToId(rawLegId);

      if (detailsOpt.isNone) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'There were no details for a confidential transaction leg',
          data: {
            transactionId: id,
            legId: rawLegId,
          },
        });
      }

      const legDetails = meshConfidentialLegDetailsToDetails(detailsOpt.unwrap(), context);

      return {
        id: legId,
        ...legDetails,
      };
    });

    return legs;
  }

  /**
   * Get the leg states for the transaction
   */
  public async getLegStates(): Promise<ConfidentialLegStateWithId[]> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToConfidentialTransactionId(id, context);

    const rawLegStates = await confidentialAsset.txLegStates.entries(rawId);

    return rawLegStates.map(([key, rawLegState]) => {
      const rawLegId = key.args[1];
      const legId = confidentialTransactionLegIdToBigNumber(rawLegId);
      const state = confidentialLegStateToLegState(rawLegState, context);

      return {
        legId,
        ...state,
      };
    });
  }

  /**
   * Get the leg state for the given legId
   */
  public async getLegState(legId: BigNumber): Promise<ConfidentialLegState> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToConfidentialTransactionId(id, context);
    const rawLegId = bigNumberToConfidentialTransactionLegId(legId, context);

    const rawLegState = await confidentialAsset.txLegStates(rawId, rawLegId);

    return confidentialLegStateToLegState(rawLegState, context);
  }

  /**
   * Get all submitted sender proofs for this transaction
   *
   * @note uses the middlewareV2
   */
  public async getSenderProofs(): Promise<SenderProofs[]> {
    const { context } = this;
    const {
      data: {
        confidentialTransactionAffirmations: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'confidentialTransactionAffirmations'>>(
      getConfidentialTransactionProofsQuery(this.id)
    );

    return nodes.map(({ proofs: sqProofs, legId: sqLegId }) => {
      const legId = new BigNumber(sqLegId);

      const proofs = sqProofs.map(({ assetId, proof }: { assetId: string; proof: string }) => ({
        assetId: convertSubQueryAssetIdToUuid(assetId),
        proof,
      }));

      return {
        proofs,
        legId,
      };
    });
  }

  /**
   * Executes this transaction
   *
   * @note - The transaction can only be executed if all the involved parties have already affirmed the transaction
   */
  public execute: NoArgsProcedureMethod<ConfidentialTransaction>;

  /**
   * Affirms a leg of this transaction
   *
   * @note - The sender must provide their affirmation before anyone else can. (Sender affirmation is where amounts are specified)
   */
  public affirmLeg: ProcedureMethod<AffirmConfidentialTransactionParams, ConfidentialTransaction>;

  /**
   * Rejects this transaction
   */
  public reject: NoArgsProcedureMethod<ConfidentialTransaction>;

  /**
   * Return the settlement Transaction's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
