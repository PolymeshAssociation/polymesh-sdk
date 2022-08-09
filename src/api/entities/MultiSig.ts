import BigNumber from 'bignumber.js';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, PolymeshError } from '~/internal';
import { ErrorCode, Signer } from '~/types';
import {
  signatoryToSignerValue,
  signerValueToSigner,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';

interface MultiSigDetails {
  signers: Signer[];
  requiredSignatures: BigNumber;
}

/**
 * Represents a MultiSig Account. A MultiSig Account is composed of one or more signing Accounts. In order to submit a transaction, a specific amount of those signing Accounts must approve it first
 */
export class MultiSig extends Account {
  /**
   * Return details about this MultiSig such as the signing Accounts and the required number of signatures to execute a MultiSigProposal
   */
  public async details(): Promise<MultiSigDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      context,
      address,
    } = this;
    const rawAddress = stringToAccountId(address, context);
    const [rawSigners, rawSignersRequired] = await Promise.all([
      multiSig.multiSigSigners.entries(rawAddress),
      multiSig.multiSigSignsRequired(rawAddress),
    ]);
    const signers = rawSigners.map(([, signatory]) => {
      return signerValueToSigner(signatoryToSignerValue(signatory), context);
    });
    const requiredSignatures = u64ToBigNumber(rawSignersRequired);
    return { signers, requiredSignatures };
  }

  /**
   * Given an ID fetch a { @link MultiSigProposal } for this MultiSig
   *
   * @throws if the MultiSigProposal is not found
   */
  public async getProposal(args: { id: BigNumber }): Promise<MultiSigProposal> {
    const { id } = args;
    const { address, context } = this;
    const proposal = new MultiSigProposal({ multiSigAddress: address, id }, context);
    const exists = await proposal.exists();
    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Proposal with ID "${id}" was not found`,
      });
    }

    return proposal;
  }

  /**
   * Return all { @link MultiSigProposal | MultiSigProposals } for this MultiSig Account
   */
  public async getProposals(): Promise<MultiSigProposal[]> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      context,
      address,
    } = this;
    const rawAddress = stringToAccountId(address, context);

    const rawProposals = await multiSig.proposalIds.entries(rawAddress);
    return rawProposals.map(([, rawId]) => {
      const id = u64ToBigNumber(rawId.unwrap());
      return new MultiSigProposal(
        { multiSigAddress: address, id: new BigNumber(id) },
        this.context
      );
    });
  }
}
