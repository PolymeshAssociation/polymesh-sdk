import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { CAId } from 'polymesh-types/types';

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
  RoleType,
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
import { filterEventRecords } from '~/utils/internal';

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
  declarationDate?: Date;
  checkpoint?: Checkpoint | CheckpointSchedule | Date;
  description: string;
  targets?: Omit<CorporateActionTargets, 'identities'> & {
    identities: (string | Identity)[];
  };
  defaultTaxWithholding?: BigNumber;
  taxWithholdings: (Omit<TaxWithholding, 'identity'> & {
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
    taxWithholdings,
  } = args;

  // TODO @monitz87: remove these when they can be fetched from the chain
  const MAX_WITHHOLDING_ENTRIES = 1000;
  const MAX_TARGETS = 1000;

  if (targets && targets.identities.length > MAX_TARGETS) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many target Identities',
      data: {
        maxTargets: MAX_TARGETS,
      },
    });
  }

  if (taxWithholdings.length > MAX_WITHHOLDING_ENTRIES) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many tax withholding entries',
      data: {
        maxWithholdingEntries: MAX_WITHHOLDING_ENTRIES,
      },
    });
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

  const rawTicker = stringToTicker(ticker, context);
  const rawKind = corporateActionKindToCaKind(kind, context);
  const rawDeclDate = dateToMoment(declarationDate, context);
  const rawRecordDate = checkpoint && checkpointToRecordDateSpec(checkpoint, context);
  const rawDetails = stringToText(description, context);
  const rawTargets = targets && targetsToTargetIdentities(targets, context);
  const rawTax = defaultTaxWithholding && percentageToPermill(defaultTaxWithholding, context);
  const rawWithholdings = taxWithholdings.map(({ identity, percentage }) =>
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
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions: [TxTags.corporateAction.InitiateCorporateAction],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const initiateCorporateAction = new Procedure(
  prepareInitiateCorporateAction,
  getAuthorization
);
