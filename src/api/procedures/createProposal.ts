import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PipId, TxTag } from 'polymesh-types/types';

import { Proposal } from '~/api/entities';
import { PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { Context } from '~/context';
import { ErrorCode, Role, TransactionArgumentType } from '~/types';
import {
  balanceToBigNumber,
  findEventRecord,
  numberToBalance,
  stringToText,
  u32ToBigNumber,
} from '~/utils';

export interface CreateProposalParams {
  description?: string;
  discussionUrl?: string;
  bondAmount: BigNumber;
  tag: TxTag;
  args: unknown[];
}

/**
 * @hidden
 */
export const createProposalResolver = (context: Context) => (
  receipt: ISubmittableResult
): Proposal => {
  const eventRecord = findEventRecord(receipt, 'pips', 'ProposalCreated');
  const data = eventRecord.event.data;
  const pipId = u32ToBigNumber(data[2] as PipId);

  return new Proposal({ pipId: pipId.toNumber() }, context);
};

/**
 * @hidden
 */
export async function prepareCreateProposal(
  this: Procedure<CreateProposalParams, Proposal>,
  args: CreateProposalParams
): Promise<PostTransactionValue<Proposal>> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { pips },
      },
    },
    context,
  } = this;
  const { description, discussionUrl, bondAmount, tag, args: transactionArguments } = args;
  const [mod, transaction] = tag.split('.');

  const argumentTypes = context.getTransactionArguments({ tag });
  const convertedArguments = transactionArguments.map((arg, index) => {
    const argType = argumentTypes[index];

    if (argType.type === TransactionArgumentType.Balance) {
      return numberToBalance(arg as number, context);
    }

    return arg;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = ((tx as any)[mod][transaction](...convertedArguments) as SubmittableExtrinsic<
    'promise'
  >).method;

  const [rawMinBond, { free: freeBalance }] = await Promise.all([
    pips.minimumProposalDeposit(),
    context.accountBalance(),
  ]);

  const minBond = balanceToBigNumber(rawMinBond);

  if (freeBalance.lt(bondAmount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient free balance',
      data: {
        freeBalance,
      },
    });
  }

  if (bondAmount.lt(minBond)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Bonded amount must exceed the minimum',
      data: {
        minBond,
      },
    });
  }

  const [proposal] = this.addTransaction(
    tx.pips.propose,
    {
      resolvers: [createProposalResolver(context)],
    },
    call,
    numberToBalance(bondAmount, context),
    discussionUrl ? stringToText(discussionUrl, context) : null,
    description ? stringToText(description, context) : null,
    null // not using beneficiaries for the time being
  );

  return proposal;
}

/**
 * @hidden
 */
export function getRequiredRoles(): Role[] {
  return [];
}

export const createProposal = new Procedure(prepareCreateProposal, getRequiredRoles);
