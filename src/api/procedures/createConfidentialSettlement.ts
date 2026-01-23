import { ISubmittableResult } from '@polkadot/types/types';

import { ConfidentialSettlement } from '~/api/entities/ConfidentialSettlement';
import { CreateConfidentialSettlementParams } from '~/api/entities/ConfidentialSettlement/types';
import { Context, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export const createCreateConfidentialSettlementResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialSettlement => {
    // Find the SettlementCreated event in the receipt
    const events = receipt.filterRecords('confidentialAssets', 'SettlementCreated');

    if (events.length === 0) {
      throw new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'Failed to find SettlementCreated event in transaction receipt',
      });
    }

    const { data } = events[0]!.event;
    // The settlement reference is expected to be in the event data (index 1)
    const id = data[1]!.toString();

    return new ConfidentialSettlement({ id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateConfidentialSettlement(
  this: Procedure<CreateConfidentialSettlementParams, ConfidentialSettlement>,
  args: CreateConfidentialSettlementParams
): Promise<
  TransactionSpec<ConfidentialSettlement, ExtrinsicParams<'confidentialAssets', 'createSettlement'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { proof } = args;

  if (!proof) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A valid settlement proof is required',
    });
  }

  // The proof is a serialized SettlementProof from the DART WASM library
  // It needs to be passed as-is to the chain for verification
  const rawProof = proof;

  return {
    transaction: tx.confidentialAssets.createSettlement,
    args: [rawProof],
    resolver: createCreateConfidentialSettlementResolver(context),
  };
}

/**
 * @hidden
 */
export const createConfidentialSettlement = (): Procedure<
  CreateConfidentialSettlementParams,
  ConfidentialSettlement
> =>
  new Procedure(prepareCreateConfidentialSettlement, {
    permissions: {
      transactions: [TxTags.confidentialAssets.CreateSettlement],
      assets: [],
      portfolios: [],
    },
  });
