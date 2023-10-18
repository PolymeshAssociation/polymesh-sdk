/* istanbul ignore file */

export {
  SettlementResultEnum,
  StatOpTypeEnum,
  CallIdEnum,
  BalanceTypeEnum,
  ProposalStateEnum,
  ModuleIdEnum,
  EventIdEnum,
  StoStatus,
  TransferComplianceTypeEnum,
  TransferRestrictionTypeEnum,
  LegTypeEnum,
  AuthorizationStatusEnum,
  InstructionStatusEnum,
  AuthTypeEnum,
  ClaimTypeEnum,
} from '~/middleware/types';

export const middlewareEnumMap: Record<string, string> = {
  SettlementResultEnum: 'SettlementResultEnum',
  StatOpTypeEnum: 'StatOpTypeEnum',
  CallIdEnum: 'CallIdEnum',
  BalanceTypeEnum: 'BalanceTypeEnum',
  ProposalStateEnum: 'ProposalStateEnum',
  ModuleIdEnum: 'ModuleIdEnum',
  EventIdEnum: 'EventIdEnum',
  StoStatus: 'StoStatus',
  TransferComplianceTypeEnum: 'TransferComplianceTypeEnum',
  TransferRestrictionTypeEnum: 'TransferRestrictionTypeEnum',
  LegTypeEnum: 'LegTypeEnum',
  AuthorizationStatusEnum: 'AuthorizationStatusEnum',
  InstructionStatusEnum: 'InstructionStatusEnum',
  AuthTypeEnum: 'AuthTypeEnum',
  ClaimTypeEnum: 'ClaimTypeEnum',
};
