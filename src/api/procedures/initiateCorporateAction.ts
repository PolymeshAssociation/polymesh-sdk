import { PalletCorporateActionsCaId } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  assertCaCheckpointValid,
  assertCaTargetsValid,
  assertCaTaxWithholdingsValid,
} from '~/api/procedures/utils';
import { Asset, PolymeshError, PostTransactionValue, Procedure } from '~/internal';
import {
  CorporateActionKind,
  ErrorCode,
  InputCaCheckpoint,
  InputCorporateActionTargets,
  InputCorporateActionTaxWithholdings,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  checkpointToRecordDateSpec,
  corporateActionKindToCaKind,
  dateToMoment,
  percentageToPermill,
  signerToString,
  stringToBytes,
  stringToIdentityId,
  stringToTicker,
  targetsToTargetIdentities,
  u32ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, getCheckpointValue, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export const createCaIdResolver =
  () =>
  (receipt: ISubmittableResult): PalletCorporateActionsCaId => {
    const [{ data }] = filterEventRecords(receipt, 'corporateAction', 'CAInitiated');

    return data[1];
  };

/**
 * @hidden
 */
export interface InitiateCorporateActionParams {
  kind: CorporateActionKind;
  /**
   * date at which the issuer publicly declared the Corporate Action. Optional, defaults to the current date
   */
  declarationDate?: Date;
  /**
   * checkpoint to be used for share-related calculations. If a Schedule is passed, the next Checkpoint it creates will be used
   */
  checkpoint?: InputCaCheckpoint;
  description: string;
  /**
   * Asset Holder Identities to be included (or excluded) from the Corporate Action. Inclusion/exclusion is controlled by the `treatment`
   *   property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
   *   the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Corporate Action
   */
  targets?: InputCorporateActionTargets;
  /**
   * default percentage (0-100) of the Benefits to be held for tax purposes
   */
  defaultTaxWithholding?: BigNumber;
  /**
   * percentage (0-100) of the Benefits to be held for tax purposes from individual Asset Holder Identities.
   *   This overrides the value of `defaultTaxWithholding`
   */
  taxWithholdings?: InputCorporateActionTaxWithholdings;
}

export type Params = InitiateCorporateActionParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareInitiateCorporateAction(
  this: Procedure<Params, PalletCorporateActionsCaId>,
  args: Params
): Promise<PostTransactionValue<PalletCorporateActionsCaId>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;
  const {
    ticker,
    kind,
    declarationDate = new Date(),
    checkpoint = null,
    description,
    targets = null,
    defaultTaxWithholding = null,
    taxWithholdings = null,
  } = args;

  if (targets) {
    assertCaTargetsValid(targets, context);
  }
  if (taxWithholdings) {
    assertCaTaxWithholdingsValid(taxWithholdings, context);
  }

  if (declarationDate > new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Declaration date must be in the past',
    });
  }

  const rawMaxDetailsLength = await query.corporateAction.maxDetailsLength();
  const maxDetailsLength = u32ToBigNumber(rawMaxDetailsLength);

  if (maxDetailsLength.lt(description.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Description too long',
      data: {
        maxLength: maxDetailsLength.toNumber(),
      },
    });
  }

  let checkpointValue;
  if (checkpoint) {
    checkpointValue = await getCheckpointValue(checkpoint, ticker, context);
    await assertCaCheckpointValid(checkpointValue);
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawKind = corporateActionKindToCaKind(kind, context);
  const rawDeclDate = dateToMoment(declarationDate, context);
  const rawRecordDate = optionize(checkpointToRecordDateSpec)(checkpointValue, context);
  const rawDetails = stringToBytes(description, context);
  const rawTargets = optionize(targetsToTargetIdentities)(targets, context);
  const rawTax = optionize(percentageToPermill)(defaultTaxWithholding, context);
  const rawWithholdings =
    taxWithholdings &&
    taxWithholdings.map(({ identity, percentage }) =>
      tuple(
        stringToIdentityId(signerToString(identity), context),
        percentageToPermill(percentage, context)
      )
    );

  const [caId] = this.addTransaction({
    transaction: tx.corporateAction.initiateCorporateAction,
    resolvers: [createCaIdResolver()],
    args: [
      rawTicker,
      rawKind,
      rawDeclDate,
      rawRecordDate,
      rawDetails,
      rawTargets,
      rawTax,
      rawWithholdings,
    ],
  });

  return caId;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, PalletCorporateActionsCaId>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.InitiateCorporateAction],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const initiateCorporateAction = (): Procedure<Params, PalletCorporateActionsCaId> =>
  new Procedure(prepareInitiateCorporateAction, getAuthorization);
