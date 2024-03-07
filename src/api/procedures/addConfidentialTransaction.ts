import { u64 } from '@polkadot/types';
import {
  PalletConfidentialAssetTransactionLeg,
  PolymeshPrimitivesMemo,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  assertConfidentialAccountExists,
  assertConfidentialAssetExists,
  assertConfidentialAssetsEnabledForVenue,
  assertConfidentialVenueExists,
  assertIdentityExists,
} from '~/api/procedures/utils';
import { ConfidentialTransaction, Context, PolymeshError, Procedure } from '~/internal';
import {
  AddConfidentialTransactionParams,
  AddConfidentialTransactionsParams,
  ConfidentialAssetTx,
  ErrorCode,
  RoleType,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { MAX_LEGS_LENGTH } from '~/utils/constants';
import {
  auditorsToBtreeSet,
  bigNumberToU64,
  confidentialAccountToMeshPublicKey,
  confidentialAssetsToBtreeSet,
  confidentialLegToMeshLeg,
  confidentialTransactionIdToBigNumber,
  identitiesToBtreeSet,
  stringToMemo,
} from '~/utils/conversion';
import {
  asConfidentialAccount,
  asConfidentialAsset,
  asIdentity,
  assembleBatchTransactions,
  filterEventRecords,
  optionize,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = AddConfidentialTransactionsParams & {
  venueId: BigNumber;
};

/**
 * @hidden
 */
type InternalAddTransactionParams = [
  u64, // venueID
  PalletConfidentialAssetTransactionLeg[],
  PolymeshPrimitivesMemo | null
][];

/**
 * @hidden
 */
export const createConfidentialTransactionResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialTransaction[] => {
    const events = filterEventRecords(receipt, 'confidentialAsset', 'TransactionCreated');

    const result = events.map(
      ({ data }) =>
        new ConfidentialTransaction({ id: confidentialTransactionIdToBigNumber(data[2]) }, context)
    );

    return result;
  };

/**
 * @hidden
 */
async function getTxArgsAndErrors(
  transactions: AddConfidentialTransactionParams[],
  venueId: BigNumber,
  context: Context
): Promise<{
  errIndexes: {
    legEmptyErrIndexes: number[];
    legLengthErrIndexes: number[];
    sameIdentityErrIndexes: number[];
    noAssetsErrIndexes: number[];
  };
  addTransactionParams: InternalAddTransactionParams;
}> {
  const addTransactionParams: InternalAddTransactionParams = [];

  const legEmptyErrIndexes: number[] = [];
  const legLengthErrIndexes: number[] = [];
  const legAmountErrIndexes: number[] = [];
  const sameIdentityErrIndexes: number[] = [];
  const noAssetsErrIndexes: number[] = [];

  for (const [i, transaction] of transactions.entries()) {
    const { legs, memo } = transaction;
    if (!legs.length) {
      legEmptyErrIndexes.push(i);
    }

    if (legs.length > MAX_LEGS_LENGTH) {
      legLengthErrIndexes.push(i);
    }

    const sameIdentityLegs = legs.filter(({ sender, receiver }) => {
      return sender === receiver;
    });

    if (sameIdentityLegs.length) {
      sameIdentityErrIndexes.push(i);
    }

    const noAssetsLegs = legs.filter(({ assets }) => assets.length === 0);

    if (noAssetsLegs.length) {
      noAssetsErrIndexes.push(i);
    }

    if (
      !legEmptyErrIndexes.length &&
      !legLengthErrIndexes.length &&
      !legAmountErrIndexes.length &&
      !sameIdentityErrIndexes.length
    ) {
      const rawVenueId = bigNumberToU64(venueId, context);
      const rawLegs: PalletConfidentialAssetTransactionLeg[] = [];
      const rawInstructionMemo = optionize(stringToMemo)(memo, context);

      await Promise.all([
        ...legs.map(
          async ({
            sender: inputSender,
            receiver: inputReceiver,
            assets: inputAssets,
            auditors: inputAuditors,
            mediators: inputMediators,
          }) => {
            const assets = inputAssets.map(asset => asConfidentialAsset(asset, context));
            const sender = asConfidentialAccount(inputSender, context);
            const receiver = asConfidentialAccount(inputReceiver, context);
            const auditors = inputAuditors.map(auditor => asConfidentialAccount(auditor, context));
            const mediators = inputMediators.map(mediator => asIdentity(mediator, context));

            await Promise.all([
              assertConfidentialAssetsEnabledForVenue(venueId, assets),
              assertConfidentialAccountExists(sender),
              assertConfidentialAccountExists(receiver),
              ...assets.map(asset => assertConfidentialAssetExists(asset, context)),
              ...mediators.map(mediator => assertIdentityExists(mediator)),
            ]);

            const rawSender = confidentialAccountToMeshPublicKey(sender, context);
            const rawReceiver = confidentialAccountToMeshPublicKey(receiver, context);
            const rawAuditors = auditorsToBtreeSet(auditors, context);
            const rawMediators = identitiesToBtreeSet(mediators, context);
            const rawAssets = confidentialAssetsToBtreeSet(assets, context);

            const rawLeg = confidentialLegToMeshLeg(
              {
                sender: rawSender,
                receiver: rawReceiver,
                auditors: rawAuditors,
                mediators: rawMediators,
                assets: rawAssets,
              },
              context
            );

            rawLegs.push(rawLeg);
          }
        ),
      ]);

      addTransactionParams.push([rawVenueId, rawLegs, rawInstructionMemo]);
    }
  }

  return {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      sameIdentityErrIndexes,
      noAssetsErrIndexes,
    },
    addTransactionParams,
  };
}

/**
 * @hidden
 */
export async function prepareAddTransaction(
  this: Procedure<Params, ConfidentialTransaction[]>,
  args: Params
): Promise<BatchTransactionSpec<ConfidentialTransaction[], unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  const { transactions, venueId } = args;

  await assertConfidentialVenueExists(venueId, context);

  if (transactions.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The transactions array cannot be empty',
    });
  }

  const {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      sameIdentityErrIndexes,
      noAssetsErrIndexes,
    },
    addTransactionParams,
  } = await getTxArgsAndErrors(transactions, venueId, context);

  if (legEmptyErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
      data: {
        failedTransactionIndexes: legEmptyErrIndexes,
      },
    });
  }

  if (legLengthErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'The legs array exceeds the maximum allowed length',
      data: {
        maxLength: MAX_LEGS_LENGTH,
        failedInstructionIndexes: legLengthErrIndexes,
      },
    });
  }

  if (sameIdentityErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Transaction leg cannot transfer Assets between the same account',
      data: {
        failedTransactionIndexes: sameIdentityErrIndexes,
      },
    });
  }

  if (noAssetsErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Transaction legs must contain at least one Asset',
      data: {
        failedTransactionIndexes: noAssetsErrIndexes,
      },
    });
  }

  const assembledTransactions = assembleBatchTransactions([
    {
      transaction: confidentialAsset.addTransaction,
      argsArray: addTransactionParams,
    },
  ] as const);

  return {
    transactions: assembledTransactions,
    resolver: createConfidentialTransactionResolver(context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, ConfidentialTransaction[]>,
  { venueId }: Params
): Promise<ProcedureAuthorization> {
  return {
    roles: [{ type: RoleType.ConfidentialVenueOwner, venueId }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [ConfidentialAssetTx.AddTransaction],
    },
  };
}

/**
 * @hidden
 */
export const addConfidentialTransaction = (): Procedure<Params, ConfidentialTransaction[]> =>
  new Procedure(prepareAddTransaction, getAuthorization);
