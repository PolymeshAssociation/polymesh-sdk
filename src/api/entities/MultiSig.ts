import BigNumber from 'bignumber.js';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Identity, PolymeshError } from '~/internal';
import { ErrorCode, Signer } from '~/types';
import { accountIdToString, identityIdToString, u64ToBigNumber } from '~/utils/conversion';

interface MultiSigDetails {
  signers: Signer[];
  signaturesRequired: BigNumber;
}

/**
 * Represents a MultiSig Account. MultiSig functions like an { @link Account } except submitted extrinsics need to be approved by a number of signers
 */
export class MultiSig extends Account {
  /**
   * Returns details about this MultiSig such as the signing accounts and the required number of signatures to execute a MultiSigProposal
   */
  public async details(): Promise<MultiSigDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      address,
    } = this;
    const [rawSigners, rawSignersRequired] = await Promise.all([
      multiSig.multiSigSigners.entries(address),
      multiSig.multiSigSignsRequired(address),
    ]);
    const signers = rawSigners.map(([, signatory]) => {
      if (signatory.isAccount) {
        const signatoryAddress = accountIdToString(signatory.asAccount);
        return new Account({ address: signatoryAddress }, this.context);
      } else {
        const did = identityIdToString(signatory.asIdentity);
        return new Identity({ did }, this.context);
      }
    });
    const signaturesRequired = u64ToBigNumber(rawSignersRequired);
    return { signers, signaturesRequired };
  }

  /**
   * Given an ID fetches a { @link MultiSigProposal } for this MultiSig
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
   * Returns all { @link MultiSigProposal | MultiSigProposals } for this MultiSig Account
   */
  public async getProposals(): Promise<MultiSigProposal[]> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      address,
    } = this;

    const rawProposals = await multiSig.proposalIds.entries(address);
    return rawProposals.map(([, rawId]) => {
      if (rawId.isSome) {
        const id = u64ToBigNumber(rawId.unwrap());
        return new MultiSigProposal(
          { multiSigAddress: address, id: new BigNumber(id) },
          this.context
        );
      } else {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'A Proposal was missing its ID. Perhaps it was already executed',
        });
      }
    });
  }
}
