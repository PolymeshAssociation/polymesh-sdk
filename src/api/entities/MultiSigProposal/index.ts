import { BigNumber } from 'bignumber.js';

import { Context, Entity, MultiSig, PolymeshError } from '~/internal';
import { ErrorCode, MultiSigProposalDetails, Signer, TxTag } from '~/types';
import {
  bigNumberToU64,
  boolToBoolean,
  meshProposalStatusToProposalStatus,
  momentToDate,
  signatoryToSignerValue,
  signerValueToSigner,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { assertAddressValid, optionize } from '~/utils/internal';

interface UniqueIdentifiers {
  multiSigAddress: string;
  id: BigNumber;
}

export interface HumanReadable {
  multiSigAddress: string;
  id: string;
}

/**
 * A proposal for a MultiSig transaction. This is a wrapper around an extrinsic that will be executed when the amount of approvals reaches the signature threshold set on the MultiSig Account
 */
export class MultiSigProposal extends Entity<UniqueIdentifiers, HumanReadable> {
  public multiSig: MultiSig;
  public id: BigNumber;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { multiSigAddress, id } = identifiers;

    assertAddressValid(multiSigAddress, context.ss58Format);

    this.multiSig = new MultiSig({ address: multiSigAddress }, context);
    this.id = id;
  }

  /**
   * Fetches the details of the Proposal. This includes the amount of approvals and rejections, the expiry, and details of the wrapped extrinsic
   */
  public async details(): Promise<MultiSigProposalDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSig: { address: multiSigAddress },
      id,
      context,
    } = this;

    const rawMultiSignAddress = stringToAccountId(multiSigAddress, context);
    const rawId = bigNumberToU64(id, context);

    const [
      {
        approvals: rawApprovals,
        rejections: rawRejections,
        status: rawStatus,
        expiry: rawExpiry,
        autoClose: rawAutoClose,
      },
      proposal,
    ] = await Promise.all([
      multiSig.proposalDetail(rawMultiSignAddress, rawId),
      multiSig.proposals(rawMultiSignAddress, rawId),
    ]);

    let args, method, section;
    if (proposal.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Proposal with ID: "${id}" was not found. It may have already been executed`,
      });
    } else {
      ({ args, method, section } = proposal.unwrap());
    }

    const approvalAmount = u64ToBigNumber(rawApprovals);
    const rejectionAmount = u64ToBigNumber(rawRejections);
    const expiry = optionize(momentToDate)(rawExpiry.unwrapOr(null));
    const status = meshProposalStatusToProposalStatus(rawStatus, expiry);
    const autoClose = boolToBoolean(rawAutoClose);

    return {
      approvalAmount,
      rejectionAmount,
      status,
      expiry,
      autoClose,
      args: args.map(a => a.toString()),
      txTag: `${section}.${method}` as TxTag,
    };
  }

  /**
   * Determines whether this Proposal exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSig: { address: multiSigAddress },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const rawMultiSignAddress = stringToAccountId(multiSigAddress, context);
    const rawProposal = await multiSig.proposals(rawMultiSignAddress, rawId);

    return rawProposal.isSome;
  }

  /**
   * Returns a human readable representation
   */
  public toHuman(): HumanReadable {
    const {
      multiSig: { address: multiSigAddress },
      id,
    } = this;

    return {
      multiSigAddress,
      id: id.toString(),
    };
  }

  /**
   * Fetches the individual votes for this MultiSig proposal
   */
  public async votes(): Promise<Signer[]> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      multiSig: { address: multiSigAddress },
      id,
      context,
    } = this;

    const result = await multiSig.votes.entries([
      stringToAccountId(multiSigAddress, context),
      bigNumberToU64(id, context),
    ]);

    return result.map(
      ([
        {
          args: [, signatory],
        },
      ]) => {
        return signerValueToSigner(signatoryToSignerValue(signatory), context);
      }
    );
  }
}
