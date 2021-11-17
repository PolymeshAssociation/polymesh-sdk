import { SettlementResultEnum } from '~/middleware/types';
import { Settlement } from '~/middleware/types-v2';
import { Modify } from '~/types/utils';

export type V2Settlement = Modify<
  Settlement,
  { legs: V2Leg[]; addresses: string[]; result: SettlementResultEnum }
>;

export type V2Portfolio = { did: string; number: number };

export type V2Leg = {
  to: V2Portfolio;
  from: V2Portfolio;
  amount: string;
  ticker: string;
};
