import BigNumber from 'bignumber.js';

import { Signer } from '~/types';

export interface MultiSigDetails {
  signers: Signer[];
  requiredSignatures: BigNumber;
}
