import BigNumber from 'bignumber.js';

import { TxTags } from '~/polkadot';

export const MAX_DECIMALS = 6;
export const MAX_TICKER_LENGTH = 12;
export const MAX_TOKEN_AMOUNT = new BigNumber(Math.pow(10, 12));
export const DUMMY_ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
export const HARVESTER_ENDPOINT =
  'https://24pha89jxg.execute-api.us-east-1.amazonaws.com/dev/graphql';
export const MAX_BATCH_ELEMENTS = {
  [TxTags.asset.BatchIssue]: 500,
  [TxTags.identity.BatchAcceptAuthorization]: 500,
  [TxTags.identity.BatchRemoveAuthorization]: 500,
  [TxTags.identity.AddClaimsBatch]: 500,
  [TxTags.identity.RevokeClaimsBatch]: 500,
  [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]: 500,
  [TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]: 500,
};
