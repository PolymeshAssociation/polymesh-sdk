import { PalletConfidentialAssetConfidentialMoveFunds } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import { Identity } from '@polymeshassociation/polymesh-sdk/api/entities/Identity';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { identityIdToString } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { filterEventRecords } from '@polymeshassociation/polymesh-sdk/utils/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAccount, Context, PolymeshError } from '~/internal';
import { ConfidentialLegProof, ConfidentialProcedureAuthorization, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import {
  meshProofsToConfidentialLegProof,
  meshPublicKeyToKey,
  serializeAssetMoves,
} from '~/utils/conversion';

export type MoveFundsParams = {
  from: ConfidentialAccount;
  to: ConfidentialAccount;
  proofs: ConfidentialLegProof[];
};

export type MoveFundsArgs = MoveFundsParams | MoveFundsParams[];

export type MoveFundsResolverResult = {
  callerDid: Identity;
  from: ConfidentialAccount;
  to: ConfidentialAccount;
  proofs: ConfidentialLegProof[];
}[];

/**
 * @hidden
 */
export const createMoveFundsResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): MoveFundsResolverResult => {
    const events = filterEventRecords(receipt, 'confidentialAsset', 'FundsMoved');

    const result = events.map(({ data }) => ({
      callerDid: new Identity({ did: identityIdToString(data[0]) }, context),
      from: new ConfidentialAccount({ publicKey: meshPublicKeyToKey(data[1]) }, context),
      to: new ConfidentialAccount({ publicKey: meshPublicKeyToKey(data[2]) }, context),
      proofs: meshProofsToConfidentialLegProof(data[3], context),
    }));

    return result;
  };

/**
 * @hidden
 */
export async function checkArgs(
  args: MoveFundsParams,
  context: Context
): Promise<PalletConfidentialAssetConfidentialMoveFunds> {
  const { from, to, proofs } = args;

  const [senderIdentity, receiverIdentity] = await Promise.all([
    from.getIdentity(),
    to.getIdentity(),
  ]);

  if (!senderIdentity?.exists || !receiverIdentity?.exists) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });
  }

  if (!senderIdentity.isEqual(receiverIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have the same identity',
    });
  }

  return serializeAssetMoves(from, to, proofs, context);
}

/**
 * @hidden
 */
export async function prepareMoveFunds(
  this: ConfidentialProcedure<MoveFundsArgs, MoveFundsResolverResult>,
  args: MoveFundsParams | MoveFundsParams[]
): Promise<
  TransactionSpec<MoveFundsResolverResult, ExtrinsicParams<'confidentialAsset', 'moveAssets'>>
> {
  const params: PalletConfidentialAssetConfidentialMoveFunds[] = [];

  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  if (Array.isArray(args)) {
    const resolvedArgs = await Promise.all(args.map(arg => checkArgs(arg, context)));

    params.push(...resolvedArgs);
  } else {
    const resolvedArgs = await checkArgs(args, context);

    params.push(resolvedArgs);
  }

  return {
    transaction: confidentialAsset.moveAssets,
    args: [params],
    resolver: createMoveFundsResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<MoveFundsArgs, MoveFundsResolverResult>
): ConfidentialProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.confidentialAsset.MoveAssets],
    },
  };
}

/**
 * @hidden
 */
export const moveFunds = (): ConfidentialProcedure<MoveFundsArgs, MoveFundsResolverResult> =>
  new ConfidentialProcedure(prepareMoveFunds, getAuthorization);
