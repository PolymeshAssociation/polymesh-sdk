import BigNumber from 'bignumber.js';

import { CorporateActionTargets, TaxWithholding } from '~/types';

export interface CorporateActionDefaultConfig {
  targets: CorporateActionTargets;
  defaultTaxWithholding: BigNumber;
  taxWithholdings: TaxWithholding[];
}
