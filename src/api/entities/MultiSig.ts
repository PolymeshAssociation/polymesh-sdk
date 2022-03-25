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
 * Represents a MultiSig Account
 */
export class MultiSig extends Account {
  /**
   * Returns details about this MultiSig
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
   * Given an ID fetches a Proposal for this MultiSig
   */
  public async getProposal(id: BigNumber): Promise<MultiSigProposal> {
    const { address, context } = this;
    const proposal = new MultiSigProposal({ multiSigAddress: address, id }, context);
    const exists = await proposal.exists();
    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Proposal with ID "${id}" doesn't exist on chain. Maybe it was already executed`,
      });
    }

    return proposal;
  }

  /**
   * Returns all pending Proposals for this MultiSig
   */
  public async getPendingProposals(): Promise<MultiSigProposal[]> {
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
      // Not sure why the ID will not be present
      if (rawId.isSome) {
        const id = u64ToBigNumber(rawId.unwrap());
        return new MultiSigProposal(
          { multiSigAddress: address, id: new BigNumber(id) },
          this.context
        );
      } else {
        // I don't think this should happen
        throw new Error('no proposal ID');
      }
    });
  }
}
