import { ISubmittableResult } from '@polkadot/types/types';

import { RegisterConfidentialAccountsParams } from '~/api/client/ConfidentialAccounts';
import { ConfidentialAccount } from '~/api/entities/ConfidentialAccount';
import { Context, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export const createRegisterConfidentialAccountsResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialAccount[] => {
    // Find the AccountCreated events in the receipt
    const events = receipt.filterRecords('confidentialAssets', 'AccountCreated');

    if (events.length === 0) {
      throw new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'Failed to find AccountCreated events in transaction receipt',
      });
    }

    return events.map(event => {
      const { data } = event.event;
      // The account public key is expected to be in the event data (index 1)
      const publicKey = data[1]!.toString();
      return new ConfidentialAccount({ publicKey }, context);
    });
  };

/**
 * @hidden
 */
export async function prepareRegisterConfidentialAccounts(
  this: Procedure<RegisterConfidentialAccountsParams, ConfidentialAccount[]>,
  args: RegisterConfidentialAccountsParams
): Promise<
  TransactionSpec<ConfidentialAccount[], ExtrinsicParams<'confidentialAssets', 'registerAccounts'>>
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
      message: 'A valid registration proof is required',
    });
  }

  // The proof is a serialized AccountRegistrationProof from the DART WASM library
  // It needs to be passed as-is to the chain for verification
  const rawProof = proof;

  return {
    transaction: tx.confidentialAssets.registerAccounts,
    args: [rawProof],
    resolver: createRegisterConfidentialAccountsResolver(context),
  };
}

/**
 * @hidden
 */
export const registerConfidentialAccounts = (): Procedure<
  RegisterConfidentialAccountsParams,
  ConfidentialAccount[]
> =>
  new Procedure(prepareRegisterConfidentialAccounts, {
    permissions: {
      transactions: [TxTags.confidentialAssets.RegisterAccounts],
      assets: [],
      portfolios: [],
    },
  });
