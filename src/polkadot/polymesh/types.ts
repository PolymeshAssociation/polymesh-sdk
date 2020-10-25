// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { ITuple } from '@polkadot/types/types';
import { Enum, Option, Struct, U8aFixed, Vec } from '@polkadot/types/codec';
import { Bytes, Text, bool, u32, u64, u8 } from '@polkadot/types/primitive';
import { Signature } from '@polkadot/types/interfaces/extrinsics';
import {
  AccountId,
  Balance,
  BlockNumber,
  Call,
  H256,
  H512,
  Hash,
  Moment,
  Perbill,
} from '@polkadot/types/interfaces/runtime';

/** @name AssetCompliance */
export interface AssetCompliance extends Struct {
  readonly is_paused: bool;
  readonly requirements: Vec<ComplianceRequirement>;
}

/** @name AssetComplianceResult */
export interface AssetComplianceResult extends Struct {
  readonly paused: bool;
  readonly requirements: Vec<ComplianceRequirementResult>;
  readonly result: bool;
}

/** @name AssetDidResult */
export interface AssetDidResult extends Enum {
  readonly isOk: boolean;
  readonly asOk: IdentityId;
  readonly isErr: boolean;
  readonly asErr: Bytes;
}

/** @name AssetIdentifier */
export interface AssetIdentifier extends Enum {
  readonly isCusip: boolean;
  readonly asCusip: U8aFixed;
  readonly isCins: boolean;
  readonly asCins: U8aFixed;
  readonly isIsin: boolean;
  readonly asIsin: U8aFixed;
  readonly isLei: boolean;
  readonly asLei: U8aFixed;
}

/** @name AssetName */
export interface AssetName extends Text {}

/** @name AssetOwnershipRelation */
export interface AssetOwnershipRelation extends Enum {
  readonly isNotOwned: boolean;
  readonly isTickerOwned: boolean;
  readonly isAssetOwned: boolean;
}

/** @name AssetType */
export interface AssetType extends Enum {
  readonly isEquityCommon: boolean;
  readonly isEquityPreferred: boolean;
  readonly isCommodity: boolean;
  readonly isFixedIncome: boolean;
  readonly isReit: boolean;
  readonly isFund: boolean;
  readonly isRevenueShareAgreement: boolean;
  readonly isStructuredProduct: boolean;
  readonly isDerivative: boolean;
  readonly isCustom: boolean;
  readonly asCustom: Bytes;
}

/** @name AuthIdentifier */
export interface AuthIdentifier extends Struct {
  readonly signatory: Signatory;
  readonly auth_id: u64;
}

/** @name Authorization */
export interface Authorization extends Struct {
  readonly authorization_data: AuthorizationData;
  readonly authorized_by: IdentityId;
  readonly expiry: Option<Moment>;
  readonly auth_id: u64;
}

/** @name AuthorizationData */
export interface AuthorizationData extends Enum {
  readonly isAttestPrimaryKeyRotation: boolean;
  readonly asAttestPrimaryKeyRotation: IdentityId;
  readonly isRotatePrimaryKey: boolean;
  readonly asRotatePrimaryKey: IdentityId;
  readonly isTransferTicker: boolean;
  readonly asTransferTicker: Ticker;
  readonly isTransferPrimaryIssuanceAgent: boolean;
  readonly asTransferPrimaryIssuanceAgent: Ticker;
  readonly isAddMultiSigSigner: boolean;
  readonly asAddMultiSigSigner: AccountId;
  readonly isTransferAssetOwnership: boolean;
  readonly asTransferAssetOwnership: Ticker;
  readonly isJoinIdentity: boolean;
  readonly asJoinIdentity: Vec<Permission>;
  readonly isPortfolioCustody: boolean;
  readonly asPortfolioCustody: PortfolioId;
  readonly isCustom: boolean;
  readonly asCustom: Ticker;
  readonly isNoData: boolean;
}

/** @name AuthorizationNonce */
export interface AuthorizationNonce extends u64 {}

/** @name AuthorizationStatus */
export interface AuthorizationStatus extends Enum {
  readonly isUnknown: boolean;
  readonly isPending: boolean;
  readonly isAuthorized: boolean;
  readonly isRejected: boolean;
}

/** @name AuthorizationType */
export interface AuthorizationType extends Enum {
  readonly isAttestPrimaryKeyRotation: boolean;
  readonly isRotatePrimaryKey: boolean;
  readonly isTransferTicker: boolean;
  readonly isAddMultiSigSigner: boolean;
  readonly isTransferAssetOwnership: boolean;
  readonly isJoinIdentity: boolean;
  readonly isPortfolioCustody: boolean;
  readonly isCustom: boolean;
  readonly isNoData: boolean;
}

/** @name Ballot */
export interface Ballot extends Struct {
  readonly checkpoint_id: u64;
  readonly voting_start: Moment;
  readonly voting_end: Moment;
  readonly motions: Vec<Motion>;
}

/** @name BatchAddClaimItem */
export interface BatchAddClaimItem extends Struct {
  readonly target: IdentityId;
  readonly claim: Claim;
  readonly expiry: Option<Moment>;
}

/** @name BatchRevokeClaimItem */
export interface BatchRevokeClaimItem extends Struct {
  readonly target: IdentityId;
  readonly claim: Claim;
}

/** @name Beneficiary */
export interface Beneficiary extends Struct {
  readonly id: IdentityId;
  readonly amount: Balance;
}

/** @name BridgeTx */
export interface BridgeTx extends Struct {
  readonly nonce: u32;
  readonly recipient: AccountId;
  readonly value: Balance;
  readonly tx_hash: H256;
}

/** @name BridgeTxDetail */
export interface BridgeTxDetail extends Struct {
  readonly amount: Balance;
  readonly status: BridgeTxStatus;
  readonly execution_block: BlockNumber;
  readonly tx_hash: H256;
}

/** @name BridgeTxStatus */
export interface BridgeTxStatus extends Enum {
  readonly isAbsent: boolean;
  readonly isPending: boolean;
  readonly asPending: u8;
  readonly isFrozen: boolean;
  readonly isTimelocked: boolean;
  readonly isHandled: boolean;
}

/** @name CanTransferResult */
export interface CanTransferResult extends Enum {
  readonly isOk: boolean;
  readonly asOk: u8;
  readonly isErr: boolean;
  readonly asErr: Bytes;
}

/** @name CappedFee */
export interface CappedFee extends u64 {}

/** @name CddId */
export interface CddId extends U8aFixed {}

/** @name CddStatus */
export interface CddStatus extends Enum {
  readonly isOk: boolean;
  readonly asOk: IdentityId;
  readonly isErr: boolean;
  readonly asErr: Bytes;
}

/** @name Claim */
export interface Claim extends Enum {
  readonly isAccredited: boolean;
  readonly asAccredited: Scope;
  readonly isAffiliate: boolean;
  readonly asAffiliate: Scope;
  readonly isBuyLockup: boolean;
  readonly asBuyLockup: Scope;
  readonly isSellLockup: boolean;
  readonly asSellLockup: Scope;
  readonly isCustomerDueDiligence: boolean;
  readonly asCustomerDueDiligence: CddId;
  readonly isKnowYourCustomer: boolean;
  readonly asKnowYourCustomer: Scope;
  readonly isJurisdiction: boolean;
  readonly asJurisdiction: ITuple<[CountryCode, Scope]>;
  readonly isExempted: boolean;
  readonly asExempted: Scope;
  readonly isBlocked: boolean;
  readonly asBlocked: Scope;
  readonly isInvestorZkProof: boolean;
  readonly asInvestorZkProof: ITuple<[Scope, ScopeId, CddId, InvestorZKProofData]>;
  readonly isNoData: boolean;
}

/** @name Claim1stKey */
export interface Claim1stKey extends Struct {
  readonly target: IdentityId;
  readonly claim_type: ClaimType;
}

/** @name Claim2ndKey */
export interface Claim2ndKey extends Struct {
  readonly issuer: IdentityId;
  readonly scope: Option<Scope>;
}

/** @name ClaimType */
export interface ClaimType extends Enum {
  readonly isAccredited: boolean;
  readonly isAffiliate: boolean;
  readonly isBuyLockup: boolean;
  readonly isSellLockup: boolean;
  readonly isCustomerDueDiligence: boolean;
  readonly isKnowYourCustomer: boolean;
  readonly isJurisdiction: boolean;
  readonly isExempted: boolean;
  readonly isBlocked: boolean;
  readonly isNoType: boolean;
}

/** @name ClassicTickerRegistration */
export interface ClassicTickerRegistration extends Struct {
  readonly eth_owner: EthereumAddress;
  readonly is_created: bool;
}

/** @name Commission */
export interface Commission extends Enum {
  readonly isIndividual: boolean;
  readonly isGlobal: boolean;
  readonly asGlobal: u32;
}

/** @name ComplianceRequirement */
export interface ComplianceRequirement extends Struct {
  readonly sender_conditions: Vec<Condition>;
  readonly receiver_conditions: Vec<Condition>;
  readonly id: u32;
}

/** @name ComplianceRequirementResult */
export interface ComplianceRequirementResult extends Struct {
  readonly sender_conditions: Vec<Condition>;
  readonly receiver_conditions: Vec<Condition>;
  readonly id: u32;
  readonly result: bool;
}

/** @name Condition */
export interface Condition extends Struct {
  readonly condition_type: ConditionType;
  readonly issuers: Vec<IdentityId>;
}

/** @name ConditionResult */
export interface ConditionResult extends Struct {
  readonly condition: Condition;
  readonly result: bool;
}

/** @name ConditionType */
export interface ConditionType extends Enum {
  readonly isIsPresent: boolean;
  readonly asIsPresent: Claim;
  readonly isIsAbsent: boolean;
  readonly asIsAbsent: Claim;
  readonly isIsAnyOf: boolean;
  readonly asIsAnyOf: Vec<Claim>;
  readonly isIsNoneOf: boolean;
  readonly asIsNoneOf: Vec<Claim>;
  readonly isIsIdentity: boolean;
  readonly asIsIdentity: TargetIdentity;
  readonly isHasValidProofOfInvestor: boolean;
  readonly asHasValidProofOfInvestor: Ticker;
}

/** @name Counter */
export interface Counter extends u64 {}

/** @name CountryCode */
export interface CountryCode extends Enum {
  readonly isAf: boolean;
  readonly isAx: boolean;
  readonly isAl: boolean;
  readonly isDz: boolean;
  readonly isAs: boolean;
  readonly isAd: boolean;
  readonly isAo: boolean;
  readonly isAi: boolean;
  readonly isAq: boolean;
  readonly isAg: boolean;
  readonly isAr: boolean;
  readonly isAm: boolean;
  readonly isAw: boolean;
  readonly isAu: boolean;
  readonly isAt: boolean;
  readonly isAz: boolean;
  readonly isBs: boolean;
  readonly isBh: boolean;
  readonly isBd: boolean;
  readonly isBb: boolean;
  readonly isBy: boolean;
  readonly isBe: boolean;
  readonly isBz: boolean;
  readonly isBj: boolean;
  readonly isBm: boolean;
  readonly isBt: boolean;
  readonly isBo: boolean;
  readonly isBa: boolean;
  readonly isBw: boolean;
  readonly isBv: boolean;
  readonly isBr: boolean;
  readonly isVg: boolean;
  readonly isIo: boolean;
  readonly isBn: boolean;
  readonly isBg: boolean;
  readonly isBf: boolean;
  readonly isBi: boolean;
  readonly isKh: boolean;
  readonly isCm: boolean;
  readonly isCa: boolean;
  readonly isCv: boolean;
  readonly isKy: boolean;
  readonly isCf: boolean;
  readonly isTd: boolean;
  readonly isCl: boolean;
  readonly isCn: boolean;
  readonly isHk: boolean;
  readonly isMo: boolean;
  readonly isCx: boolean;
  readonly isCc: boolean;
  readonly isCo: boolean;
  readonly isKm: boolean;
  readonly isCg: boolean;
  readonly isCd: boolean;
  readonly isCk: boolean;
  readonly isCr: boolean;
  readonly isCi: boolean;
  readonly isHr: boolean;
  readonly isCu: boolean;
  readonly isCy: boolean;
  readonly isCz: boolean;
  readonly isDk: boolean;
  readonly isDj: boolean;
  readonly isDm: boolean;
  readonly isDo: boolean;
  readonly isEc: boolean;
  readonly isEg: boolean;
  readonly isSv: boolean;
  readonly isGq: boolean;
  readonly isEr: boolean;
  readonly isEe: boolean;
  readonly isEt: boolean;
  readonly isFk: boolean;
  readonly isFo: boolean;
  readonly isFj: boolean;
  readonly isFi: boolean;
  readonly isFr: boolean;
  readonly isGf: boolean;
  readonly isPf: boolean;
  readonly isTf: boolean;
  readonly isGa: boolean;
  readonly isGm: boolean;
  readonly isGe: boolean;
  readonly isDe: boolean;
  readonly isGh: boolean;
  readonly isGi: boolean;
  readonly isGr: boolean;
  readonly isGl: boolean;
  readonly isGd: boolean;
  readonly isGp: boolean;
  readonly isGu: boolean;
  readonly isGt: boolean;
  readonly isGg: boolean;
  readonly isGn: boolean;
  readonly isGw: boolean;
  readonly isGy: boolean;
  readonly isHt: boolean;
  readonly isHm: boolean;
  readonly isVa: boolean;
  readonly isHn: boolean;
  readonly isHu: boolean;
  readonly isIs: boolean;
  readonly isIn: boolean;
  readonly isId: boolean;
  readonly isIr: boolean;
  readonly isIq: boolean;
  readonly isIe: boolean;
  readonly isIm: boolean;
  readonly isIl: boolean;
  readonly isIt: boolean;
  readonly isJm: boolean;
  readonly isJp: boolean;
  readonly isJe: boolean;
  readonly isJo: boolean;
  readonly isKz: boolean;
  readonly isKe: boolean;
  readonly isKi: boolean;
  readonly isKp: boolean;
  readonly isKr: boolean;
  readonly isKw: boolean;
  readonly isKg: boolean;
  readonly isLa: boolean;
  readonly isLv: boolean;
  readonly isLb: boolean;
  readonly isLs: boolean;
  readonly isLr: boolean;
  readonly isLy: boolean;
  readonly isLi: boolean;
  readonly isLt: boolean;
  readonly isLu: boolean;
  readonly isMk: boolean;
  readonly isMg: boolean;
  readonly isMw: boolean;
  readonly isMy: boolean;
  readonly isMv: boolean;
  readonly isMl: boolean;
  readonly isMt: boolean;
  readonly isMh: boolean;
  readonly isMq: boolean;
  readonly isMr: boolean;
  readonly isMu: boolean;
  readonly isYt: boolean;
  readonly isMx: boolean;
  readonly isFm: boolean;
  readonly isMd: boolean;
  readonly isMc: boolean;
  readonly isMn: boolean;
  readonly isMe: boolean;
  readonly isMs: boolean;
  readonly isMa: boolean;
  readonly isMz: boolean;
  readonly isMm: boolean;
  readonly isNa: boolean;
  readonly isNr: boolean;
  readonly isNp: boolean;
  readonly isNl: boolean;
  readonly isAn: boolean;
  readonly isNc: boolean;
  readonly isNz: boolean;
  readonly isNi: boolean;
  readonly isNe: boolean;
  readonly isNg: boolean;
  readonly isNu: boolean;
  readonly isNf: boolean;
  readonly isMp: boolean;
  readonly isNo: boolean;
  readonly isOm: boolean;
  readonly isPk: boolean;
  readonly isPw: boolean;
  readonly isPs: boolean;
  readonly isPa: boolean;
  readonly isPg: boolean;
  readonly isPy: boolean;
  readonly isPe: boolean;
  readonly isPh: boolean;
  readonly isPn: boolean;
  readonly isPl: boolean;
  readonly isPt: boolean;
  readonly isPr: boolean;
  readonly isQa: boolean;
  readonly isRe: boolean;
  readonly isRo: boolean;
  readonly isRu: boolean;
  readonly isRw: boolean;
  readonly isBl: boolean;
  readonly isSh: boolean;
  readonly isKn: boolean;
  readonly isLc: boolean;
  readonly isMf: boolean;
  readonly isPm: boolean;
  readonly isVc: boolean;
  readonly isWs: boolean;
  readonly isSm: boolean;
  readonly isSt: boolean;
  readonly isSa: boolean;
  readonly isSn: boolean;
  readonly isRs: boolean;
  readonly isSc: boolean;
  readonly isSl: boolean;
  readonly isSg: boolean;
  readonly isSk: boolean;
  readonly isSi: boolean;
  readonly isSb: boolean;
  readonly isSo: boolean;
  readonly isZa: boolean;
  readonly isGs: boolean;
  readonly isSs: boolean;
  readonly isEs: boolean;
  readonly isLk: boolean;
  readonly isSd: boolean;
  readonly isSr: boolean;
  readonly isSj: boolean;
  readonly isSz: boolean;
  readonly isSe: boolean;
  readonly isCh: boolean;
  readonly isSy: boolean;
  readonly isTw: boolean;
  readonly isTj: boolean;
  readonly isTz: boolean;
  readonly isTh: boolean;
  readonly isTl: boolean;
  readonly isTg: boolean;
  readonly isTk: boolean;
  readonly isTo: boolean;
  readonly isTt: boolean;
  readonly isTn: boolean;
  readonly isTr: boolean;
  readonly isTm: boolean;
  readonly isTc: boolean;
  readonly isTv: boolean;
  readonly isUg: boolean;
  readonly isUa: boolean;
  readonly isAe: boolean;
  readonly isGb: boolean;
  readonly isUs: boolean;
  readonly isUm: boolean;
  readonly isUy: boolean;
  readonly isUz: boolean;
  readonly isVu: boolean;
  readonly isVe: boolean;
  readonly isVn: boolean;
  readonly isVi: boolean;
  readonly isWf: boolean;
  readonly isEh: boolean;
  readonly isYe: boolean;
  readonly isZm: boolean;
  readonly isZw: boolean;
}

/** @name DepositInfo */
export interface DepositInfo extends Struct {
  readonly owner: AccountId;
  readonly amount: Balance;
}

/** @name DidRecord */
export interface DidRecord extends Struct {
  readonly roles: Vec<IdentityRole>;
  readonly primary_key: AccountId;
  readonly secondary_keys: Vec<SecondaryKey>;
}

/** @name DidRecords */
export interface DidRecords extends Enum {
  readonly isSuccess: boolean;
  readonly asSuccess: DidRecordsSuccess;
  readonly isIdNotFound: boolean;
  readonly asIdNotFound: Bytes;
}

/** @name DidRecordsSuccess */
export interface DidRecordsSuccess extends Struct {
  readonly primary_key: AccountId;
  readonly secondary_key: Vec<SecondaryKey>;
}

/** @name DidStatus */
export interface DidStatus extends Enum {
  readonly isUnknown: boolean;
  readonly isExists: boolean;
  readonly isCddVerified: boolean;
}

/** @name Dividend */
export interface Dividend extends Struct {
  readonly amount: Balance;
  readonly active: bool;
  readonly matures_at: Option<Moment>;
  readonly expires_at: Option<Moment>;
  readonly payout_currency: Option<Ticker>;
  readonly checkpoint_id: u64;
}

/** @name Document */
export interface Document extends Struct {
  readonly uri: DocumentUri;
  readonly content_hash: DocumentHash;
}

/** @name DocumentHash */
export interface DocumentHash extends Text {}

/** @name DocumentName */
export interface DocumentName extends Text {}

/** @name DocumentUri */
export interface DocumentUri extends Text {}

/** @name EcdsaSignature */
export interface EcdsaSignature extends U8aFixed {}

/** @name EthereumAddress */
export interface EthereumAddress extends U8aFixed {}

/** @name FeeOf */
export interface FeeOf extends Balance {}

/** @name FundingRoundName */
export interface FundingRoundName extends Text {}

/** @name Fundraiser */
export interface Fundraiser extends Struct {
  readonly raise_token: Ticker;
  readonly remaining_amount: Balance;
  readonly price_per_token: Balance;
  readonly venue_id: u64;
}

/** @name HandledTxStatus */
export interface HandledTxStatus extends Enum {
  readonly isSuccess: boolean;
  readonly isError: boolean;
  readonly asError: Text;
}

/** @name HistoricalVotingByAddress */
export interface HistoricalVotingByAddress extends Vec<VoteByPip> {}

/** @name HistoricalVotingById */
export interface HistoricalVotingById extends Vec<ITuple<[AccountId, HistoricalVotingByAddress]>> {}

/** @name IdentityClaim */
export interface IdentityClaim extends Struct {
  readonly claim_issuer: IdentityId;
  readonly issuance_date: Moment;
  readonly last_update_date: Moment;
  readonly expiry: Option<Moment>;
  readonly claim: Claim;
}

/** @name IdentityClaimKey */
export interface IdentityClaimKey extends Struct {
  readonly id: IdentityId;
  readonly claim_type: ClaimType;
}

/** @name IdentityId */
export interface IdentityId extends U8aFixed {}

/** @name IdentityRole */
export interface IdentityRole extends Enum {
  readonly isIssuer: boolean;
  readonly isSimpleTokenIssuer: boolean;
  readonly isValidator: boolean;
  readonly isClaimIssuer: boolean;
  readonly isInvestor: boolean;
  readonly isNodeRunner: boolean;
  readonly isPm: boolean;
  readonly isCddamlClaimIssuer: boolean;
  readonly isAccreditedInvestorClaimIssuer: boolean;
  readonly isVerifiedIdentityClaimIssuer: boolean;
}

/** @name ImplicitRequirementStatus */
export interface ImplicitRequirementStatus extends Enum {
  readonly isActive: boolean;
  readonly isInactive: boolean;
}

/** @name InactiveMember */
export interface InactiveMember extends Struct {
  readonly id: IdentityId;
  readonly deactivated_at: Moment;
  readonly expiry: Option<Moment>;
}

/** @name Instruction */
export interface Instruction extends Struct {
  readonly instruction_id: u64;
  readonly venue_id: u64;
  readonly status: InstructionStatus;
  readonly settlement_type: SettlementType;
  readonly created_at: Option<Moment>;
  readonly valid_from: Option<Moment>;
}

/** @name InstructionStatus */
export interface InstructionStatus extends Enum {
  readonly isUnknown: boolean;
  readonly isPending: boolean;
}

/** @name Investment */
export interface Investment extends Struct {
  readonly investor_did: IdentityId;
  readonly amount_paid: Balance;
  readonly assets_purchased: Balance;
  readonly last_purchase_date: Moment;
}

/** @name InvestorUid */
export interface InvestorUid extends U8aFixed {}

/** @name InvestorZKProofData */
export interface InvestorZKProofData extends U8aFixed {}

/** @name IssueAssetItem */
export interface IssueAssetItem extends Struct {
  readonly identity_did: IdentityId;
  readonly value: Balance;
}

/** @name IssueRecipient */
export interface IssueRecipient extends Enum {
  readonly isAccount: boolean;
  readonly asAccount: AccountId;
  readonly isIdentity: boolean;
  readonly asIdentity: IdentityId;
}

/** @name KeyIdentityData */
export interface KeyIdentityData extends Struct {
  readonly identity: IdentityId;
  readonly permissions: Option<Vec<Permission>>;
}

/** @name Leg */
export interface Leg extends Struct {
  readonly from: PortfolioId;
  readonly to: PortfolioId;
  readonly asset: Ticker;
  readonly amount: Balance;
}

/** @name LegStatus */
export interface LegStatus extends Enum {
  readonly isPendingTokenLock: boolean;
  readonly isExecutionPending: boolean;
  readonly isExecutionToBeSkipped: boolean;
  readonly asExecutionToBeSkipped: ITuple<[AccountId, u64]>;
}

/** @name LinkedKeyInfo */
export interface LinkedKeyInfo extends Enum {
  readonly isUnique: boolean;
  readonly asUnique: IdentityId;
  readonly isGroup: boolean;
  readonly asGroup: Vec<IdentityId>;
}

/** @name Memo */
export interface Memo extends U8aFixed {}

/** @name Motion */
export interface Motion extends Struct {
  readonly title: MotionTitle;
  readonly info_link: MotionInfoLink;
  readonly choices: Vec<MotionTitle>;
}

/** @name MotionInfoLink */
export interface MotionInfoLink extends Text {}

/** @name MotionTitle */
export interface MotionTitle extends Text {}

/** @name MovePortfolioItem */
export interface MovePortfolioItem extends Struct {
  readonly ticker: Ticker;
  readonly amount: Balance;
}

/** @name OffChainSignature */
export interface OffChainSignature extends Enum {
  readonly isEd25519: boolean;
  readonly asEd25519: H512;
  readonly isSr25519: boolean;
  readonly asSr25519: H512;
  readonly isEcdsa: boolean;
  readonly asEcdsa: H512;
}

/** @name OfflineSlashingParams */
export interface OfflineSlashingParams extends Struct {
  readonly max_offline_percent: u32;
  readonly constant: u32;
  readonly max_slash_percent: u32;
}

/** @name PendingTx */
export interface PendingTx extends Struct {
  readonly did: IdentityId;
  readonly bridge_tx: BridgeTx;
}

/** @name Permission */
export interface Permission extends Enum {
  readonly isFull: boolean;
  readonly isAdmin: boolean;
  readonly isOperator: boolean;
  readonly isSpendFunds: boolean;
}

/** @name Pip */
export interface Pip extends Struct {
  readonly id: PipId;
  readonly proposal: Call;
  readonly state: ProposalState;
}

/** @name PipDescription */
export interface PipDescription extends Text {}

/** @name PipId */
export interface PipId extends u32 {}

/** @name PipsMetadata */
export interface PipsMetadata extends Struct {
  readonly proposer: AccountId;
  readonly id: PipId;
  readonly end: u32;
  readonly url: Option<Url>;
  readonly description: Option<PipDescription>;
  readonly cool_off_until: u32;
  readonly beneficiaries: Vec<Beneficiary>;
}

/** @name PolymeshVotes */
export interface PolymeshVotes extends Struct {
  readonly index: u32;
  readonly ayes: Vec<ITuple<[IdentityId, Balance]>>;
  readonly nays: Vec<ITuple<[IdentityId, Balance]>>;
}

/** @name PortfolioId */
export interface PortfolioId extends Struct {
  readonly did: IdentityId;
  readonly kind: PortfolioKind;
}

/** @name PortfolioKind */
export interface PortfolioKind extends Enum {
  readonly isDefault: boolean;
  readonly isUser: boolean;
  readonly asUser: PortfolioNumber;
}

/** @name PortfolioName */
export interface PortfolioName extends Bytes {}

/** @name PortfolioNumber */
export interface PortfolioNumber extends u64 {}

/** @name PosRatio */
export interface PosRatio extends ITuple<[u32, u32]> {}

/** @name PreAuthorizedKeyInfo */
export interface PreAuthorizedKeyInfo extends Struct {
  readonly target_id: IdentityId;
  readonly secondary_key: SecondaryKey;
}

/** @name ProportionMatch */
export interface ProportionMatch extends Enum {
  readonly isAtLeast: boolean;
  readonly isMoreThan: boolean;
}

/** @name ProposalData */
export interface ProposalData extends Enum {
  readonly isHash: boolean;
  readonly asHash: Hash;
  readonly isProposal: boolean;
  readonly asProposal: Bytes;
}

/** @name ProposalDetails */
export interface ProposalDetails extends Struct {
  readonly approvals: u64;
  readonly rejections: u64;
  readonly status: ProposalStatus;
  readonly expiry: Option<Moment>;
  readonly auto_close: bool;
}

/** @name ProposalState */
export interface ProposalState extends Enum {
  readonly isPending: boolean;
  readonly isCancelled: boolean;
  readonly isKilled: boolean;
  readonly isRejected: boolean;
  readonly isReferendum: boolean;
}

/** @name ProposalStatus */
export interface ProposalStatus extends Enum {
  readonly isInvalid: boolean;
  readonly isActiveOrExpired: boolean;
  readonly isExecutionSuccessful: boolean;
  readonly isExecutionFailed: boolean;
  readonly isRejected: boolean;
}

/** @name ProtocolOp */
export interface ProtocolOp extends Enum {
  readonly isAssetRegisterTicker: boolean;
  readonly isAssetIssue: boolean;
  readonly isAssetAddDocument: boolean;
  readonly isAssetCreateAsset: boolean;
  readonly isDividendNew: boolean;
  readonly isComplianceManagerAddComplianceRequirement: boolean;
  readonly isIdentityRegisterDid: boolean;
  readonly isIdentityCddRegisterDid: boolean;
  readonly isIdentityAddClaim: boolean;
  readonly isIdentitySetPrimaryKey: boolean;
  readonly isIdentityAddSecondaryKeysWithAuthorization: boolean;
  readonly isPipsPropose: boolean;
  readonly isVotingAddBallot: boolean;
}

/** @name ProverTickerKey */
export interface ProverTickerKey extends Struct {
  readonly prover: IdentityId;
  readonly ticker: Ticker;
}

/** @name Receipt */
export interface Receipt extends Struct {
  readonly receipt_uid: u64;
  readonly from: PortfolioId;
  readonly to: PortfolioId;
  readonly asset: Ticker;
  readonly amount: Balance;
}

/** @name ReceiptDetails */
export interface ReceiptDetails extends Struct {
  readonly receipt_uid: u64;
  readonly leg_id: u64;
  readonly signer: AccountId;
  readonly signature: OffChainSignature;
}

/** @name Referendum */
export interface Referendum extends Struct {
  readonly id: PipId;
  readonly state: ReferendumState;
  readonly referendum_type: ReferendumType;
  readonly enactment_period: u32;
}

/** @name ReferendumState */
export interface ReferendumState extends Enum {
  readonly isPending: boolean;
  readonly isScheduled: boolean;
  readonly isRejected: boolean;
  readonly isFailed: boolean;
  readonly isExecuted: boolean;
}

/** @name ReferendumType */
export interface ReferendumType extends Enum {
  readonly isFastTracked: boolean;
  readonly isEmergency: boolean;
  readonly isCommunity: boolean;
}

/** @name RestrictionResult */
export interface RestrictionResult extends Enum {
  readonly isValid: boolean;
  readonly isInvalid: boolean;
  readonly isForceValid: boolean;
}

/** @name Scope */
export interface Scope extends Enum {
  readonly isIdentity: boolean;
  readonly asIdentity: IdentityId;
  readonly isTicker: boolean;
  readonly asTicker: Ticker;
  readonly isCustom: boolean;
  readonly asCustom: Bytes;
}

/** @name ScopeId */
export interface ScopeId extends U8aFixed {}

/** @name SecondaryKey */
export interface SecondaryKey extends Struct {
  readonly signer: Signatory;
  readonly permissions: Vec<Permission>;
}

/** @name SecondaryKeyWithAuth */
export interface SecondaryKeyWithAuth extends Struct {
  readonly secondary_key: SecondaryKey;
  readonly auth_signature: Signature;
}

/** @name SecurityToken */
export interface SecurityToken extends Struct {
  readonly name: AssetName;
  readonly total_supply: Balance;
  readonly owner_did: IdentityId;
  readonly divisible: bool;
  readonly asset_type: AssetType;
  readonly primary_issuance_agent: Option<IdentityId>;
}

/** @name SettlementType */
export interface SettlementType extends Enum {
  readonly isSettleOnAuthorization: boolean;
  readonly isSettleOnBlock: boolean;
  readonly asSettleOnBlock: BlockNumber;
}

/** @name Signatory */
export interface Signatory extends Enum {
  readonly isIdentity: boolean;
  readonly asIdentity: IdentityId;
  readonly isAccount: boolean;
  readonly asAccount: AccountId;
}

/** @name SimpleTokenRecord */
export interface SimpleTokenRecord extends Struct {
  readonly ticker: Ticker;
  readonly total_supply: Balance;
  readonly owner_did: IdentityId;
}

/** @name SmartExtension */
export interface SmartExtension extends Struct {
  readonly extension_type: SmartExtensionType;
  readonly extension_name: SmartExtensionName;
  readonly extension_id: AccountId;
  readonly is_archive: bool;
}

/** @name SmartExtensionName */
export interface SmartExtensionName extends Text {}

/** @name SmartExtensionType */
export interface SmartExtensionType extends Enum {
  readonly isTransferManager: boolean;
  readonly isOfferings: boolean;
  readonly isCustom: boolean;
  readonly asCustom: Bytes;
}

/** @name STO */
export interface STO extends Struct {
  readonly beneficiary_did: IdentityId;
  readonly cap: Balance;
  readonly sold: Balance;
  readonly rate: u64;
  readonly start_date: Moment;
  readonly end_date: Moment;
  readonly active: bool;
}

/** @name TargetIdAuthorization */
export interface TargetIdAuthorization extends Struct {
  readonly target_id: IdentityId;
  readonly nonce: u64;
  readonly expires_at: Moment;
}

/** @name TargetIdentity */
export interface TargetIdentity extends Enum {
  readonly isPrimaryIssuanceAgent: boolean;
  readonly isSpecific: boolean;
  readonly asSpecific: IdentityId;
}

/** @name Ticker */
export interface Ticker extends U8aFixed {}

/** @name TickerRangeProof */
export interface TickerRangeProof extends Struct {
  readonly initial_message: U8aFixed;
  readonly final_response: Bytes;
  readonly max_two_exp: u32;
}

/** @name TickerRegistration */
export interface TickerRegistration extends Struct {
  readonly owner: IdentityId;
  readonly expiry: Option<Moment>;
}

/** @name TickerRegistrationConfig */
export interface TickerRegistrationConfig extends Struct {
  readonly max_ticker_length: u8;
  readonly registration_length: Option<Moment>;
}

/** @name TickerTransferApproval */
export interface TickerTransferApproval extends Struct {
  readonly authorized_by: IdentityId;
  readonly next_ticker: Option<Ticker>;
  readonly previous_ticker: Option<Ticker>;
}

/** @name UniqueCall */
export interface UniqueCall extends Struct {
  readonly nonce: u64;
  readonly call: Call;
}

/** @name Url */
export interface Url extends Text {}

/** @name Venue */
export interface Venue extends Struct {
  readonly creator: IdentityId;
  readonly instructions: Vec<u64>;
  readonly details: Bytes;
  readonly venue_type: VenueType;
}

/** @name VenueDetails */
export interface VenueDetails extends Text {}

/** @name VenueType */
export interface VenueType extends Enum {
  readonly isOther: boolean;
  readonly isDistribution: boolean;
  readonly isSto: boolean;
  readonly isExchange: boolean;
}

/** @name Vote */
export interface Vote extends ITuple<[bool, Balance]> {}

/** @name VoteByPip */
export interface VoteByPip extends Struct {
  readonly pip: PipId;
  readonly vote: Vote;
}

/** @name VoteCount */
export interface VoteCount extends Enum {
  readonly isProposalFound: boolean;
  readonly asProposalFound: VoteCountProposalFound;
  readonly isProposalNotFound: boolean;
  readonly asProposalNotFound: Bytes;
}

/** @name VoteCountProposalFound */
export interface VoteCountProposalFound extends Struct {
  readonly ayes: u64;
  readonly nays: u64;
}

/** @name VotingResult */
export interface VotingResult extends Struct {
  readonly ayes_count: u32;
  readonly ayes_stake: Balance;
  readonly nays_count: u32;
  readonly nays_stake: Balance;
}

/** @name WeightToFeeCoefficient */
export interface WeightToFeeCoefficient extends Struct {
  readonly coeffInteger: Balance;
  readonly coeffFrac: Perbill;
  readonly negative: bool;
  readonly degree: u8;
}

export type PHANTOM_POLYMESH = 'polymesh';
