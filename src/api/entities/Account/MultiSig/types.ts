import BigNumber from 'bignumber.js';

import { MultiSig } from '~/internal';
import { Signer } from '~/types';

export interface MultiSigDetails {
  signers: Signer[];
  requiredSignatures: BigNumber;
}

export interface MultiSigSigner {
  signerFor: MultiSig;
  signers: Signer[];
}
