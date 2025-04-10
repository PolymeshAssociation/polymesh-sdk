// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import '@polkadot/types/types/registry';

import type {
  FinalityGrandpaEquivocationPrecommit,
  FinalityGrandpaEquivocationPrevote,
  FinalityGrandpaPrecommit,
  FinalityGrandpaPrevote,
  FrameSupportDispatchDispatchClass,
  FrameSupportDispatchDispatchInfo,
  FrameSupportDispatchPays,
  FrameSupportDispatchPerDispatchClassU32,
  FrameSupportDispatchPerDispatchClassWeight,
  FrameSupportDispatchPerDispatchClassWeightsPerClass,
  FrameSupportDispatchRawOrigin,
  FrameSupportPreimagesBounded,
  FrameSupportTokensMiscBalanceStatus,
  FrameSystemAccountInfo,
  FrameSystemCall,
  FrameSystemError,
  FrameSystemEvent,
  FrameSystemEventRecord,
  FrameSystemExtensionsCheckGenesis,
  FrameSystemExtensionsCheckNonce,
  FrameSystemExtensionsCheckSpecVersion,
  FrameSystemExtensionsCheckTxVersion,
  FrameSystemExtensionsCheckWeight,
  FrameSystemLastRuntimeUpgradeInfo,
  FrameSystemLimitsBlockLength,
  FrameSystemLimitsBlockWeights,
  FrameSystemLimitsWeightsPerClass,
  FrameSystemPhase,
  PalletAssetAssetDetails,
  PalletAssetCall,
  PalletAssetCheckpointPalletCall,
  PalletAssetCheckpointPalletError,
  PalletAssetCheckpointPalletEvent,
  PalletAssetError,
  PalletAssetEvent,
  PalletAssetTickerRegistration,
  PalletAssetTickerRegistrationConfig,
  PalletBabeCall,
  PalletBabeError,
  PalletBalancesAccountData,
  PalletBalancesBalanceLock,
  PalletBalancesCall,
  PalletBalancesError,
  PalletBalancesEvent,
  PalletBalancesReasons,
  PalletBaseCall,
  PalletBaseError,
  PalletBaseEvent,
  PalletBridgeBridgeTxDetail,
  PalletBridgeBridgeTxStatus,
  PalletCommitteeCall,
  PalletCommitteeError,
  PalletCommitteeEvent,
  PalletCommitteePolymeshVotes,
  PalletCommitteeRawOrigin,
  PalletComplianceManagerCall,
  PalletComplianceManagerError,
  PalletComplianceManagerEvent,
  PalletContractsCall,
  PalletContractsError,
  PalletContractsEvent,
  PalletContractsSchedule,
  PalletContractsScheduleHostFnWeights,
  PalletContractsScheduleInstructionWeights,
  PalletContractsScheduleLimits,
  PalletContractsStorageContractInfo,
  PalletContractsStorageDeletedContract,
  PalletContractsWasmDeterminism,
  PalletContractsWasmOwnerInfo,
  PalletContractsWasmPrefabWasmModule,
  PalletCorporateActionsBallotBallotMeta,
  PalletCorporateActionsBallotBallotTimeRange,
  PalletCorporateActionsBallotBallotVote,
  PalletCorporateActionsBallotMotion,
  PalletCorporateActionsBallotPalletCall,
  PalletCorporateActionsBallotPalletError,
  PalletCorporateActionsBallotPalletEvent,
  PalletCorporateActionsCaCheckpoint,
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsCall,
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
  PalletCorporateActionsDistributionPalletCall,
  PalletCorporateActionsDistributionPalletError,
  PalletCorporateActionsDistributionPalletEvent,
  PalletCorporateActionsError,
  PalletCorporateActionsEvent,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PalletCorporateActionsRecordDate,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletCorporateActionsTargetTreatment,
  PalletElectionProviderMultiPhaseCall,
  PalletElectionProviderMultiPhaseElectionCompute,
  PalletElectionProviderMultiPhaseError,
  PalletElectionProviderMultiPhaseEvent,
  PalletElectionProviderMultiPhasePhase,
  PalletElectionProviderMultiPhaseRawSolution,
  PalletElectionProviderMultiPhaseReadySolution,
  PalletElectionProviderMultiPhaseRoundSnapshot,
  PalletElectionProviderMultiPhaseSignedSignedSubmission,
  PalletElectionProviderMultiPhaseSolutionOrSnapshotSize,
  PalletExternalAgentsCall,
  PalletExternalAgentsError,
  PalletExternalAgentsEvent,
  PalletGrandpaCall,
  PalletGrandpaError,
  PalletGrandpaEvent,
  PalletGrandpaStoredPendingChange,
  PalletGrandpaStoredState,
  PalletGroupCall,
  PalletGroupError,
  PalletGroupEvent,
  PalletIdentityCall,
  PalletIdentityClaim1stKey,
  PalletIdentityClaim2ndKey,
  PalletIdentityError,
  PalletIdentityEvent,
  PalletImOnlineBoundedOpaqueNetworkState,
  PalletImOnlineCall,
  PalletImOnlineError,
  PalletImOnlineEvent,
  PalletImOnlineHeartbeat,
  PalletImOnlineSr25519AppSr25519Public,
  PalletImOnlineSr25519AppSr25519Signature,
  PalletIndicesCall,
  PalletIndicesError,
  PalletIndicesEvent,
  PalletMultisigCall,
  PalletMultisigError,
  PalletMultisigEvent,
  PalletNftCall,
  PalletNftError,
  PalletNftEvent,
  PalletOffencesEvent,
  PalletPermissionsError,
  PalletPermissionsStoreCallMetadata,
  PalletPipsCall,
  PalletPipsCommittee,
  PalletPipsDepositInfo,
  PalletPipsError,
  PalletPipsEvent,
  PalletPipsPip,
  PalletPipsPipsMetadata,
  PalletPipsProposalData,
  PalletPipsProposalState,
  PalletPipsProposer,
  PalletPipsSnapshotMetadata,
  PalletPipsSnapshotResult,
  PalletPipsSnapshottedPip,
  PalletPipsVote,
  PalletPipsVotingResult,
  PalletPortfolioCall,
  PalletPortfolioError,
  PalletPortfolioEvent,
  PalletPreimageCall,
  PalletPreimageError,
  PalletPreimageEvent,
  PalletPreimageRequestStatus,
  PalletProtocolFeeCall,
  PalletProtocolFeeError,
  PalletProtocolFeeEvent,
  PalletRelayerCall,
  PalletRelayerError,
  PalletRelayerEvent,
  PalletRelayerSubsidy,
  PalletSchedulerCall,
  PalletSchedulerError,
  PalletSchedulerEvent,
  PalletSchedulerScheduled,
  PalletSessionCall,
  PalletSessionError,
  PalletSessionEvent,
  PalletSettlementCall,
  PalletSettlementError,
  PalletSettlementEvent,
  PalletStakingActiveEraInfo,
  PalletStakingEraRewardPoints,
  PalletStakingExposure,
  PalletStakingForcing,
  PalletStakingIndividualExposure,
  PalletStakingNominations,
  PalletStakingPalletCall,
  PalletStakingPalletConfigOpPerbill,
  PalletStakingPalletConfigOpPercent,
  PalletStakingPalletConfigOpU128,
  PalletStakingPalletConfigOpU32,
  PalletStakingPalletError,
  PalletStakingPalletEvent,
  PalletStakingPermissionedIdentityPrefs,
  PalletStakingRewardDestination,
  PalletStakingSlashingSlashingSpans,
  PalletStakingSlashingSpanRecord,
  PalletStakingSlashingSwitch,
  PalletStakingStakingLedger,
  PalletStakingUnappliedSlash,
  PalletStakingUnlockChunk,
  PalletStakingValidatorPrefs,
  PalletStatisticsCall,
  PalletStatisticsError,
  PalletStatisticsEvent,
  PalletStoCall,
  PalletStoError,
  PalletStoEvent,
  PalletStoFundraiser,
  PalletStoFundraiserStatus,
  PalletStoFundraiserTier,
  PalletStoPriceTier,
  PalletSudoCall,
  PalletSudoError,
  PalletSudoEvent,
  PalletTimestampCall,
  PalletTransactionPaymentCall,
  PalletTransactionPaymentChargeTransactionPayment,
  PalletTransactionPaymentEvent,
  PalletTransactionPaymentReleases,
  PalletTreasuryCall,
  PalletTreasuryError,
  PalletTreasuryEvent,
  PalletUtilityCall,
  PalletUtilityError,
  PalletUtilityEvent,
  PalletUtilityUniqueCall,
  PolymeshCommonUtilitiesCheckpointNextCheckpoints,
  PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
  PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth,
  PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshContractsApi,
  PolymeshContractsApiCodeHash,
  PolymeshContractsCall,
  PolymeshContractsChainExtensionExtrinsicId,
  PolymeshContractsChainVersion,
  PolymeshContractsError,
  PolymeshContractsEvent,
  PolymeshContractsNextUpgrade,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesAssetNonFungibleType,
  PolymeshPrimitivesAuthorization,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesBeneficiary,
  PolymeshPrimitivesCddId,
  PolymeshPrimitivesComplianceManagerAssetCompliance,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesConditionConditionType,
  PolymeshPrimitivesConditionTargetIdentity,
  PolymeshPrimitivesConditionTrustedFor,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesDocumentHash,
  PolymeshPrimitivesEventOnly,
  PolymeshPrimitivesGroupInactiveMember,
  PolymeshPrimitivesIdentityClaim,
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityClaimScope,
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesIdentityIdPortfolioKind,
  PolymeshPrimitivesJurisdictionCountryCode,
  PolymeshPrimitivesMaybeBlock,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesMultisigProposalState,
  PolymeshPrimitivesMultisigProposalVoteCount,
  PolymeshPrimitivesNftNfTs,
  PolymeshPrimitivesNftNftCollection,
  PolymeshPrimitivesNftNftCollectionKeys,
  PolymeshPrimitivesNftNftMetadataAttribute,
  PolymeshPrimitivesPortfolioFund,
  PolymeshPrimitivesPortfolioFundDescription,
  PolymeshPrimitivesPortfolioPortfolioUpdateReason,
  PolymeshPrimitivesPosRatio,
  PolymeshPrimitivesSecondaryKey,
  PolymeshPrimitivesSecondaryKeyExtrinsicPermissions,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesSecondaryKeyPalletPermissions,
  PolymeshPrimitivesSecondaryKeyPermissions,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesSettlementAffirmationCount,
  PolymeshPrimitivesSettlementAffirmationStatus,
  PolymeshPrimitivesSettlementAssetCount,
  PolymeshPrimitivesSettlementInstruction,
  PolymeshPrimitivesSettlementInstructionStatus,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementLegStatus,
  PolymeshPrimitivesSettlementMediatorAffirmationStatus,
  PolymeshPrimitivesSettlementReceiptDetails,
  PolymeshPrimitivesSettlementReceiptMetadata,
  PolymeshPrimitivesSettlementSettlementType,
  PolymeshPrimitivesSettlementVenue,
  PolymeshPrimitivesSettlementVenueType,
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatClaim,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesSubsetSubsetRestrictionAssetId,
  PolymeshPrimitivesSubsetSubsetRestrictionExtrinsicName,
  PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
  PolymeshPrimitivesTransferComplianceTransferCondition,
  PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
  PolymeshRuntimeCommonNposSolution16,
  PolymeshRuntimeDevelopRuntime,
  PolymeshRuntimeDevelopRuntimeOriginCaller,
  PolymeshRuntimeDevelopRuntimeSessionKeys,
  SpArithmeticArithmeticError,
  SpAuthorityDiscoveryAppPublic,
  SpConsensusBabeAllowedSlots,
  SpConsensusBabeAppPublic,
  SpConsensusBabeBabeEpochConfiguration,
  SpConsensusBabeDigestsNextConfigDescriptor,
  SpConsensusBabeDigestsPreDigest,
  SpConsensusBabeDigestsPrimaryPreDigest,
  SpConsensusBabeDigestsSecondaryPlainPreDigest,
  SpConsensusBabeDigestsSecondaryVRFPreDigest,
  SpConsensusGrandpaAppPublic,
  SpConsensusGrandpaAppSignature,
  SpConsensusGrandpaEquivocation,
  SpConsensusGrandpaEquivocationProof,
  SpConsensusSlotsEquivocationProof,
  SpCoreCryptoKeyTypeId,
  SpCoreEcdsaSignature,
  SpCoreEd25519Public,
  SpCoreEd25519Signature,
  SpCoreOffchainOpaqueNetworkState,
  SpCoreSr25519Public,
  SpCoreSr25519Signature,
  SpCoreVoid,
  SpNposElectionsElectionScore,
  SpNposElectionsSupport,
  SpRuntimeBlakeTwo256,
  SpRuntimeDigest,
  SpRuntimeDigestDigestItem,
  SpRuntimeDispatchError,
  SpRuntimeHeader,
  SpRuntimeModuleError,
  SpRuntimeMultiSignature,
  SpRuntimeTokenError,
  SpRuntimeTransactionalError,
  SpSessionMembershipProof,
  SpStakingOffenceOffenceDetails,
  SpVersionRuntimeVersion,
  SpWeightsRuntimeDbWeight,
  SpWeightsWeightToFeeCoefficient,
  SpWeightsWeightV2Weight,
} from '@polkadot/types/lookup';

declare module '@polkadot/types/types/registry' {
  interface InterfaceTypes {
    FinalityGrandpaEquivocationPrecommit: FinalityGrandpaEquivocationPrecommit;
    FinalityGrandpaEquivocationPrevote: FinalityGrandpaEquivocationPrevote;
    FinalityGrandpaPrecommit: FinalityGrandpaPrecommit;
    FinalityGrandpaPrevote: FinalityGrandpaPrevote;
    FrameSupportDispatchDispatchClass: FrameSupportDispatchDispatchClass;
    FrameSupportDispatchDispatchInfo: FrameSupportDispatchDispatchInfo;
    FrameSupportDispatchPays: FrameSupportDispatchPays;
    FrameSupportDispatchPerDispatchClassU32: FrameSupportDispatchPerDispatchClassU32;
    FrameSupportDispatchPerDispatchClassWeight: FrameSupportDispatchPerDispatchClassWeight;
    FrameSupportDispatchPerDispatchClassWeightsPerClass: FrameSupportDispatchPerDispatchClassWeightsPerClass;
    FrameSupportDispatchRawOrigin: FrameSupportDispatchRawOrigin;
    FrameSupportPreimagesBounded: FrameSupportPreimagesBounded;
    FrameSupportTokensMiscBalanceStatus: FrameSupportTokensMiscBalanceStatus;
    FrameSystemAccountInfo: FrameSystemAccountInfo;
    FrameSystemCall: FrameSystemCall;
    FrameSystemError: FrameSystemError;
    FrameSystemEvent: FrameSystemEvent;
    FrameSystemEventRecord: FrameSystemEventRecord;
    FrameSystemExtensionsCheckGenesis: FrameSystemExtensionsCheckGenesis;
    FrameSystemExtensionsCheckNonce: FrameSystemExtensionsCheckNonce;
    FrameSystemExtensionsCheckSpecVersion: FrameSystemExtensionsCheckSpecVersion;
    FrameSystemExtensionsCheckTxVersion: FrameSystemExtensionsCheckTxVersion;
    FrameSystemExtensionsCheckWeight: FrameSystemExtensionsCheckWeight;
    FrameSystemLastRuntimeUpgradeInfo: FrameSystemLastRuntimeUpgradeInfo;
    FrameSystemLimitsBlockLength: FrameSystemLimitsBlockLength;
    FrameSystemLimitsBlockWeights: FrameSystemLimitsBlockWeights;
    FrameSystemLimitsWeightsPerClass: FrameSystemLimitsWeightsPerClass;
    FrameSystemPhase: FrameSystemPhase;
    PalletAssetAssetDetails: PalletAssetAssetDetails;
    PalletAssetCall: PalletAssetCall;
    PalletAssetCheckpointPalletCall: PalletAssetCheckpointPalletCall;
    PalletAssetCheckpointPalletError: PalletAssetCheckpointPalletError;
    PalletAssetCheckpointPalletEvent: PalletAssetCheckpointPalletEvent;
    PalletAssetError: PalletAssetError;
    PalletAssetEvent: PalletAssetEvent;
    PalletAssetTickerRegistration: PalletAssetTickerRegistration;
    PalletAssetTickerRegistrationConfig: PalletAssetTickerRegistrationConfig;
    PalletBabeCall: PalletBabeCall;
    PalletBabeError: PalletBabeError;
    PalletBalancesAccountData: PalletBalancesAccountData;
    PalletBalancesBalanceLock: PalletBalancesBalanceLock;
    PalletBalancesCall: PalletBalancesCall;
    PalletBalancesError: PalletBalancesError;
    PalletBalancesEvent: PalletBalancesEvent;
    PalletBalancesReasons: PalletBalancesReasons;
    PalletBaseCall: PalletBaseCall;
    PalletBaseError: PalletBaseError;
    PalletBaseEvent: PalletBaseEvent;
    PalletBridgeBridgeTxDetail: PalletBridgeBridgeTxDetail;
    PalletBridgeBridgeTxStatus: PalletBridgeBridgeTxStatus;
    PalletCommitteeCall: PalletCommitteeCall;
    PalletCommitteeError: PalletCommitteeError;
    PalletCommitteeEvent: PalletCommitteeEvent;
    PalletCommitteePolymeshVotes: PalletCommitteePolymeshVotes;
    PalletCommitteeRawOrigin: PalletCommitteeRawOrigin;
    PalletComplianceManagerCall: PalletComplianceManagerCall;
    PalletComplianceManagerError: PalletComplianceManagerError;
    PalletComplianceManagerEvent: PalletComplianceManagerEvent;
    PalletContractsCall: PalletContractsCall;
    PalletContractsError: PalletContractsError;
    PalletContractsEvent: PalletContractsEvent;
    PalletContractsSchedule: PalletContractsSchedule;
    PalletContractsScheduleHostFnWeights: PalletContractsScheduleHostFnWeights;
    PalletContractsScheduleInstructionWeights: PalletContractsScheduleInstructionWeights;
    PalletContractsScheduleLimits: PalletContractsScheduleLimits;
    PalletContractsStorageContractInfo: PalletContractsStorageContractInfo;
    PalletContractsStorageDeletedContract: PalletContractsStorageDeletedContract;
    PalletContractsWasmDeterminism: PalletContractsWasmDeterminism;
    PalletContractsWasmOwnerInfo: PalletContractsWasmOwnerInfo;
    PalletContractsWasmPrefabWasmModule: PalletContractsWasmPrefabWasmModule;
    PalletCorporateActionsBallotBallotMeta: PalletCorporateActionsBallotBallotMeta;
    PalletCorporateActionsBallotBallotTimeRange: PalletCorporateActionsBallotBallotTimeRange;
    PalletCorporateActionsBallotBallotVote: PalletCorporateActionsBallotBallotVote;
    PalletCorporateActionsBallotMotion: PalletCorporateActionsBallotMotion;
    PalletCorporateActionsBallotPalletCall: PalletCorporateActionsBallotPalletCall;
    PalletCorporateActionsBallotPalletError: PalletCorporateActionsBallotPalletError;
    PalletCorporateActionsBallotPalletEvent: PalletCorporateActionsBallotPalletEvent;
    PalletCorporateActionsCaCheckpoint: PalletCorporateActionsCaCheckpoint;
    PalletCorporateActionsCaId: PalletCorporateActionsCaId;
    PalletCorporateActionsCaKind: PalletCorporateActionsCaKind;
    PalletCorporateActionsCall: PalletCorporateActionsCall;
    PalletCorporateActionsCorporateAction: PalletCorporateActionsCorporateAction;
    PalletCorporateActionsDistribution: PalletCorporateActionsDistribution;
    PalletCorporateActionsDistributionPalletCall: PalletCorporateActionsDistributionPalletCall;
    PalletCorporateActionsDistributionPalletError: PalletCorporateActionsDistributionPalletError;
    PalletCorporateActionsDistributionPalletEvent: PalletCorporateActionsDistributionPalletEvent;
    PalletCorporateActionsError: PalletCorporateActionsError;
    PalletCorporateActionsEvent: PalletCorporateActionsEvent;
    PalletCorporateActionsInitiateCorporateActionArgs: PalletCorporateActionsInitiateCorporateActionArgs;
    PalletCorporateActionsRecordDate: PalletCorporateActionsRecordDate;
    PalletCorporateActionsRecordDateSpec: PalletCorporateActionsRecordDateSpec;
    PalletCorporateActionsTargetIdentities: PalletCorporateActionsTargetIdentities;
    PalletCorporateActionsTargetTreatment: PalletCorporateActionsTargetTreatment;
    PalletElectionProviderMultiPhaseCall: PalletElectionProviderMultiPhaseCall;
    PalletElectionProviderMultiPhaseElectionCompute: PalletElectionProviderMultiPhaseElectionCompute;
    PalletElectionProviderMultiPhaseError: PalletElectionProviderMultiPhaseError;
    PalletElectionProviderMultiPhaseEvent: PalletElectionProviderMultiPhaseEvent;
    PalletElectionProviderMultiPhasePhase: PalletElectionProviderMultiPhasePhase;
    PalletElectionProviderMultiPhaseRawSolution: PalletElectionProviderMultiPhaseRawSolution;
    PalletElectionProviderMultiPhaseReadySolution: PalletElectionProviderMultiPhaseReadySolution;
    PalletElectionProviderMultiPhaseRoundSnapshot: PalletElectionProviderMultiPhaseRoundSnapshot;
    PalletElectionProviderMultiPhaseSignedSignedSubmission: PalletElectionProviderMultiPhaseSignedSignedSubmission;
    PalletElectionProviderMultiPhaseSolutionOrSnapshotSize: PalletElectionProviderMultiPhaseSolutionOrSnapshotSize;
    PalletExternalAgentsCall: PalletExternalAgentsCall;
    PalletExternalAgentsError: PalletExternalAgentsError;
    PalletExternalAgentsEvent: PalletExternalAgentsEvent;
    PalletGrandpaCall: PalletGrandpaCall;
    PalletGrandpaError: PalletGrandpaError;
    PalletGrandpaEvent: PalletGrandpaEvent;
    PalletGrandpaStoredPendingChange: PalletGrandpaStoredPendingChange;
    PalletGrandpaStoredState: PalletGrandpaStoredState;
    PalletGroupCall: PalletGroupCall;
    PalletGroupError: PalletGroupError;
    PalletGroupEvent: PalletGroupEvent;
    PalletIdentityCall: PalletIdentityCall;
    PalletIdentityClaim1stKey: PalletIdentityClaim1stKey;
    PalletIdentityClaim2ndKey: PalletIdentityClaim2ndKey;
    PalletIdentityError: PalletIdentityError;
    PalletIdentityEvent: PalletIdentityEvent;
    PalletImOnlineBoundedOpaqueNetworkState: PalletImOnlineBoundedOpaqueNetworkState;
    PalletImOnlineCall: PalletImOnlineCall;
    PalletImOnlineError: PalletImOnlineError;
    PalletImOnlineEvent: PalletImOnlineEvent;
    PalletImOnlineHeartbeat: PalletImOnlineHeartbeat;
    PalletImOnlineSr25519AppSr25519Public: PalletImOnlineSr25519AppSr25519Public;
    PalletImOnlineSr25519AppSr25519Signature: PalletImOnlineSr25519AppSr25519Signature;
    PalletIndicesCall: PalletIndicesCall;
    PalletIndicesError: PalletIndicesError;
    PalletIndicesEvent: PalletIndicesEvent;
    PalletMultisigCall: PalletMultisigCall;
    PalletMultisigError: PalletMultisigError;
    PalletMultisigEvent: PalletMultisigEvent;
    PalletNftCall: PalletNftCall;
    PalletNftError: PalletNftError;
    PalletNftEvent: PalletNftEvent;
    PalletOffencesEvent: PalletOffencesEvent;
    PalletPermissionsError: PalletPermissionsError;
    PalletPermissionsStoreCallMetadata: PalletPermissionsStoreCallMetadata;
    PalletPipsCall: PalletPipsCall;
    PalletPipsCommittee: PalletPipsCommittee;
    PalletPipsDepositInfo: PalletPipsDepositInfo;
    PalletPipsError: PalletPipsError;
    PalletPipsEvent: PalletPipsEvent;
    PalletPipsPip: PalletPipsPip;
    PalletPipsPipsMetadata: PalletPipsPipsMetadata;
    PalletPipsProposalData: PalletPipsProposalData;
    PalletPipsProposalState: PalletPipsProposalState;
    PalletPipsProposer: PalletPipsProposer;
    PalletPipsSnapshotMetadata: PalletPipsSnapshotMetadata;
    PalletPipsSnapshotResult: PalletPipsSnapshotResult;
    PalletPipsSnapshottedPip: PalletPipsSnapshottedPip;
    PalletPipsVote: PalletPipsVote;
    PalletPipsVotingResult: PalletPipsVotingResult;
    PalletPortfolioCall: PalletPortfolioCall;
    PalletPortfolioError: PalletPortfolioError;
    PalletPortfolioEvent: PalletPortfolioEvent;
    PalletPreimageCall: PalletPreimageCall;
    PalletPreimageError: PalletPreimageError;
    PalletPreimageEvent: PalletPreimageEvent;
    PalletPreimageRequestStatus: PalletPreimageRequestStatus;
    PalletProtocolFeeCall: PalletProtocolFeeCall;
    PalletProtocolFeeError: PalletProtocolFeeError;
    PalletProtocolFeeEvent: PalletProtocolFeeEvent;
    PalletRelayerCall: PalletRelayerCall;
    PalletRelayerError: PalletRelayerError;
    PalletRelayerEvent: PalletRelayerEvent;
    PalletRelayerSubsidy: PalletRelayerSubsidy;
    PalletSchedulerCall: PalletSchedulerCall;
    PalletSchedulerError: PalletSchedulerError;
    PalletSchedulerEvent: PalletSchedulerEvent;
    PalletSchedulerScheduled: PalletSchedulerScheduled;
    PalletSessionCall: PalletSessionCall;
    PalletSessionError: PalletSessionError;
    PalletSessionEvent: PalletSessionEvent;
    PalletSettlementCall: PalletSettlementCall;
    PalletSettlementError: PalletSettlementError;
    PalletSettlementEvent: PalletSettlementEvent;
    PalletStakingActiveEraInfo: PalletStakingActiveEraInfo;
    PalletStakingEraRewardPoints: PalletStakingEraRewardPoints;
    PalletStakingExposure: PalletStakingExposure;
    PalletStakingForcing: PalletStakingForcing;
    PalletStakingIndividualExposure: PalletStakingIndividualExposure;
    PalletStakingNominations: PalletStakingNominations;
    PalletStakingPalletCall: PalletStakingPalletCall;
    PalletStakingPalletConfigOpPerbill: PalletStakingPalletConfigOpPerbill;
    PalletStakingPalletConfigOpPercent: PalletStakingPalletConfigOpPercent;
    PalletStakingPalletConfigOpU128: PalletStakingPalletConfigOpU128;
    PalletStakingPalletConfigOpU32: PalletStakingPalletConfigOpU32;
    PalletStakingPalletError: PalletStakingPalletError;
    PalletStakingPalletEvent: PalletStakingPalletEvent;
    PalletStakingPermissionedIdentityPrefs: PalletStakingPermissionedIdentityPrefs;
    PalletStakingRewardDestination: PalletStakingRewardDestination;
    PalletStakingSlashingSlashingSpans: PalletStakingSlashingSlashingSpans;
    PalletStakingSlashingSpanRecord: PalletStakingSlashingSpanRecord;
    PalletStakingSlashingSwitch: PalletStakingSlashingSwitch;
    PalletStakingStakingLedger: PalletStakingStakingLedger;
    PalletStakingUnappliedSlash: PalletStakingUnappliedSlash;
    PalletStakingUnlockChunk: PalletStakingUnlockChunk;
    PalletStakingValidatorPrefs: PalletStakingValidatorPrefs;
    PalletStatisticsCall: PalletStatisticsCall;
    PalletStatisticsError: PalletStatisticsError;
    PalletStatisticsEvent: PalletStatisticsEvent;
    PalletStoCall: PalletStoCall;
    PalletStoError: PalletStoError;
    PalletStoEvent: PalletStoEvent;
    PalletStoFundraiser: PalletStoFundraiser;
    PalletStoFundraiserStatus: PalletStoFundraiserStatus;
    PalletStoFundraiserTier: PalletStoFundraiserTier;
    PalletStoPriceTier: PalletStoPriceTier;
    PalletSudoCall: PalletSudoCall;
    PalletSudoError: PalletSudoError;
    PalletSudoEvent: PalletSudoEvent;
    PalletTimestampCall: PalletTimestampCall;
    PalletTransactionPaymentCall: PalletTransactionPaymentCall;
    PalletTransactionPaymentChargeTransactionPayment: PalletTransactionPaymentChargeTransactionPayment;
    PalletTransactionPaymentEvent: PalletTransactionPaymentEvent;
    PalletTransactionPaymentReleases: PalletTransactionPaymentReleases;
    PalletTreasuryCall: PalletTreasuryCall;
    PalletTreasuryError: PalletTreasuryError;
    PalletTreasuryEvent: PalletTreasuryEvent;
    PalletUtilityCall: PalletUtilityCall;
    PalletUtilityError: PalletUtilityError;
    PalletUtilityEvent: PalletUtilityEvent;
    PalletUtilityUniqueCall: PalletUtilityUniqueCall;
    PolymeshCommonUtilitiesCheckpointNextCheckpoints: PolymeshCommonUtilitiesCheckpointNextCheckpoints;
    PolymeshCommonUtilitiesCheckpointScheduleCheckpoints: PolymeshCommonUtilitiesCheckpointScheduleCheckpoints;
    PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth: PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth;
    PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth: PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth;
    PolymeshCommonUtilitiesProtocolFeeProtocolOp: PolymeshCommonUtilitiesProtocolFeeProtocolOp;
    PolymeshContractsApi: PolymeshContractsApi;
    PolymeshContractsApiCodeHash: PolymeshContractsApiCodeHash;
    PolymeshContractsCall: PolymeshContractsCall;
    PolymeshContractsChainExtensionExtrinsicId: PolymeshContractsChainExtensionExtrinsicId;
    PolymeshContractsChainVersion: PolymeshContractsChainVersion;
    PolymeshContractsError: PolymeshContractsError;
    PolymeshContractsEvent: PolymeshContractsEvent;
    PolymeshContractsNextUpgrade: PolymeshContractsNextUpgrade;
    PolymeshPrimitivesAgentAgentGroup: PolymeshPrimitivesAgentAgentGroup;
    PolymeshPrimitivesAssetAssetId: PolymeshPrimitivesAssetAssetId;
    PolymeshPrimitivesAssetAssetType: PolymeshPrimitivesAssetAssetType;
    PolymeshPrimitivesAssetIdentifier: PolymeshPrimitivesAssetIdentifier;
    PolymeshPrimitivesAssetMetadataAssetMetadataKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey;
    PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus: PolymeshPrimitivesAssetMetadataAssetMetadataLockStatus;
    PolymeshPrimitivesAssetMetadataAssetMetadataSpec: PolymeshPrimitivesAssetMetadataAssetMetadataSpec;
    PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail: PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail;
    PolymeshPrimitivesAssetNonFungibleType: PolymeshPrimitivesAssetNonFungibleType;
    PolymeshPrimitivesAuthorization: PolymeshPrimitivesAuthorization;
    PolymeshPrimitivesAuthorizationAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;
    PolymeshPrimitivesBeneficiary: PolymeshPrimitivesBeneficiary;
    PolymeshPrimitivesCddId: PolymeshPrimitivesCddId;
    PolymeshPrimitivesComplianceManagerAssetCompliance: PolymeshPrimitivesComplianceManagerAssetCompliance;
    PolymeshPrimitivesComplianceManagerComplianceRequirement: PolymeshPrimitivesComplianceManagerComplianceRequirement;
    PolymeshPrimitivesCondition: PolymeshPrimitivesCondition;
    PolymeshPrimitivesConditionConditionType: PolymeshPrimitivesConditionConditionType;
    PolymeshPrimitivesConditionTargetIdentity: PolymeshPrimitivesConditionTargetIdentity;
    PolymeshPrimitivesConditionTrustedFor: PolymeshPrimitivesConditionTrustedFor;
    PolymeshPrimitivesConditionTrustedIssuer: PolymeshPrimitivesConditionTrustedIssuer;
    PolymeshPrimitivesDocument: PolymeshPrimitivesDocument;
    PolymeshPrimitivesDocumentHash: PolymeshPrimitivesDocumentHash;
    PolymeshPrimitivesEventOnly: PolymeshPrimitivesEventOnly;
    PolymeshPrimitivesGroupInactiveMember: PolymeshPrimitivesGroupInactiveMember;
    PolymeshPrimitivesIdentityClaim: PolymeshPrimitivesIdentityClaim;
    PolymeshPrimitivesIdentityClaimClaim: PolymeshPrimitivesIdentityClaimClaim;
    PolymeshPrimitivesIdentityClaimClaimType: PolymeshPrimitivesIdentityClaimClaimType;
    PolymeshPrimitivesIdentityClaimScope: PolymeshPrimitivesIdentityClaimScope;
    PolymeshPrimitivesIdentityDidRecord: PolymeshPrimitivesIdentityDidRecord;
    PolymeshPrimitivesIdentityId: PolymeshPrimitivesIdentityId;
    PolymeshPrimitivesIdentityIdPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
    PolymeshPrimitivesIdentityIdPortfolioKind: PolymeshPrimitivesIdentityIdPortfolioKind;
    PolymeshPrimitivesJurisdictionCountryCode: PolymeshPrimitivesJurisdictionCountryCode;
    PolymeshPrimitivesMaybeBlock: PolymeshPrimitivesMaybeBlock;
    PolymeshPrimitivesMemo: PolymeshPrimitivesMemo;
    PolymeshPrimitivesMultisigProposalState: PolymeshPrimitivesMultisigProposalState;
    PolymeshPrimitivesMultisigProposalVoteCount: PolymeshPrimitivesMultisigProposalVoteCount;
    PolymeshPrimitivesNftNfTs: PolymeshPrimitivesNftNfTs;
    PolymeshPrimitivesNftNftCollection: PolymeshPrimitivesNftNftCollection;
    PolymeshPrimitivesNftNftCollectionKeys: PolymeshPrimitivesNftNftCollectionKeys;
    PolymeshPrimitivesNftNftMetadataAttribute: PolymeshPrimitivesNftNftMetadataAttribute;
    PolymeshPrimitivesPortfolioFund: PolymeshPrimitivesPortfolioFund;
    PolymeshPrimitivesPortfolioFundDescription: PolymeshPrimitivesPortfolioFundDescription;
    PolymeshPrimitivesPortfolioPortfolioUpdateReason: PolymeshPrimitivesPortfolioPortfolioUpdateReason;
    PolymeshPrimitivesPosRatio: PolymeshPrimitivesPosRatio;
    PolymeshPrimitivesSecondaryKey: PolymeshPrimitivesSecondaryKey;
    PolymeshPrimitivesSecondaryKeyExtrinsicPermissions: PolymeshPrimitivesSecondaryKeyExtrinsicPermissions;
    PolymeshPrimitivesSecondaryKeyKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
    PolymeshPrimitivesSecondaryKeyPalletPermissions: PolymeshPrimitivesSecondaryKeyPalletPermissions;
    PolymeshPrimitivesSecondaryKeyPermissions: PolymeshPrimitivesSecondaryKeyPermissions;
    PolymeshPrimitivesSecondaryKeySignatory: PolymeshPrimitivesSecondaryKeySignatory;
    PolymeshPrimitivesSettlementAffirmationCount: PolymeshPrimitivesSettlementAffirmationCount;
    PolymeshPrimitivesSettlementAffirmationStatus: PolymeshPrimitivesSettlementAffirmationStatus;
    PolymeshPrimitivesSettlementAssetCount: PolymeshPrimitivesSettlementAssetCount;
    PolymeshPrimitivesSettlementInstruction: PolymeshPrimitivesSettlementInstruction;
    PolymeshPrimitivesSettlementInstructionStatus: PolymeshPrimitivesSettlementInstructionStatus;
    PolymeshPrimitivesSettlementLeg: PolymeshPrimitivesSettlementLeg;
    PolymeshPrimitivesSettlementLegStatus: PolymeshPrimitivesSettlementLegStatus;
    PolymeshPrimitivesSettlementMediatorAffirmationStatus: PolymeshPrimitivesSettlementMediatorAffirmationStatus;
    PolymeshPrimitivesSettlementReceiptDetails: PolymeshPrimitivesSettlementReceiptDetails;
    PolymeshPrimitivesSettlementReceiptMetadata: PolymeshPrimitivesSettlementReceiptMetadata;
    PolymeshPrimitivesSettlementSettlementType: PolymeshPrimitivesSettlementSettlementType;
    PolymeshPrimitivesSettlementVenue: PolymeshPrimitivesSettlementVenue;
    PolymeshPrimitivesSettlementVenueType: PolymeshPrimitivesSettlementVenueType;
    PolymeshPrimitivesStatisticsStat1stKey: PolymeshPrimitivesStatisticsStat1stKey;
    PolymeshPrimitivesStatisticsStat2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;
    PolymeshPrimitivesStatisticsStatClaim: PolymeshPrimitivesStatisticsStatClaim;
    PolymeshPrimitivesStatisticsStatOpType: PolymeshPrimitivesStatisticsStatOpType;
    PolymeshPrimitivesStatisticsStatType: PolymeshPrimitivesStatisticsStatType;
    PolymeshPrimitivesStatisticsStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;
    PolymeshPrimitivesSubsetSubsetRestrictionAssetId: PolymeshPrimitivesSubsetSubsetRestrictionAssetId;
    PolymeshPrimitivesSubsetSubsetRestrictionExtrinsicName: PolymeshPrimitivesSubsetSubsetRestrictionExtrinsicName;
    PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId: PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId;
    PolymeshPrimitivesTicker: PolymeshPrimitivesTicker;
    PolymeshPrimitivesTransferComplianceAssetTransferCompliance: PolymeshPrimitivesTransferComplianceAssetTransferCompliance;
    PolymeshPrimitivesTransferComplianceTransferCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
    PolymeshPrimitivesTransferComplianceTransferConditionExemptKey: PolymeshPrimitivesTransferComplianceTransferConditionExemptKey;
    PolymeshRuntimeCommonNposSolution16: PolymeshRuntimeCommonNposSolution16;
    PolymeshRuntimeDevelopRuntime: PolymeshRuntimeDevelopRuntime;
    PolymeshRuntimeDevelopRuntimeOriginCaller: PolymeshRuntimeDevelopRuntimeOriginCaller;
    PolymeshRuntimeDevelopRuntimeSessionKeys: PolymeshRuntimeDevelopRuntimeSessionKeys;
    SpArithmeticArithmeticError: SpArithmeticArithmeticError;
    SpAuthorityDiscoveryAppPublic: SpAuthorityDiscoveryAppPublic;
    SpConsensusBabeAllowedSlots: SpConsensusBabeAllowedSlots;
    SpConsensusBabeAppPublic: SpConsensusBabeAppPublic;
    SpConsensusBabeBabeEpochConfiguration: SpConsensusBabeBabeEpochConfiguration;
    SpConsensusBabeDigestsNextConfigDescriptor: SpConsensusBabeDigestsNextConfigDescriptor;
    SpConsensusBabeDigestsPreDigest: SpConsensusBabeDigestsPreDigest;
    SpConsensusBabeDigestsPrimaryPreDigest: SpConsensusBabeDigestsPrimaryPreDigest;
    SpConsensusBabeDigestsSecondaryPlainPreDigest: SpConsensusBabeDigestsSecondaryPlainPreDigest;
    SpConsensusBabeDigestsSecondaryVRFPreDigest: SpConsensusBabeDigestsSecondaryVRFPreDigest;
    SpConsensusGrandpaAppPublic: SpConsensusGrandpaAppPublic;
    SpConsensusGrandpaAppSignature: SpConsensusGrandpaAppSignature;
    SpConsensusGrandpaEquivocation: SpConsensusGrandpaEquivocation;
    SpConsensusGrandpaEquivocationProof: SpConsensusGrandpaEquivocationProof;
    SpConsensusSlotsEquivocationProof: SpConsensusSlotsEquivocationProof;
    SpCoreCryptoKeyTypeId: SpCoreCryptoKeyTypeId;
    SpCoreEcdsaSignature: SpCoreEcdsaSignature;
    SpCoreEd25519Public: SpCoreEd25519Public;
    SpCoreEd25519Signature: SpCoreEd25519Signature;
    SpCoreOffchainOpaqueNetworkState: SpCoreOffchainOpaqueNetworkState;
    SpCoreSr25519Public: SpCoreSr25519Public;
    SpCoreSr25519Signature: SpCoreSr25519Signature;
    SpCoreVoid: SpCoreVoid;
    SpNposElectionsElectionScore: SpNposElectionsElectionScore;
    SpNposElectionsSupport: SpNposElectionsSupport;
    SpRuntimeBlakeTwo256: SpRuntimeBlakeTwo256;
    SpRuntimeDigest: SpRuntimeDigest;
    SpRuntimeDigestDigestItem: SpRuntimeDigestDigestItem;
    SpRuntimeDispatchError: SpRuntimeDispatchError;
    SpRuntimeHeader: SpRuntimeHeader;
    SpRuntimeModuleError: SpRuntimeModuleError;
    SpRuntimeMultiSignature: SpRuntimeMultiSignature;
    SpRuntimeTokenError: SpRuntimeTokenError;
    SpRuntimeTransactionalError: SpRuntimeTransactionalError;
    SpSessionMembershipProof: SpSessionMembershipProof;
    SpStakingOffenceOffenceDetails: SpStakingOffenceOffenceDetails;
    SpVersionRuntimeVersion: SpVersionRuntimeVersion;
    SpWeightsRuntimeDbWeight: SpWeightsRuntimeDbWeight;
    SpWeightsWeightToFeeCoefficient: SpWeightsWeightToFeeCoefficient;
    SpWeightsWeightV2Weight: SpWeightsWeightV2Weight;
  } // InterfaceTypes
} // declare module
