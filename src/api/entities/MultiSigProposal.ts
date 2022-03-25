import { BigNumber } from 'bignumber.js';

import { Context, Entity, PolymeshError } from '~/internal';
import { ErrorCode, TxTag } from '~/types';
import { isProposalStatus } from '~/utils';
import { bigNumberToU64, boolToBoolean, momentToDate, u64ToBigNumber } from '~/utils/conversion';
import { assertAddressValid } from '~/utils/internal';

interface UniqueIdentifiers {
  multiSigAddress: string;
  id: BigNumber;
}

export interface HumanReadable {
  multiSigAddress: string;
  id: string;
}

export type ProposalStatus =
  | 'Invalid'
  | 'ActiveOrExpired'
  | 'ExecutionSuccessful'
  | 'ExecutionFailed'
  | 'Rejected';

export interface MultiSigProposalDetails {
  approvals: BigNumber;
  rejections: BigNumber;
  status: ProposalStatus;
  expiry: Date | null;
  autoClose: boolean;
  txTag: TxTag;
  args: unknown[];
}

/**
 * A Proposal for a MultiSig
 */
export class MultiSigProposal extends Entity<UniqueIdentifiers, string> {
  public multiSigAddress: string;
  public id: BigNumber;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);
    const { multiSigAddress, id } = identifiers;
    assertAddressValid(multiSigAddress, context.ss58Format);
    this.multiSigAddress = multiSigAddress;
    this.id = id;
  }

  /**
   * Fetches the details of the Proposal
   */
  public async details(): Promise<MultiSigProposalDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSigAddress,
      id,
      context,
    } = this;
    const u64Id = bigNumberToU64(id, context);
    const [
      {
        approvals: rawApprovals,
        rejections: rawRejections,
        status: rawStatus,
        expiry: rawExpiry,
        auto_close: rawAutoClose,
      },
      proposal,
    ] = await Promise.all([
      multiSig.proposalDetail([multiSigAddress, u64Id]),
      multiSig.proposals([multiSigAddress, u64Id]),
    ]);

    let args, method, section;
    if (proposal.isSome) {
      const value = proposal.unwrap();
      args = value.args;
      method = value.method;
      section = value.section;
    } else {
      throw new Error('proposal was empty');
    }

    const approvals = u64ToBigNumber(rawApprovals);
    const rejections = u64ToBigNumber(rawRejections);
    const expiry = !rawExpiry || rawExpiry.isNone ? null : momentToDate(rawExpiry.unwrap());
    const status = rawStatus.toString();
    if (!isProposalStatus(status))
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Unexpected MultiSigProposal status: "${status}". Try upgrading the SDK to the latest version. Contact the Polymesh team if the problem persists`,
      });
    const autoClose = boolToBoolean(rawAutoClose);

    return {
      approvals,
      rejections,
      status,
      expiry,
      autoClose,
      args,
      txTag: `${section}.${method}` as TxTag,
    };
  }

  /**
   * Determines wether this Proposal exists on chain or not
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSigAddress,
      id,
      context,
    } = this;
    const u64Id = bigNumberToU64(id, context);
    const rawProposal = await multiSig.proposals([multiSigAddress, u64Id]);
    return !rawProposal.isEmpty;
  }

  /**
   * Returns the multiSig address and this Proposal's ID
   */
  public toJson(): string {
    const { multiSigAddress, id } = this;
    return JSON.stringify({
      multiSigAddress,
      id: id.toString(),
    });
  }
}
