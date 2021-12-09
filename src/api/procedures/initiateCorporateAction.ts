import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { CAId } from 'polymesh-types/types';

import {
  assertCaCheckpointValid,
  assertCaTargetsValid,
  assertCaTaxWithholdingsValid,
} from '~/api/procedures/utils';
import {
  Checkpoint,
  CheckpointSchedule,
  PolymeshError,
  PostTransactionValue,
  Procedure,
  SecurityToken,
} from '~/internal';
import {
  CorporateActionKind,
  CorporateActionTargets,
  ErrorCode,
  Identity,
  TaxWithholding,
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
  stringToIdentityId,
  stringToText,
  stringToTicker,
  targetsToTargetIdentities,
  u32ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export const createCaIdResolver = () => (receipt: ISubmittableResult): CAId => {
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
  checkpoint?: Checkpoint | CheckpointSchedule | Date;
  description: string;
  /**
   * tokenholder identities to be included (or excluded) from the Corporate Action. Inclusion/exclusion is controlled by the `treatment`
   *   property. When the value is `Include`, all tokenholders not present in the array are excluded, and vice-versa
   */
  targets?: Omit<CorporateActionTargets, 'identities'> & {
    identities: (string | Identity)[];
  };
  /**
   * default percentage of the Benefits to be held for tax purposes
   */
  defaultTaxWithholding?: BigNumber;
  /**
   * percentage of the Benefits to be held for tax purposes from individual tokenholder Identities.
   *   This overrides the value of `defaultTaxWithholding`
   */
  taxWithholdings?: (Omit<TaxWithholding, 'identity'> & {
    identity: string | Identity;
  })[];
}

export type Params = InitiateCorporateActionParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareInitiateCorporateAction(
  this: Procedure<Params, CAId>,
  args: Params
): Promise<PostTransactionValue<CAId>> {
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

  if (checkpoint) {
    await assertCaCheckpointValid(checkpoint);
  }

  const rawTicker = stringToTicker(ticker, context);
  const rawKind = corporateActionKindToCaKind(kind, context);
  const rawDeclDate = dateToMoment(declarationDate, context);
  const rawRecordDate = optionize(checkpointToRecordDateSpec)(checkpoint, context);
  const rawDetails = stringToText(description, context);
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

  const [caId] = this.addTransaction(
    tx.corporateAction.initiateCorporateAction,
    {
      resolvers: [createCaIdResolver()],
    },
    rawTicker,
    rawKind,
    rawDeclDate,
    rawRecordDate,
    rawDetails,
    rawTargets,
    rawTax,
    rawWithholdings
  );

  return caId;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CAId>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.InitiateCorporateAction],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const initiateCorporateAction = (): Procedure<Params, CAId> =>
  new Procedure(prepareInitiateCorporateAction, getAuthorization);
