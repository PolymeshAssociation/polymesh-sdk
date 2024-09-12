import BigNumber from 'bignumber.js';

import { Account, MultiSig } from '~/internal';

export interface MultiSigDetails {
  signers: Account[];
  requiredSignatures: BigNumber;
}

export interface MultiSigSigners {
  signerFor: MultiSig;
  signers: Account[];
  isAdmin: boolean;
  isPayer: boolean;
}
