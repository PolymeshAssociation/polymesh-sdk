import BigNumber from 'bignumber.js';

import { Identity } from '~/internal';

export enum TargetTreatment {
  Include = 'Include',
  Exclude = 'Exclude',
}

export interface CorporateActionTargets {
  identities: Identity[];
  treatment: TargetTreatment;
}

export interface TaxWithholding {
  identity: Identity;
  percentage: BigNumber;
}

export enum CorporateActionKind {
  PredictableBenefit = 'PredictableBenefit',
  UnpredictableBenefit = 'UnpredictableBenefit',
  IssuerNotice = 'IssuerNotice',
  Reorganization = 'Reorganization',
  Other = 'Other',
}
