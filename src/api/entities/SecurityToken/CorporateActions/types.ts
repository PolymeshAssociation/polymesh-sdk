import BigNumber from 'bignumber.js';

import { CorporateActionTargets, TaxWithholding } from '~/types';

export interface CorporateActionDefaults {
  targets: CorporateActionTargets;
  defaultTaxWithholding: BigNumber;
  taxWithholdings: TaxWithholding[];
}
