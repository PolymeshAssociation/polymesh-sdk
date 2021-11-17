import { SettlementResultEnum } from '~/middleware/types';
import { Settlement } from '~/middleware/types-v2';
import { Modify } from '~/types/utils';

export type V2Settlement = Modify<
  Settlement,
  { legs: V2Leg[]; addresses: string[]; result: SettlementResultEnum }
>;

type V2Leg = {
  to: { did: string; number: number };
  from: { did: string; number: number };
  amount: string;
  ticker: string;
};
