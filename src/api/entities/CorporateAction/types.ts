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

export type InputTargets = Omit<CorporateActionTargets, 'identities'> & {
  identities: (string | Identity)[];
};

export type InputTaxWithholding = Omit<TaxWithholding, 'identity'> & {
  identity: string | Identity;
};

export enum CorporateActionKind {
  PredictableBenefit = 'PredictableBenefit',
  UnpredictableBenefit = 'UnpredictableBenefit',
  IssuerNotice = 'IssuerNotice',
  Reorganization = 'Reorganization',
  Other = 'Other',
}

export { Params as CorporateActionParams } from '.';
