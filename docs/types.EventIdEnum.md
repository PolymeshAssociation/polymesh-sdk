# Enumeration: EventIdEnum

[types](../wiki/types).EventIdEnum

Events are emitted when chain state is changed. This enum represents all known events

## Table of contents

### Enumeration Members

- [AcceptedPayingKey](../wiki/types.EventIdEnum#acceptedpayingkey)
- [AccountAssetFrozen](../wiki/types.EventIdEnum#accountassetfrozen)
- [AccountAssetUnfrozen](../wiki/types.EventIdEnum#accountassetunfrozen)
- [AccountBalanceBurned](../wiki/types.EventIdEnum#accountbalanceburned)
- [AccountCreated](../wiki/types.EventIdEnum#accountcreated)
- [AccountDeposit](../wiki/types.EventIdEnum#accountdeposit)
- [AccountDepositIncoming](../wiki/types.EventIdEnum#accountdepositincoming)
- [AccountWithdraw](../wiki/types.EventIdEnum#accountwithdraw)
- [ActiveLimitChanged](../wiki/types.EventIdEnum#activelimitchanged)
- [ActivePipLimitChanged](../wiki/types.EventIdEnum#activepiplimitchanged)
- [AdminChanged](../wiki/types.EventIdEnum#adminchanged)
- [AffirmationWithdrawn](../wiki/types.EventIdEnum#affirmationwithdrawn)
- [AgentAdded](../wiki/types.EventIdEnum#agentadded)
- [AgentRemoved](../wiki/types.EventIdEnum#agentremoved)
- [AllGood](../wiki/types.EventIdEnum#allgood)
- [ApiHashUpdated](../wiki/types.EventIdEnum#apihashupdated)
- [Approval](../wiki/types.EventIdEnum#approval)
- [Approved](../wiki/types.EventIdEnum#approved)
- [AssetAffirmationExemption](../wiki/types.EventIdEnum#assetaffirmationexemption)
- [AssetBalanceUpdated](../wiki/types.EventIdEnum#assetbalanceupdated)
- [AssetCompliancePaused](../wiki/types.EventIdEnum#assetcompliancepaused)
- [AssetComplianceReplaced](../wiki/types.EventIdEnum#assetcompliancereplaced)
- [AssetComplianceReset](../wiki/types.EventIdEnum#assetcompliancereset)
- [AssetComplianceResumed](../wiki/types.EventIdEnum#assetcomplianceresumed)
- [AssetCreated](../wiki/types.EventIdEnum#assetcreated)
- [AssetDidRegistered](../wiki/types.EventIdEnum#assetdidregistered)
- [AssetFrozen](../wiki/types.EventIdEnum#assetfrozen)
- [AssetMediatorsAdded](../wiki/types.EventIdEnum#assetmediatorsadded)
- [AssetMediatorsRemoved](../wiki/types.EventIdEnum#assetmediatorsremoved)
- [AssetOwnershipTransferred](../wiki/types.EventIdEnum#assetownershiptransferred)
- [AssetPurchased](../wiki/types.EventIdEnum#assetpurchased)
- [AssetRenamed](../wiki/types.EventIdEnum#assetrenamed)
- [AssetRuleChanged](../wiki/types.EventIdEnum#assetrulechanged)
- [AssetRuleRemoved](../wiki/types.EventIdEnum#assetruleremoved)
- [AssetRulesPaused](../wiki/types.EventIdEnum#assetrulespaused)
- [AssetRulesReplaced](../wiki/types.EventIdEnum#assetrulesreplaced)
- [AssetRulesReset](../wiki/types.EventIdEnum#assetrulesreset)
- [AssetRulesResumed](../wiki/types.EventIdEnum#assetrulesresumed)
- [AssetStatsUpdated](../wiki/types.EventIdEnum#assetstatsupdated)
- [AssetTypeChanged](../wiki/types.EventIdEnum#assettypechanged)
- [AssetUnfrozen](../wiki/types.EventIdEnum#assetunfrozen)
- [AuthorizationAdded](../wiki/types.EventIdEnum#authorizationadded)
- [AuthorizationConsumed](../wiki/types.EventIdEnum#authorizationconsumed)
- [AuthorizationRejected](../wiki/types.EventIdEnum#authorizationrejected)
- [AuthorizationRetryLimitReached](../wiki/types.EventIdEnum#authorizationretrylimitreached)
- [AuthorizationRevoked](../wiki/types.EventIdEnum#authorizationrevoked)
- [AuthorizedPayingKey](../wiki/types.EventIdEnum#authorizedpayingkey)
- [BalanceSet](../wiki/types.EventIdEnum#balanceset)
- [BallotCancelled](../wiki/types.EventIdEnum#ballotcancelled)
- [BallotCreated](../wiki/types.EventIdEnum#ballotcreated)
- [BatchCompleted](../wiki/types.EventIdEnum#batchcompleted)
- [BatchCompletedOld](../wiki/types.EventIdEnum#batchcompletedold)
- [BatchCompletedWithErrors](../wiki/types.EventIdEnum#batchcompletedwitherrors)
- [BatchInterrupted](../wiki/types.EventIdEnum#batchinterrupted)
- [BatchInterruptedOld](../wiki/types.EventIdEnum#batchinterruptedold)
- [BatchOptimisticFailed](../wiki/types.EventIdEnum#batchoptimisticfailed)
- [BenefitClaimed](../wiki/types.EventIdEnum#benefitclaimed)
- [Bonded](../wiki/types.EventIdEnum#bonded)
- [BridgeLimitUpdated](../wiki/types.EventIdEnum#bridgelimitupdated)
- [BridgeTxFailed](../wiki/types.EventIdEnum#bridgetxfailed)
- [BridgeTxScheduleFailed](../wiki/types.EventIdEnum#bridgetxschedulefailed)
- [BridgeTxScheduled](../wiki/types.EventIdEnum#bridgetxscheduled)
- [Bridged](../wiki/types.EventIdEnum#bridged)
- [Burned](../wiki/types.EventIdEnum#burned)
- [CaInitiated](../wiki/types.EventIdEnum#cainitiated)
- [CaLinkedToDoc](../wiki/types.EventIdEnum#calinkedtodoc)
- [CaRemoved](../wiki/types.EventIdEnum#caremoved)
- [CaaTransferred](../wiki/types.EventIdEnum#caatransferred)
- [CallLookupFailed](../wiki/types.EventIdEnum#calllookupfailed)
- [CallUnavailable](../wiki/types.EventIdEnum#callunavailable)
- [Called](../wiki/types.EventIdEnum#called)
- [Canceled](../wiki/types.EventIdEnum#canceled)
- [CddClaimsInvalidated](../wiki/types.EventIdEnum#cddclaimsinvalidated)
- [CddRequirementForMasterKeyUpdated](../wiki/types.EventIdEnum#cddrequirementformasterkeyupdated)
- [CddRequirementForPrimaryKeyUpdated](../wiki/types.EventIdEnum#cddrequirementforprimarykeyupdated)
- [CddStatus](../wiki/types.EventIdEnum#cddstatus)
- [CheckpointCreated](../wiki/types.EventIdEnum#checkpointcreated)
- [ChildDidCreated](../wiki/types.EventIdEnum#childdidcreated)
- [ChildDidUnlinked](../wiki/types.EventIdEnum#childdidunlinked)
- [ClaimAdded](../wiki/types.EventIdEnum#claimadded)
- [ClaimRevoked](../wiki/types.EventIdEnum#claimrevoked)
- [ClassicTickerClaimed](../wiki/types.EventIdEnum#classictickerclaimed)
- [Cleared](../wiki/types.EventIdEnum#cleared)
- [Closed](../wiki/types.EventIdEnum#closed)
- [CodeRemoved](../wiki/types.EventIdEnum#coderemoved)
- [CodeStored](../wiki/types.EventIdEnum#codestored)
- [CodeUpdated](../wiki/types.EventIdEnum#codeupdated)
- [CoefficientSet](../wiki/types.EventIdEnum#coefficientset)
- [CommissionCapUpdated](../wiki/types.EventIdEnum#commissioncapupdated)
- [ComplianceRequirementChanged](../wiki/types.EventIdEnum#compliancerequirementchanged)
- [ComplianceRequirementCreated](../wiki/types.EventIdEnum#compliancerequirementcreated)
- [ComplianceRequirementRemoved](../wiki/types.EventIdEnum#compliancerequirementremoved)
- [ContractCodeUpdated](../wiki/types.EventIdEnum#contractcodeupdated)
- [ContractEmitted](../wiki/types.EventIdEnum#contractemitted)
- [ContractExecution](../wiki/types.EventIdEnum#contractexecution)
- [ControllerChanged](../wiki/types.EventIdEnum#controllerchanged)
- [ControllerRedemption](../wiki/types.EventIdEnum#controllerredemption)
- [ControllerTransfer](../wiki/types.EventIdEnum#controllertransfer)
- [Created](../wiki/types.EventIdEnum#created)
- [CustodyAllowanceChanged](../wiki/types.EventIdEnum#custodyallowancechanged)
- [CustodyTransfer](../wiki/types.EventIdEnum#custodytransfer)
- [CustomAssetTypeExists](../wiki/types.EventIdEnum#customassettypeexists)
- [CustomAssetTypeRegistered](../wiki/types.EventIdEnum#customassettyperegistered)
- [CustomClaimTypeAdded](../wiki/types.EventIdEnum#customclaimtypeadded)
- [DefaultEnactmentPeriodChanged](../wiki/types.EventIdEnum#defaultenactmentperiodchanged)
- [DefaultTargetIdentitiesChanged](../wiki/types.EventIdEnum#defaulttargetidentitieschanged)
- [DefaultWithholdingTaxChanged](../wiki/types.EventIdEnum#defaultwithholdingtaxchanged)
- [DelegateCalled](../wiki/types.EventIdEnum#delegatecalled)
- [DidCreated](../wiki/types.EventIdEnum#didcreated)
- [DidStatus](../wiki/types.EventIdEnum#didstatus)
- [DidWithholdingTaxChanged](../wiki/types.EventIdEnum#didwithholdingtaxchanged)
- [Dispatched](../wiki/types.EventIdEnum#dispatched)
- [DispatchedAs](../wiki/types.EventIdEnum#dispatchedas)
- [DividendCanceled](../wiki/types.EventIdEnum#dividendcanceled)
- [DividendCreated](../wiki/types.EventIdEnum#dividendcreated)
- [DividendPaidOutToUser](../wiki/types.EventIdEnum#dividendpaidouttouser)
- [DividendRemainingClaimed](../wiki/types.EventIdEnum#dividendremainingclaimed)
- [DivisibilityChanged](../wiki/types.EventIdEnum#divisibilitychanged)
- [DocumentAdded](../wiki/types.EventIdEnum#documentadded)
- [DocumentRemoved](../wiki/types.EventIdEnum#documentremoved)
- [Dummy](../wiki/types.EventIdEnum#dummy)
- [Endowed](../wiki/types.EventIdEnum#endowed)
- [EraPayout](../wiki/types.EventIdEnum#erapayout)
- [Evicted](../wiki/types.EventIdEnum#evicted)
- [Executed](../wiki/types.EventIdEnum#executed)
- [ExecutionCancellingFailed](../wiki/types.EventIdEnum#executioncancellingfailed)
- [ExecutionScheduled](../wiki/types.EventIdEnum#executionscheduled)
- [ExecutionSchedulingFailed](../wiki/types.EventIdEnum#executionschedulingfailed)
- [ExemptedUpdated](../wiki/types.EventIdEnum#exemptedupdated)
- [ExemptionListModified](../wiki/types.EventIdEnum#exemptionlistmodified)
- [ExemptionsAdded](../wiki/types.EventIdEnum#exemptionsadded)
- [ExemptionsRemoved](../wiki/types.EventIdEnum#exemptionsremoved)
- [ExpiresAfterUpdated](../wiki/types.EventIdEnum#expiresafterupdated)
- [ExpiryScheduled](../wiki/types.EventIdEnum#expiryscheduled)
- [ExpirySchedulingFailed](../wiki/types.EventIdEnum#expiryschedulingfailed)
- [ExtensionAdded](../wiki/types.EventIdEnum#extensionadded)
- [ExtensionArchived](../wiki/types.EventIdEnum#extensionarchived)
- [ExtensionRemoved](../wiki/types.EventIdEnum#extensionremoved)
- [ExtensionUnArchive](../wiki/types.EventIdEnum#extensionunarchive)
- [ExtrinsicFailed](../wiki/types.EventIdEnum#extrinsicfailed)
- [ExtrinsicSuccess](../wiki/types.EventIdEnum#extrinsicsuccess)
- [FailedToExecuteInstruction](../wiki/types.EventIdEnum#failedtoexecuteinstruction)
- [FeeCharged](../wiki/types.EventIdEnum#feecharged)
- [FeeSet](../wiki/types.EventIdEnum#feeset)
- [FinalVotes](../wiki/types.EventIdEnum#finalvotes)
- [FreezeAdminAdded](../wiki/types.EventIdEnum#freezeadminadded)
- [FreezeAdminRemoved](../wiki/types.EventIdEnum#freezeadminremoved)
- [Frozen](../wiki/types.EventIdEnum#frozen)
- [FrozenTx](../wiki/types.EventIdEnum#frozentx)
- [FundingRoundSet](../wiki/types.EventIdEnum#fundingroundset)
- [FundraiserClosed](../wiki/types.EventIdEnum#fundraiserclosed)
- [FundraiserCreated](../wiki/types.EventIdEnum#fundraisercreated)
- [FundraiserFrozen](../wiki/types.EventIdEnum#fundraiserfrozen)
- [FundraiserUnfrozen](../wiki/types.EventIdEnum#fundraiserunfrozen)
- [FundraiserWindowModifed](../wiki/types.EventIdEnum#fundraiserwindowmodifed)
- [FundraiserWindowModified](../wiki/types.EventIdEnum#fundraiserwindowmodified)
- [FundsMovedBetweenPortfolios](../wiki/types.EventIdEnum#fundsmovedbetweenportfolios)
- [FundsRaised](../wiki/types.EventIdEnum#fundsraised)
- [FungibleTokensMovedBetweenPortfolios](../wiki/types.EventIdEnum#fungibletokensmovedbetweenportfolios)
- [GlobalCommissionUpdated](../wiki/types.EventIdEnum#globalcommissionupdated)
- [GroupChanged](../wiki/types.EventIdEnum#groupchanged)
- [GroupCreated](../wiki/types.EventIdEnum#groupcreated)
- [GroupPermissionsUpdated](../wiki/types.EventIdEnum#grouppermissionsupdated)
- [HeartbeatReceived](../wiki/types.EventIdEnum#heartbeatreceived)
- [HistoricalPipsPruned](../wiki/types.EventIdEnum#historicalpipspruned)
- [IdentifiersUpdated](../wiki/types.EventIdEnum#identifiersupdated)
- [IndexAssigned](../wiki/types.EventIdEnum#indexassigned)
- [IndexFreed](../wiki/types.EventIdEnum#indexfreed)
- [IndexFrozen](../wiki/types.EventIdEnum#indexfrozen)
- [IndividualCommissionEnabled](../wiki/types.EventIdEnum#individualcommissionenabled)
- [Instantiated](../wiki/types.EventIdEnum#instantiated)
- [InstantiationFeeChanged](../wiki/types.EventIdEnum#instantiationfeechanged)
- [InstantiationFreezed](../wiki/types.EventIdEnum#instantiationfreezed)
- [InstantiationUnFreezed](../wiki/types.EventIdEnum#instantiationunfreezed)
- [InstructionAffirmed](../wiki/types.EventIdEnum#instructionaffirmed)
- [InstructionAuthorized](../wiki/types.EventIdEnum#instructionauthorized)
- [InstructionAutomaticallyAffirmed](../wiki/types.EventIdEnum#instructionautomaticallyaffirmed)
- [InstructionCreated](../wiki/types.EventIdEnum#instructioncreated)
- [InstructionExecuted](../wiki/types.EventIdEnum#instructionexecuted)
- [InstructionFailed](../wiki/types.EventIdEnum#instructionfailed)
- [InstructionMediators](../wiki/types.EventIdEnum#instructionmediators)
- [InstructionRejected](../wiki/types.EventIdEnum#instructionrejected)
- [InstructionRescheduled](../wiki/types.EventIdEnum#instructionrescheduled)
- [InstructionUnauthorized](../wiki/types.EventIdEnum#instructionunauthorized)
- [InstructionV2Created](../wiki/types.EventIdEnum#instructionv2created)
- [InvalidatedNominators](../wiki/types.EventIdEnum#invalidatednominators)
- [Invested](../wiki/types.EventIdEnum#invested)
- [InvestorUniquenessClaimNotAllowed](../wiki/types.EventIdEnum#investoruniquenessclaimnotallowed)
- [IsIssuable](../wiki/types.EventIdEnum#isissuable)
- [Issued](../wiki/types.EventIdEnum#issued)
- [IssuedNft](../wiki/types.EventIdEnum#issuednft)
- [ItemCompleted](../wiki/types.EventIdEnum#itemcompleted)
- [ItemFailed](../wiki/types.EventIdEnum#itemfailed)
- [ItnRewardClaimed](../wiki/types.EventIdEnum#itnrewardclaimed)
- [KeyChanged](../wiki/types.EventIdEnum#keychanged)
- [KilledAccount](../wiki/types.EventIdEnum#killedaccount)
- [LegFailedExecution](../wiki/types.EventIdEnum#legfailedexecution)
- [LocalMetadataKeyDeleted](../wiki/types.EventIdEnum#localmetadatakeydeleted)
- [MasterKeyUpdated](../wiki/types.EventIdEnum#masterkeyupdated)
- [MaxDetailsLengthChanged](../wiki/types.EventIdEnum#maxdetailslengthchanged)
- [MaxPipSkipCountChanged](../wiki/types.EventIdEnum#maxpipskipcountchanged)
- [MaximumSchedulesComplexityChanged](../wiki/types.EventIdEnum#maximumschedulescomplexitychanged)
- [MediatorAffirmationReceived](../wiki/types.EventIdEnum#mediatoraffirmationreceived)
- [MediatorAffirmationWithdrawn](../wiki/types.EventIdEnum#mediatoraffirmationwithdrawn)
- [MemberAdded](../wiki/types.EventIdEnum#memberadded)
- [MemberRemoved](../wiki/types.EventIdEnum#memberremoved)
- [MemberRevoked](../wiki/types.EventIdEnum#memberrevoked)
- [MembersReset](../wiki/types.EventIdEnum#membersreset)
- [MembersSwapped](../wiki/types.EventIdEnum#membersswapped)
- [MetaChanged](../wiki/types.EventIdEnum#metachanged)
- [MetadataValueDeleted](../wiki/types.EventIdEnum#metadatavaluedeleted)
- [MinimumBondThresholdUpdated](../wiki/types.EventIdEnum#minimumbondthresholdupdated)
- [MinimumProposalDepositChanged](../wiki/types.EventIdEnum#minimumproposaldepositchanged)
- [MockInvestorUidCreated](../wiki/types.EventIdEnum#mockinvestoruidcreated)
- [MovedBetweenPortfolios](../wiki/types.EventIdEnum#movedbetweenportfolios)
- [MultiSigCreated](../wiki/types.EventIdEnum#multisigcreated)
- [MultiSigSignaturesRequiredChanged](../wiki/types.EventIdEnum#multisigsignaturesrequiredchanged)
- [MultiSigSignerAdded](../wiki/types.EventIdEnum#multisigsigneradded)
- [MultiSigSignerAuthorized](../wiki/types.EventIdEnum#multisigsignerauthorized)
- [MultiSigSignerRemoved](../wiki/types.EventIdEnum#multisigsignerremoved)
- [NewAccount](../wiki/types.EventIdEnum#newaccount)
- [NewAssetRuleCreated](../wiki/types.EventIdEnum#newassetrulecreated)
- [NewAuthorities](../wiki/types.EventIdEnum#newauthorities)
- [NewSession](../wiki/types.EventIdEnum#newsession)
- [NfTsMovedBetweenPortfolios](../wiki/types.EventIdEnum#nftsmovedbetweenportfolios)
- [NftCollectionCreated](../wiki/types.EventIdEnum#nftcollectioncreated)
- [NftPortfolioUpdated](../wiki/types.EventIdEnum#nftportfolioupdated)
- [Nominated](../wiki/types.EventIdEnum#nominated)
- [Noted](../wiki/types.EventIdEnum#noted)
- [OffChainAuthorizationRevoked](../wiki/types.EventIdEnum#offchainauthorizationrevoked)
- [Offence](../wiki/types.EventIdEnum#offence)
- [OldSlashingReportDiscarded](../wiki/types.EventIdEnum#oldslashingreportdiscarded)
- [Paused](../wiki/types.EventIdEnum#paused)
- [PendingPipExpiryChanged](../wiki/types.EventIdEnum#pendingpipexpirychanged)
- [PeriodicFailed](../wiki/types.EventIdEnum#periodicfailed)
- [PermanentlyOverweight](../wiki/types.EventIdEnum#permanentlyoverweight)
- [PermissionedIdentityAdded](../wiki/types.EventIdEnum#permissionedidentityadded)
- [PermissionedIdentityRemoved](../wiki/types.EventIdEnum#permissionedidentityremoved)
- [PermissionedValidatorAdded](../wiki/types.EventIdEnum#permissionedvalidatoradded)
- [PermissionedValidatorRemoved](../wiki/types.EventIdEnum#permissionedvalidatorremoved)
- [PermissionedValidatorStatusChanged](../wiki/types.EventIdEnum#permissionedvalidatorstatuschanged)
- [PipClosed](../wiki/types.EventIdEnum#pipclosed)
- [PipSkipped](../wiki/types.EventIdEnum#pipskipped)
- [PlaceholderFillBlock](../wiki/types.EventIdEnum#placeholderfillblock)
- [PortfolioCreated](../wiki/types.EventIdEnum#portfoliocreated)
- [PortfolioCustodianChanged](../wiki/types.EventIdEnum#portfoliocustodianchanged)
- [PortfolioDeleted](../wiki/types.EventIdEnum#portfoliodeleted)
- [PortfolioRenamed](../wiki/types.EventIdEnum#portfoliorenamed)
- [PreApprovedAsset](../wiki/types.EventIdEnum#preapprovedasset)
- [PreApprovedPortfolio](../wiki/types.EventIdEnum#preapprovedportfolio)
- [PrimaryIssuanceAgentTransfered](../wiki/types.EventIdEnum#primaryissuanceagenttransfered)
- [PrimaryIssuanceAgentTransferred](../wiki/types.EventIdEnum#primaryissuanceagenttransferred)
- [PrimaryKeyUpdated](../wiki/types.EventIdEnum#primarykeyupdated)
- [ProposalAdded](../wiki/types.EventIdEnum#proposaladded)
- [ProposalApproved](../wiki/types.EventIdEnum#proposalapproved)
- [ProposalBondAdjusted](../wiki/types.EventIdEnum#proposalbondadjusted)
- [ProposalCoolOffPeriodChanged](../wiki/types.EventIdEnum#proposalcooloffperiodchanged)
- [ProposalCreated](../wiki/types.EventIdEnum#proposalcreated)
- [ProposalDetailsAmended](../wiki/types.EventIdEnum#proposaldetailsamended)
- [ProposalDurationChanged](../wiki/types.EventIdEnum#proposaldurationchanged)
- [ProposalExecuted](../wiki/types.EventIdEnum#proposalexecuted)
- [ProposalExecutionFailed](../wiki/types.EventIdEnum#proposalexecutionfailed)
- [ProposalRefund](../wiki/types.EventIdEnum#proposalrefund)
- [ProposalRejected](../wiki/types.EventIdEnum#proposalrejected)
- [ProposalRejectionVote](../wiki/types.EventIdEnum#proposalrejectionvote)
- [ProposalStateUpdated](../wiki/types.EventIdEnum#proposalstateupdated)
- [Proposed](../wiki/types.EventIdEnum#proposed)
- [PutCodeFlagChanged](../wiki/types.EventIdEnum#putcodeflagchanged)
- [QuorumThresholdChanged](../wiki/types.EventIdEnum#quorumthresholdchanged)
- [RangeChanged](../wiki/types.EventIdEnum#rangechanged)
- [RangeProofAdded](../wiki/types.EventIdEnum#rangeproofadded)
- [RangeProofVerified](../wiki/types.EventIdEnum#rangeproofverified)
- [RcvChanged](../wiki/types.EventIdEnum#rcvchanged)
- [ReceiptClaimed](../wiki/types.EventIdEnum#receiptclaimed)
- [ReceiptUnclaimed](../wiki/types.EventIdEnum#receiptunclaimed)
- [ReceiptValidityChanged](../wiki/types.EventIdEnum#receiptvaliditychanged)
- [Reclaimed](../wiki/types.EventIdEnum#reclaimed)
- [RecordDateChanged](../wiki/types.EventIdEnum#recorddatechanged)
- [Redeemed](../wiki/types.EventIdEnum#redeemed)
- [RedeemedNft](../wiki/types.EventIdEnum#redeemednft)
- [ReferendumCreated](../wiki/types.EventIdEnum#referendumcreated)
- [ReferendumScheduled](../wiki/types.EventIdEnum#referendumscheduled)
- [ReferendumStateUpdated](../wiki/types.EventIdEnum#referendumstateupdated)
- [RegisterAssetMetadataGlobalType](../wiki/types.EventIdEnum#registerassetmetadataglobaltype)
- [RegisterAssetMetadataLocalType](../wiki/types.EventIdEnum#registerassetmetadatalocaltype)
- [Rejected](../wiki/types.EventIdEnum#rejected)
- [RelayedTx](../wiki/types.EventIdEnum#relayedtx)
- [ReleaseCoordinatorUpdated](../wiki/types.EventIdEnum#releasecoordinatorupdated)
- [Remarked](../wiki/types.EventIdEnum#remarked)
- [RemoveAssetAffirmationExemption](../wiki/types.EventIdEnum#removeassetaffirmationexemption)
- [RemovePreApprovedAsset](../wiki/types.EventIdEnum#removepreapprovedasset)
- [Removed](../wiki/types.EventIdEnum#removed)
- [RemovedPayingKey](../wiki/types.EventIdEnum#removedpayingkey)
- [Requested](../wiki/types.EventIdEnum#requested)
- [ReserveRepatriated](../wiki/types.EventIdEnum#reserverepatriated)
- [Reserved](../wiki/types.EventIdEnum#reserved)
- [Restored](../wiki/types.EventIdEnum#restored)
- [Resumed](../wiki/types.EventIdEnum#resumed)
- [RevokePreApprovedPortfolio](../wiki/types.EventIdEnum#revokepreapprovedportfolio)
- [Reward](../wiki/types.EventIdEnum#reward)
- [RewardPaymentSchedulingInterrupted](../wiki/types.EventIdEnum#rewardpaymentschedulinginterrupted)
- [ScRuntimeCall](../wiki/types.EventIdEnum#scruntimecall)
- [ScheduleCreated](../wiki/types.EventIdEnum#schedulecreated)
- [ScheduleRemoved](../wiki/types.EventIdEnum#scheduleremoved)
- [ScheduleUpdated](../wiki/types.EventIdEnum#scheduleupdated)
- [Scheduled](../wiki/types.EventIdEnum#scheduled)
- [SchedulingFailed](../wiki/types.EventIdEnum#schedulingfailed)
- [SecondaryKeyLeftIdentity](../wiki/types.EventIdEnum#secondarykeyleftidentity)
- [SecondaryKeyPermissionsUpdated](../wiki/types.EventIdEnum#secondarykeypermissionsupdated)
- [SecondaryKeysAdded](../wiki/types.EventIdEnum#secondarykeysadded)
- [SecondaryKeysFrozen](../wiki/types.EventIdEnum#secondarykeysfrozen)
- [SecondaryKeysRemoved](../wiki/types.EventIdEnum#secondarykeysremoved)
- [SecondaryKeysUnfrozen](../wiki/types.EventIdEnum#secondarykeysunfrozen)
- [SecondaryPermissionsUpdated](../wiki/types.EventIdEnum#secondarypermissionsupdated)
- [SetAssetMediators](../wiki/types.EventIdEnum#setassetmediators)
- [SetAssetMetadataValue](../wiki/types.EventIdEnum#setassetmetadatavalue)
- [SetAssetMetadataValueDetails](../wiki/types.EventIdEnum#setassetmetadatavaluedetails)
- [SetAssetTransferCompliance](../wiki/types.EventIdEnum#setassettransfercompliance)
- [SettlementManuallyExecuted](../wiki/types.EventIdEnum#settlementmanuallyexecuted)
- [SignerLeft](../wiki/types.EventIdEnum#signerleft)
- [SigningKeysAdded](../wiki/types.EventIdEnum#signingkeysadded)
- [SigningKeysFrozen](../wiki/types.EventIdEnum#signingkeysfrozen)
- [SigningKeysRemoved](../wiki/types.EventIdEnum#signingkeysremoved)
- [SigningKeysUnfrozen](../wiki/types.EventIdEnum#signingkeysunfrozen)
- [SigningPermissionsUpdated](../wiki/types.EventIdEnum#signingpermissionsupdated)
- [Slash](../wiki/types.EventIdEnum#slash)
- [SlashingAllowedForChanged](../wiki/types.EventIdEnum#slashingallowedforchanged)
- [SlashingParamsUpdated](../wiki/types.EventIdEnum#slashingparamsupdated)
- [SnapshotCleared](../wiki/types.EventIdEnum#snapshotcleared)
- [SnapshotResultsEnacted](../wiki/types.EventIdEnum#snapshotresultsenacted)
- [SnapshotTaken](../wiki/types.EventIdEnum#snapshottaken)
- [SolutionStored](../wiki/types.EventIdEnum#solutionstored)
- [SomeOffline](../wiki/types.EventIdEnum#someoffline)
- [StakingElection](../wiki/types.EventIdEnum#stakingelection)
- [StatTypesAdded](../wiki/types.EventIdEnum#stattypesadded)
- [StatTypesRemoved](../wiki/types.EventIdEnum#stattypesremoved)
- [Sudid](../wiki/types.EventIdEnum#sudid)
- [SudoAsDone](../wiki/types.EventIdEnum#sudoasdone)
- [TemplateInstantiationFeeChanged](../wiki/types.EventIdEnum#templateinstantiationfeechanged)
- [TemplateMetaUrlChanged](../wiki/types.EventIdEnum#templatemetaurlchanged)
- [TemplateOwnershipTransferred](../wiki/types.EventIdEnum#templateownershiptransferred)
- [TemplateUsageFeeChanged](../wiki/types.EventIdEnum#templateusagefeechanged)
- [Terminated](../wiki/types.EventIdEnum#terminated)
- [TickerRegistered](../wiki/types.EventIdEnum#tickerregistered)
- [TickerTransferred](../wiki/types.EventIdEnum#tickertransferred)
- [TimelockChanged](../wiki/types.EventIdEnum#timelockchanged)
- [TransactionAffirmed](../wiki/types.EventIdEnum#transactionaffirmed)
- [TransactionCreated](../wiki/types.EventIdEnum#transactioncreated)
- [TransactionExecuted](../wiki/types.EventIdEnum#transactionexecuted)
- [TransactionFeePaid](../wiki/types.EventIdEnum#transactionfeepaid)
- [TransactionRejected](../wiki/types.EventIdEnum#transactionrejected)
- [Transfer](../wiki/types.EventIdEnum#transfer)
- [TransferConditionExemptionsAdded](../wiki/types.EventIdEnum#transferconditionexemptionsadded)
- [TransferConditionExemptionsRemoved](../wiki/types.EventIdEnum#transferconditionexemptionsremoved)
- [TransferManagerAdded](../wiki/types.EventIdEnum#transfermanageradded)
- [TransferManagerRemoved](../wiki/types.EventIdEnum#transfermanagerremoved)
- [TransferWithData](../wiki/types.EventIdEnum#transferwithdata)
- [TreasuryDidSet](../wiki/types.EventIdEnum#treasurydidset)
- [TreasuryDisbursement](../wiki/types.EventIdEnum#treasurydisbursement)
- [TreasuryDisbursementFailed](../wiki/types.EventIdEnum#treasurydisbursementfailed)
- [TreasuryReimbursement](../wiki/types.EventIdEnum#treasuryreimbursement)
- [TrustedDefaultClaimIssuerAdded](../wiki/types.EventIdEnum#trusteddefaultclaimissueradded)
- [TrustedDefaultClaimIssuerRemoved](../wiki/types.EventIdEnum#trusteddefaultclaimissuerremoved)
- [TxRemoved](../wiki/types.EventIdEnum#txremoved)
- [TxsHandled](../wiki/types.EventIdEnum#txshandled)
- [Unbonded](../wiki/types.EventIdEnum#unbonded)
- [UnexpectedError](../wiki/types.EventIdEnum#unexpectederror)
- [Unfrozen](../wiki/types.EventIdEnum#unfrozen)
- [UnfrozenTx](../wiki/types.EventIdEnum#unfrozentx)
- [Unreserved](../wiki/types.EventIdEnum#unreserved)
- [UpdatedPolyxLimit](../wiki/types.EventIdEnum#updatedpolyxlimit)
- [UserPortfolios](../wiki/types.EventIdEnum#userportfolios)
- [VenueCreated](../wiki/types.EventIdEnum#venuecreated)
- [VenueDetailsUpdated](../wiki/types.EventIdEnum#venuedetailsupdated)
- [VenueFiltering](../wiki/types.EventIdEnum#venuefiltering)
- [VenueSignersUpdated](../wiki/types.EventIdEnum#venuesignersupdated)
- [VenueTypeUpdated](../wiki/types.EventIdEnum#venuetypeupdated)
- [VenueUnauthorized](../wiki/types.EventIdEnum#venueunauthorized)
- [VenueUpdated](../wiki/types.EventIdEnum#venueupdated)
- [VenuesAllowed](../wiki/types.EventIdEnum#venuesallowed)
- [VenuesBlocked](../wiki/types.EventIdEnum#venuesblocked)
- [VoteCast](../wiki/types.EventIdEnum#votecast)
- [VoteEnactReferendum](../wiki/types.EventIdEnum#voteenactreferendum)
- [VoteRejectReferendum](../wiki/types.EventIdEnum#voterejectreferendum)
- [VoteRetracted](../wiki/types.EventIdEnum#voteretracted)
- [VoteThresholdUpdated](../wiki/types.EventIdEnum#votethresholdupdated)
- [Voted](../wiki/types.EventIdEnum#voted)
- [Withdrawn](../wiki/types.EventIdEnum#withdrawn)

## Enumeration Members

### AcceptedPayingKey

• **AcceptedPayingKey** = ``"AcceptedPayingKey"``

#### Defined in

[middleware/types.ts:32038](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32038)

___

### AccountAssetFrozen

• **AccountAssetFrozen** = ``"AccountAssetFrozen"``

#### Defined in

[middleware/types.ts:32039](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32039)

___

### AccountAssetUnfrozen

• **AccountAssetUnfrozen** = ``"AccountAssetUnfrozen"``

#### Defined in

[middleware/types.ts:32040](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32040)

___

### AccountBalanceBurned

• **AccountBalanceBurned** = ``"AccountBalanceBurned"``

#### Defined in

[middleware/types.ts:32041](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32041)

___

### AccountCreated

• **AccountCreated** = ``"AccountCreated"``

#### Defined in

[middleware/types.ts:32042](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32042)

___

### AccountDeposit

• **AccountDeposit** = ``"AccountDeposit"``

#### Defined in

[middleware/types.ts:32043](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32043)

___

### AccountDepositIncoming

• **AccountDepositIncoming** = ``"AccountDepositIncoming"``

#### Defined in

[middleware/types.ts:32044](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32044)

___

### AccountWithdraw

• **AccountWithdraw** = ``"AccountWithdraw"``

#### Defined in

[middleware/types.ts:32045](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32045)

___

### ActiveLimitChanged

• **ActiveLimitChanged** = ``"ActiveLimitChanged"``

#### Defined in

[middleware/types.ts:32046](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32046)

___

### ActivePipLimitChanged

• **ActivePipLimitChanged** = ``"ActivePipLimitChanged"``

#### Defined in

[middleware/types.ts:32047](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32047)

___

### AdminChanged

• **AdminChanged** = ``"AdminChanged"``

#### Defined in

[middleware/types.ts:32048](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32048)

___

### AffirmationWithdrawn

• **AffirmationWithdrawn** = ``"AffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:32049](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32049)

___

### AgentAdded

• **AgentAdded** = ``"AgentAdded"``

#### Defined in

[middleware/types.ts:32050](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32050)

___

### AgentRemoved

• **AgentRemoved** = ``"AgentRemoved"``

#### Defined in

[middleware/types.ts:32051](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32051)

___

### AllGood

• **AllGood** = ``"AllGood"``

#### Defined in

[middleware/types.ts:32052](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32052)

___

### ApiHashUpdated

• **ApiHashUpdated** = ``"ApiHashUpdated"``

#### Defined in

[middleware/types.ts:32053](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32053)

___

### Approval

• **Approval** = ``"Approval"``

#### Defined in

[middleware/types.ts:32054](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32054)

___

### Approved

• **Approved** = ``"Approved"``

#### Defined in

[middleware/types.ts:32055](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32055)

___

### AssetAffirmationExemption

• **AssetAffirmationExemption** = ``"AssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:32056](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32056)

___

### AssetBalanceUpdated

• **AssetBalanceUpdated** = ``"AssetBalanceUpdated"``

#### Defined in

[middleware/types.ts:32057](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32057)

___

### AssetCompliancePaused

• **AssetCompliancePaused** = ``"AssetCompliancePaused"``

#### Defined in

[middleware/types.ts:32058](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32058)

___

### AssetComplianceReplaced

• **AssetComplianceReplaced** = ``"AssetComplianceReplaced"``

#### Defined in

[middleware/types.ts:32059](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32059)

___

### AssetComplianceReset

• **AssetComplianceReset** = ``"AssetComplianceReset"``

#### Defined in

[middleware/types.ts:32060](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32060)

___

### AssetComplianceResumed

• **AssetComplianceResumed** = ``"AssetComplianceResumed"``

#### Defined in

[middleware/types.ts:32061](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32061)

___

### AssetCreated

• **AssetCreated** = ``"AssetCreated"``

#### Defined in

[middleware/types.ts:32062](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32062)

___

### AssetDidRegistered

• **AssetDidRegistered** = ``"AssetDidRegistered"``

#### Defined in

[middleware/types.ts:32063](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32063)

___

### AssetFrozen

• **AssetFrozen** = ``"AssetFrozen"``

#### Defined in

[middleware/types.ts:32064](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32064)

___

### AssetMediatorsAdded

• **AssetMediatorsAdded** = ``"AssetMediatorsAdded"``

#### Defined in

[middleware/types.ts:32065](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32065)

___

### AssetMediatorsRemoved

• **AssetMediatorsRemoved** = ``"AssetMediatorsRemoved"``

#### Defined in

[middleware/types.ts:32066](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32066)

___

### AssetOwnershipTransferred

• **AssetOwnershipTransferred** = ``"AssetOwnershipTransferred"``

#### Defined in

[middleware/types.ts:32067](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32067)

___

### AssetPurchased

• **AssetPurchased** = ``"AssetPurchased"``

#### Defined in

[middleware/types.ts:32068](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32068)

___

### AssetRenamed

• **AssetRenamed** = ``"AssetRenamed"``

#### Defined in

[middleware/types.ts:32069](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32069)

___

### AssetRuleChanged

• **AssetRuleChanged** = ``"AssetRuleChanged"``

#### Defined in

[middleware/types.ts:32070](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32070)

___

### AssetRuleRemoved

• **AssetRuleRemoved** = ``"AssetRuleRemoved"``

#### Defined in

[middleware/types.ts:32071](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32071)

___

### AssetRulesPaused

• **AssetRulesPaused** = ``"AssetRulesPaused"``

#### Defined in

[middleware/types.ts:32072](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32072)

___

### AssetRulesReplaced

• **AssetRulesReplaced** = ``"AssetRulesReplaced"``

#### Defined in

[middleware/types.ts:32073](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32073)

___

### AssetRulesReset

• **AssetRulesReset** = ``"AssetRulesReset"``

#### Defined in

[middleware/types.ts:32074](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32074)

___

### AssetRulesResumed

• **AssetRulesResumed** = ``"AssetRulesResumed"``

#### Defined in

[middleware/types.ts:32075](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32075)

___

### AssetStatsUpdated

• **AssetStatsUpdated** = ``"AssetStatsUpdated"``

#### Defined in

[middleware/types.ts:32076](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32076)

___

### AssetTypeChanged

• **AssetTypeChanged** = ``"AssetTypeChanged"``

#### Defined in

[middleware/types.ts:32077](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32077)

___

### AssetUnfrozen

• **AssetUnfrozen** = ``"AssetUnfrozen"``

#### Defined in

[middleware/types.ts:32078](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32078)

___

### AuthorizationAdded

• **AuthorizationAdded** = ``"AuthorizationAdded"``

#### Defined in

[middleware/types.ts:32079](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32079)

___

### AuthorizationConsumed

• **AuthorizationConsumed** = ``"AuthorizationConsumed"``

#### Defined in

[middleware/types.ts:32080](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32080)

___

### AuthorizationRejected

• **AuthorizationRejected** = ``"AuthorizationRejected"``

#### Defined in

[middleware/types.ts:32081](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32081)

___

### AuthorizationRetryLimitReached

• **AuthorizationRetryLimitReached** = ``"AuthorizationRetryLimitReached"``

#### Defined in

[middleware/types.ts:32082](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32082)

___

### AuthorizationRevoked

• **AuthorizationRevoked** = ``"AuthorizationRevoked"``

#### Defined in

[middleware/types.ts:32083](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32083)

___

### AuthorizedPayingKey

• **AuthorizedPayingKey** = ``"AuthorizedPayingKey"``

#### Defined in

[middleware/types.ts:32084](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32084)

___

### BalanceSet

• **BalanceSet** = ``"BalanceSet"``

#### Defined in

[middleware/types.ts:32085](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32085)

___

### BallotCancelled

• **BallotCancelled** = ``"BallotCancelled"``

#### Defined in

[middleware/types.ts:32086](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32086)

___

### BallotCreated

• **BallotCreated** = ``"BallotCreated"``

#### Defined in

[middleware/types.ts:32087](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32087)

___

### BatchCompleted

• **BatchCompleted** = ``"BatchCompleted"``

#### Defined in

[middleware/types.ts:32088](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32088)

___

### BatchCompletedOld

• **BatchCompletedOld** = ``"BatchCompletedOld"``

#### Defined in

[middleware/types.ts:32089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32089)

___

### BatchCompletedWithErrors

• **BatchCompletedWithErrors** = ``"BatchCompletedWithErrors"``

#### Defined in

[middleware/types.ts:32090](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32090)

___

### BatchInterrupted

• **BatchInterrupted** = ``"BatchInterrupted"``

#### Defined in

[middleware/types.ts:32091](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32091)

___

### BatchInterruptedOld

• **BatchInterruptedOld** = ``"BatchInterruptedOld"``

#### Defined in

[middleware/types.ts:32092](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32092)

___

### BatchOptimisticFailed

• **BatchOptimisticFailed** = ``"BatchOptimisticFailed"``

#### Defined in

[middleware/types.ts:32093](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32093)

___

### BenefitClaimed

• **BenefitClaimed** = ``"BenefitClaimed"``

#### Defined in

[middleware/types.ts:32094](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32094)

___

### Bonded

• **Bonded** = ``"Bonded"``

#### Defined in

[middleware/types.ts:32095](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32095)

___

### BridgeLimitUpdated

• **BridgeLimitUpdated** = ``"BridgeLimitUpdated"``

#### Defined in

[middleware/types.ts:32096](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32096)

___

### BridgeTxFailed

• **BridgeTxFailed** = ``"BridgeTxFailed"``

#### Defined in

[middleware/types.ts:32097](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32097)

___

### BridgeTxScheduleFailed

• **BridgeTxScheduleFailed** = ``"BridgeTxScheduleFailed"``

#### Defined in

[middleware/types.ts:32098](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32098)

___

### BridgeTxScheduled

• **BridgeTxScheduled** = ``"BridgeTxScheduled"``

#### Defined in

[middleware/types.ts:32099](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32099)

___

### Bridged

• **Bridged** = ``"Bridged"``

#### Defined in

[middleware/types.ts:32100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32100)

___

### Burned

• **Burned** = ``"Burned"``

#### Defined in

[middleware/types.ts:32101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32101)

___

### CaInitiated

• **CaInitiated** = ``"CAInitiated"``

#### Defined in

[middleware/types.ts:32103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32103)

___

### CaLinkedToDoc

• **CaLinkedToDoc** = ``"CALinkedToDoc"``

#### Defined in

[middleware/types.ts:32104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32104)

___

### CaRemoved

• **CaRemoved** = ``"CARemoved"``

#### Defined in

[middleware/types.ts:32105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32105)

___

### CaaTransferred

• **CaaTransferred** = ``"CAATransferred"``

#### Defined in

[middleware/types.ts:32102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32102)

___

### CallLookupFailed

• **CallLookupFailed** = ``"CallLookupFailed"``

#### Defined in

[middleware/types.ts:32106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32106)

___

### CallUnavailable

• **CallUnavailable** = ``"CallUnavailable"``

#### Defined in

[middleware/types.ts:32107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32107)

___

### Called

• **Called** = ``"Called"``

#### Defined in

[middleware/types.ts:32108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32108)

___

### Canceled

• **Canceled** = ``"Canceled"``

#### Defined in

[middleware/types.ts:32109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32109)

___

### CddClaimsInvalidated

• **CddClaimsInvalidated** = ``"CddClaimsInvalidated"``

#### Defined in

[middleware/types.ts:32110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32110)

___

### CddRequirementForMasterKeyUpdated

• **CddRequirementForMasterKeyUpdated** = ``"CddRequirementForMasterKeyUpdated"``

#### Defined in

[middleware/types.ts:32111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32111)

___

### CddRequirementForPrimaryKeyUpdated

• **CddRequirementForPrimaryKeyUpdated** = ``"CddRequirementForPrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:32112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32112)

___

### CddStatus

• **CddStatus** = ``"CddStatus"``

#### Defined in

[middleware/types.ts:32113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32113)

___

### CheckpointCreated

• **CheckpointCreated** = ``"CheckpointCreated"``

#### Defined in

[middleware/types.ts:32114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32114)

___

### ChildDidCreated

• **ChildDidCreated** = ``"ChildDidCreated"``

#### Defined in

[middleware/types.ts:32115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32115)

___

### ChildDidUnlinked

• **ChildDidUnlinked** = ``"ChildDidUnlinked"``

#### Defined in

[middleware/types.ts:32116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32116)

___

### ClaimAdded

• **ClaimAdded** = ``"ClaimAdded"``

#### Defined in

[middleware/types.ts:32117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32117)

___

### ClaimRevoked

• **ClaimRevoked** = ``"ClaimRevoked"``

#### Defined in

[middleware/types.ts:32118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32118)

___

### ClassicTickerClaimed

• **ClassicTickerClaimed** = ``"ClassicTickerClaimed"``

#### Defined in

[middleware/types.ts:32119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32119)

___

### Cleared

• **Cleared** = ``"Cleared"``

#### Defined in

[middleware/types.ts:32120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32120)

___

### Closed

• **Closed** = ``"Closed"``

#### Defined in

[middleware/types.ts:32121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32121)

___

### CodeRemoved

• **CodeRemoved** = ``"CodeRemoved"``

#### Defined in

[middleware/types.ts:32122](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32122)

___

### CodeStored

• **CodeStored** = ``"CodeStored"``

#### Defined in

[middleware/types.ts:32123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32123)

___

### CodeUpdated

• **CodeUpdated** = ``"CodeUpdated"``

#### Defined in

[middleware/types.ts:32124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32124)

___

### CoefficientSet

• **CoefficientSet** = ``"CoefficientSet"``

#### Defined in

[middleware/types.ts:32125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32125)

___

### CommissionCapUpdated

• **CommissionCapUpdated** = ``"CommissionCapUpdated"``

#### Defined in

[middleware/types.ts:32126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32126)

___

### ComplianceRequirementChanged

• **ComplianceRequirementChanged** = ``"ComplianceRequirementChanged"``

#### Defined in

[middleware/types.ts:32127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32127)

___

### ComplianceRequirementCreated

• **ComplianceRequirementCreated** = ``"ComplianceRequirementCreated"``

#### Defined in

[middleware/types.ts:32128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32128)

___

### ComplianceRequirementRemoved

• **ComplianceRequirementRemoved** = ``"ComplianceRequirementRemoved"``

#### Defined in

[middleware/types.ts:32129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32129)

___

### ContractCodeUpdated

• **ContractCodeUpdated** = ``"ContractCodeUpdated"``

#### Defined in

[middleware/types.ts:32130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32130)

___

### ContractEmitted

• **ContractEmitted** = ``"ContractEmitted"``

#### Defined in

[middleware/types.ts:32131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32131)

___

### ContractExecution

• **ContractExecution** = ``"ContractExecution"``

#### Defined in

[middleware/types.ts:32132](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32132)

___

### ControllerChanged

• **ControllerChanged** = ``"ControllerChanged"``

#### Defined in

[middleware/types.ts:32133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32133)

___

### ControllerRedemption

• **ControllerRedemption** = ``"ControllerRedemption"``

#### Defined in

[middleware/types.ts:32134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32134)

___

### ControllerTransfer

• **ControllerTransfer** = ``"ControllerTransfer"``

#### Defined in

[middleware/types.ts:32135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32135)

___

### Created

• **Created** = ``"Created"``

#### Defined in

[middleware/types.ts:32136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32136)

___

### CustodyAllowanceChanged

• **CustodyAllowanceChanged** = ``"CustodyAllowanceChanged"``

#### Defined in

[middleware/types.ts:32137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32137)

___

### CustodyTransfer

• **CustodyTransfer** = ``"CustodyTransfer"``

#### Defined in

[middleware/types.ts:32138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32138)

___

### CustomAssetTypeExists

• **CustomAssetTypeExists** = ``"CustomAssetTypeExists"``

#### Defined in

[middleware/types.ts:32139](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32139)

___

### CustomAssetTypeRegistered

• **CustomAssetTypeRegistered** = ``"CustomAssetTypeRegistered"``

#### Defined in

[middleware/types.ts:32140](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32140)

___

### CustomClaimTypeAdded

• **CustomClaimTypeAdded** = ``"CustomClaimTypeAdded"``

#### Defined in

[middleware/types.ts:32141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32141)

___

### DefaultEnactmentPeriodChanged

• **DefaultEnactmentPeriodChanged** = ``"DefaultEnactmentPeriodChanged"``

#### Defined in

[middleware/types.ts:32142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32142)

___

### DefaultTargetIdentitiesChanged

• **DefaultTargetIdentitiesChanged** = ``"DefaultTargetIdentitiesChanged"``

#### Defined in

[middleware/types.ts:32143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32143)

___

### DefaultWithholdingTaxChanged

• **DefaultWithholdingTaxChanged** = ``"DefaultWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:32144](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32144)

___

### DelegateCalled

• **DelegateCalled** = ``"DelegateCalled"``

#### Defined in

[middleware/types.ts:32145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32145)

___

### DidCreated

• **DidCreated** = ``"DidCreated"``

#### Defined in

[middleware/types.ts:32146](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32146)

___

### DidStatus

• **DidStatus** = ``"DidStatus"``

#### Defined in

[middleware/types.ts:32147](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32147)

___

### DidWithholdingTaxChanged

• **DidWithholdingTaxChanged** = ``"DidWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:32148](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32148)

___

### Dispatched

• **Dispatched** = ``"Dispatched"``

#### Defined in

[middleware/types.ts:32149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32149)

___

### DispatchedAs

• **DispatchedAs** = ``"DispatchedAs"``

#### Defined in

[middleware/types.ts:32150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32150)

___

### DividendCanceled

• **DividendCanceled** = ``"DividendCanceled"``

#### Defined in

[middleware/types.ts:32151](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32151)

___

### DividendCreated

• **DividendCreated** = ``"DividendCreated"``

#### Defined in

[middleware/types.ts:32152](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32152)

___

### DividendPaidOutToUser

• **DividendPaidOutToUser** = ``"DividendPaidOutToUser"``

#### Defined in

[middleware/types.ts:32153](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32153)

___

### DividendRemainingClaimed

• **DividendRemainingClaimed** = ``"DividendRemainingClaimed"``

#### Defined in

[middleware/types.ts:32154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32154)

___

### DivisibilityChanged

• **DivisibilityChanged** = ``"DivisibilityChanged"``

#### Defined in

[middleware/types.ts:32155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32155)

___

### DocumentAdded

• **DocumentAdded** = ``"DocumentAdded"``

#### Defined in

[middleware/types.ts:32156](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32156)

___

### DocumentRemoved

• **DocumentRemoved** = ``"DocumentRemoved"``

#### Defined in

[middleware/types.ts:32157](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32157)

___

### Dummy

• **Dummy** = ``"Dummy"``

#### Defined in

[middleware/types.ts:32158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32158)

___

### Endowed

• **Endowed** = ``"Endowed"``

#### Defined in

[middleware/types.ts:32159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32159)

___

### EraPayout

• **EraPayout** = ``"EraPayout"``

#### Defined in

[middleware/types.ts:32160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32160)

___

### Evicted

• **Evicted** = ``"Evicted"``

#### Defined in

[middleware/types.ts:32161](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32161)

___

### Executed

• **Executed** = ``"Executed"``

#### Defined in

[middleware/types.ts:32162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32162)

___

### ExecutionCancellingFailed

• **ExecutionCancellingFailed** = ``"ExecutionCancellingFailed"``

#### Defined in

[middleware/types.ts:32163](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32163)

___

### ExecutionScheduled

• **ExecutionScheduled** = ``"ExecutionScheduled"``

#### Defined in

[middleware/types.ts:32164](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32164)

___

### ExecutionSchedulingFailed

• **ExecutionSchedulingFailed** = ``"ExecutionSchedulingFailed"``

#### Defined in

[middleware/types.ts:32165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32165)

___

### ExemptedUpdated

• **ExemptedUpdated** = ``"ExemptedUpdated"``

#### Defined in

[middleware/types.ts:32166](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32166)

___

### ExemptionListModified

• **ExemptionListModified** = ``"ExemptionListModified"``

#### Defined in

[middleware/types.ts:32167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32167)

___

### ExemptionsAdded

• **ExemptionsAdded** = ``"ExemptionsAdded"``

#### Defined in

[middleware/types.ts:32168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32168)

___

### ExemptionsRemoved

• **ExemptionsRemoved** = ``"ExemptionsRemoved"``

#### Defined in

[middleware/types.ts:32169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32169)

___

### ExpiresAfterUpdated

• **ExpiresAfterUpdated** = ``"ExpiresAfterUpdated"``

#### Defined in

[middleware/types.ts:32170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32170)

___

### ExpiryScheduled

• **ExpiryScheduled** = ``"ExpiryScheduled"``

#### Defined in

[middleware/types.ts:32171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32171)

___

### ExpirySchedulingFailed

• **ExpirySchedulingFailed** = ``"ExpirySchedulingFailed"``

#### Defined in

[middleware/types.ts:32172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32172)

___

### ExtensionAdded

• **ExtensionAdded** = ``"ExtensionAdded"``

#### Defined in

[middleware/types.ts:32173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32173)

___

### ExtensionArchived

• **ExtensionArchived** = ``"ExtensionArchived"``

#### Defined in

[middleware/types.ts:32174](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32174)

___

### ExtensionRemoved

• **ExtensionRemoved** = ``"ExtensionRemoved"``

#### Defined in

[middleware/types.ts:32175](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32175)

___

### ExtensionUnArchive

• **ExtensionUnArchive** = ``"ExtensionUnArchive"``

#### Defined in

[middleware/types.ts:32176](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32176)

___

### ExtrinsicFailed

• **ExtrinsicFailed** = ``"ExtrinsicFailed"``

#### Defined in

[middleware/types.ts:32177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32177)

___

### ExtrinsicSuccess

• **ExtrinsicSuccess** = ``"ExtrinsicSuccess"``

#### Defined in

[middleware/types.ts:32178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32178)

___

### FailedToExecuteInstruction

• **FailedToExecuteInstruction** = ``"FailedToExecuteInstruction"``

#### Defined in

[middleware/types.ts:32179](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32179)

___

### FeeCharged

• **FeeCharged** = ``"FeeCharged"``

#### Defined in

[middleware/types.ts:32180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32180)

___

### FeeSet

• **FeeSet** = ``"FeeSet"``

#### Defined in

[middleware/types.ts:32181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32181)

___

### FinalVotes

• **FinalVotes** = ``"FinalVotes"``

#### Defined in

[middleware/types.ts:32182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32182)

___

### FreezeAdminAdded

• **FreezeAdminAdded** = ``"FreezeAdminAdded"``

#### Defined in

[middleware/types.ts:32183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32183)

___

### FreezeAdminRemoved

• **FreezeAdminRemoved** = ``"FreezeAdminRemoved"``

#### Defined in

[middleware/types.ts:32184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32184)

___

### Frozen

• **Frozen** = ``"Frozen"``

#### Defined in

[middleware/types.ts:32185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32185)

___

### FrozenTx

• **FrozenTx** = ``"FrozenTx"``

#### Defined in

[middleware/types.ts:32186](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32186)

___

### FundingRoundSet

• **FundingRoundSet** = ``"FundingRoundSet"``

#### Defined in

[middleware/types.ts:32187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32187)

___

### FundraiserClosed

• **FundraiserClosed** = ``"FundraiserClosed"``

#### Defined in

[middleware/types.ts:32188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32188)

___

### FundraiserCreated

• **FundraiserCreated** = ``"FundraiserCreated"``

#### Defined in

[middleware/types.ts:32189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32189)

___

### FundraiserFrozen

• **FundraiserFrozen** = ``"FundraiserFrozen"``

#### Defined in

[middleware/types.ts:32190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32190)

___

### FundraiserUnfrozen

• **FundraiserUnfrozen** = ``"FundraiserUnfrozen"``

#### Defined in

[middleware/types.ts:32191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32191)

___

### FundraiserWindowModifed

• **FundraiserWindowModifed** = ``"FundraiserWindowModifed"``

#### Defined in

[middleware/types.ts:32192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32192)

___

### FundraiserWindowModified

• **FundraiserWindowModified** = ``"FundraiserWindowModified"``

#### Defined in

[middleware/types.ts:32193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32193)

___

### FundsMovedBetweenPortfolios

• **FundsMovedBetweenPortfolios** = ``"FundsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:32194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32194)

___

### FundsRaised

• **FundsRaised** = ``"FundsRaised"``

#### Defined in

[middleware/types.ts:32195](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32195)

___

### FungibleTokensMovedBetweenPortfolios

• **FungibleTokensMovedBetweenPortfolios** = ``"FungibleTokensMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:32196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32196)

___

### GlobalCommissionUpdated

• **GlobalCommissionUpdated** = ``"GlobalCommissionUpdated"``

#### Defined in

[middleware/types.ts:32197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32197)

___

### GroupChanged

• **GroupChanged** = ``"GroupChanged"``

#### Defined in

[middleware/types.ts:32198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32198)

___

### GroupCreated

• **GroupCreated** = ``"GroupCreated"``

#### Defined in

[middleware/types.ts:32199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32199)

___

### GroupPermissionsUpdated

• **GroupPermissionsUpdated** = ``"GroupPermissionsUpdated"``

#### Defined in

[middleware/types.ts:32200](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32200)

___

### HeartbeatReceived

• **HeartbeatReceived** = ``"HeartbeatReceived"``

#### Defined in

[middleware/types.ts:32201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32201)

___

### HistoricalPipsPruned

• **HistoricalPipsPruned** = ``"HistoricalPipsPruned"``

#### Defined in

[middleware/types.ts:32202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32202)

___

### IdentifiersUpdated

• **IdentifiersUpdated** = ``"IdentifiersUpdated"``

#### Defined in

[middleware/types.ts:32203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32203)

___

### IndexAssigned

• **IndexAssigned** = ``"IndexAssigned"``

#### Defined in

[middleware/types.ts:32204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32204)

___

### IndexFreed

• **IndexFreed** = ``"IndexFreed"``

#### Defined in

[middleware/types.ts:32205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32205)

___

### IndexFrozen

• **IndexFrozen** = ``"IndexFrozen"``

#### Defined in

[middleware/types.ts:32206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32206)

___

### IndividualCommissionEnabled

• **IndividualCommissionEnabled** = ``"IndividualCommissionEnabled"``

#### Defined in

[middleware/types.ts:32207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32207)

___

### Instantiated

• **Instantiated** = ``"Instantiated"``

#### Defined in

[middleware/types.ts:32208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32208)

___

### InstantiationFeeChanged

• **InstantiationFeeChanged** = ``"InstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:32209](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32209)

___

### InstantiationFreezed

• **InstantiationFreezed** = ``"InstantiationFreezed"``

#### Defined in

[middleware/types.ts:32210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32210)

___

### InstantiationUnFreezed

• **InstantiationUnFreezed** = ``"InstantiationUnFreezed"``

#### Defined in

[middleware/types.ts:32211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32211)

___

### InstructionAffirmed

• **InstructionAffirmed** = ``"InstructionAffirmed"``

#### Defined in

[middleware/types.ts:32212](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32212)

___

### InstructionAuthorized

• **InstructionAuthorized** = ``"InstructionAuthorized"``

#### Defined in

[middleware/types.ts:32213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32213)

___

### InstructionAutomaticallyAffirmed

• **InstructionAutomaticallyAffirmed** = ``"InstructionAutomaticallyAffirmed"``

#### Defined in

[middleware/types.ts:32214](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32214)

___

### InstructionCreated

• **InstructionCreated** = ``"InstructionCreated"``

#### Defined in

[middleware/types.ts:32215](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32215)

___

### InstructionExecuted

• **InstructionExecuted** = ``"InstructionExecuted"``

#### Defined in

[middleware/types.ts:32216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32216)

___

### InstructionFailed

• **InstructionFailed** = ``"InstructionFailed"``

#### Defined in

[middleware/types.ts:32217](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32217)

___

### InstructionMediators

• **InstructionMediators** = ``"InstructionMediators"``

#### Defined in

[middleware/types.ts:32218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32218)

___

### InstructionRejected

• **InstructionRejected** = ``"InstructionRejected"``

#### Defined in

[middleware/types.ts:32219](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32219)

___

### InstructionRescheduled

• **InstructionRescheduled** = ``"InstructionRescheduled"``

#### Defined in

[middleware/types.ts:32220](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32220)

___

### InstructionUnauthorized

• **InstructionUnauthorized** = ``"InstructionUnauthorized"``

#### Defined in

[middleware/types.ts:32221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32221)

___

### InstructionV2Created

• **InstructionV2Created** = ``"InstructionV2Created"``

#### Defined in

[middleware/types.ts:32222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32222)

___

### InvalidatedNominators

• **InvalidatedNominators** = ``"InvalidatedNominators"``

#### Defined in

[middleware/types.ts:32223](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32223)

___

### Invested

• **Invested** = ``"Invested"``

#### Defined in

[middleware/types.ts:32224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32224)

___

### InvestorUniquenessClaimNotAllowed

• **InvestorUniquenessClaimNotAllowed** = ``"InvestorUniquenessClaimNotAllowed"``

#### Defined in

[middleware/types.ts:32225](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32225)

___

### IsIssuable

• **IsIssuable** = ``"IsIssuable"``

#### Defined in

[middleware/types.ts:32226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32226)

___

### Issued

• **Issued** = ``"Issued"``

#### Defined in

[middleware/types.ts:32227](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32227)

___

### IssuedNft

• **IssuedNft** = ``"IssuedNFT"``

#### Defined in

[middleware/types.ts:32228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32228)

___

### ItemCompleted

• **ItemCompleted** = ``"ItemCompleted"``

#### Defined in

[middleware/types.ts:32229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32229)

___

### ItemFailed

• **ItemFailed** = ``"ItemFailed"``

#### Defined in

[middleware/types.ts:32230](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32230)

___

### ItnRewardClaimed

• **ItnRewardClaimed** = ``"ItnRewardClaimed"``

#### Defined in

[middleware/types.ts:32231](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32231)

___

### KeyChanged

• **KeyChanged** = ``"KeyChanged"``

#### Defined in

[middleware/types.ts:32232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32232)

___

### KilledAccount

• **KilledAccount** = ``"KilledAccount"``

#### Defined in

[middleware/types.ts:32233](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32233)

___

### LegFailedExecution

• **LegFailedExecution** = ``"LegFailedExecution"``

#### Defined in

[middleware/types.ts:32234](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32234)

___

### LocalMetadataKeyDeleted

• **LocalMetadataKeyDeleted** = ``"LocalMetadataKeyDeleted"``

#### Defined in

[middleware/types.ts:32235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32235)

___

### MasterKeyUpdated

• **MasterKeyUpdated** = ``"MasterKeyUpdated"``

#### Defined in

[middleware/types.ts:32236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32236)

___

### MaxDetailsLengthChanged

• **MaxDetailsLengthChanged** = ``"MaxDetailsLengthChanged"``

#### Defined in

[middleware/types.ts:32237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32237)

___

### MaxPipSkipCountChanged

• **MaxPipSkipCountChanged** = ``"MaxPipSkipCountChanged"``

#### Defined in

[middleware/types.ts:32238](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32238)

___

### MaximumSchedulesComplexityChanged

• **MaximumSchedulesComplexityChanged** = ``"MaximumSchedulesComplexityChanged"``

#### Defined in

[middleware/types.ts:32239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32239)

___

### MediatorAffirmationReceived

• **MediatorAffirmationReceived** = ``"MediatorAffirmationReceived"``

#### Defined in

[middleware/types.ts:32240](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32240)

___

### MediatorAffirmationWithdrawn

• **MediatorAffirmationWithdrawn** = ``"MediatorAffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:32241](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32241)

___

### MemberAdded

• **MemberAdded** = ``"MemberAdded"``

#### Defined in

[middleware/types.ts:32242](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32242)

___

### MemberRemoved

• **MemberRemoved** = ``"MemberRemoved"``

#### Defined in

[middleware/types.ts:32243](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32243)

___

### MemberRevoked

• **MemberRevoked** = ``"MemberRevoked"``

#### Defined in

[middleware/types.ts:32244](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32244)

___

### MembersReset

• **MembersReset** = ``"MembersReset"``

#### Defined in

[middleware/types.ts:32245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32245)

___

### MembersSwapped

• **MembersSwapped** = ``"MembersSwapped"``

#### Defined in

[middleware/types.ts:32246](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32246)

___

### MetaChanged

• **MetaChanged** = ``"MetaChanged"``

#### Defined in

[middleware/types.ts:32247](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32247)

___

### MetadataValueDeleted

• **MetadataValueDeleted** = ``"MetadataValueDeleted"``

#### Defined in

[middleware/types.ts:32248](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32248)

___

### MinimumBondThresholdUpdated

• **MinimumBondThresholdUpdated** = ``"MinimumBondThresholdUpdated"``

#### Defined in

[middleware/types.ts:32249](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32249)

___

### MinimumProposalDepositChanged

• **MinimumProposalDepositChanged** = ``"MinimumProposalDepositChanged"``

#### Defined in

[middleware/types.ts:32250](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32250)

___

### MockInvestorUidCreated

• **MockInvestorUidCreated** = ``"MockInvestorUIDCreated"``

#### Defined in

[middleware/types.ts:32251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32251)

___

### MovedBetweenPortfolios

• **MovedBetweenPortfolios** = ``"MovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:32252](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32252)

___

### MultiSigCreated

• **MultiSigCreated** = ``"MultiSigCreated"``

#### Defined in

[middleware/types.ts:32253](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32253)

___

### MultiSigSignaturesRequiredChanged

• **MultiSigSignaturesRequiredChanged** = ``"MultiSigSignaturesRequiredChanged"``

#### Defined in

[middleware/types.ts:32254](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32254)

___

### MultiSigSignerAdded

• **MultiSigSignerAdded** = ``"MultiSigSignerAdded"``

#### Defined in

[middleware/types.ts:32255](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32255)

___

### MultiSigSignerAuthorized

• **MultiSigSignerAuthorized** = ``"MultiSigSignerAuthorized"``

#### Defined in

[middleware/types.ts:32256](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32256)

___

### MultiSigSignerRemoved

• **MultiSigSignerRemoved** = ``"MultiSigSignerRemoved"``

#### Defined in

[middleware/types.ts:32257](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32257)

___

### NewAccount

• **NewAccount** = ``"NewAccount"``

#### Defined in

[middleware/types.ts:32260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32260)

___

### NewAssetRuleCreated

• **NewAssetRuleCreated** = ``"NewAssetRuleCreated"``

#### Defined in

[middleware/types.ts:32261](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32261)

___

### NewAuthorities

• **NewAuthorities** = ``"NewAuthorities"``

#### Defined in

[middleware/types.ts:32262](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32262)

___

### NewSession

• **NewSession** = ``"NewSession"``

#### Defined in

[middleware/types.ts:32263](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32263)

___

### NfTsMovedBetweenPortfolios

• **NfTsMovedBetweenPortfolios** = ``"NFTsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:32259](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32259)

___

### NftCollectionCreated

• **NftCollectionCreated** = ``"NftCollectionCreated"``

#### Defined in

[middleware/types.ts:32264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32264)

___

### NftPortfolioUpdated

• **NftPortfolioUpdated** = ``"NFTPortfolioUpdated"``

#### Defined in

[middleware/types.ts:32258](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32258)

___

### Nominated

• **Nominated** = ``"Nominated"``

#### Defined in

[middleware/types.ts:32265](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32265)

___

### Noted

• **Noted** = ``"Noted"``

#### Defined in

[middleware/types.ts:32266](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32266)

___

### OffChainAuthorizationRevoked

• **OffChainAuthorizationRevoked** = ``"OffChainAuthorizationRevoked"``

#### Defined in

[middleware/types.ts:32267](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32267)

___

### Offence

• **Offence** = ``"Offence"``

#### Defined in

[middleware/types.ts:32268](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32268)

___

### OldSlashingReportDiscarded

• **OldSlashingReportDiscarded** = ``"OldSlashingReportDiscarded"``

#### Defined in

[middleware/types.ts:32269](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32269)

___

### Paused

• **Paused** = ``"Paused"``

#### Defined in

[middleware/types.ts:32270](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32270)

___

### PendingPipExpiryChanged

• **PendingPipExpiryChanged** = ``"PendingPipExpiryChanged"``

#### Defined in

[middleware/types.ts:32271](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32271)

___

### PeriodicFailed

• **PeriodicFailed** = ``"PeriodicFailed"``

#### Defined in

[middleware/types.ts:32272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32272)

___

### PermanentlyOverweight

• **PermanentlyOverweight** = ``"PermanentlyOverweight"``

#### Defined in

[middleware/types.ts:32273](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32273)

___

### PermissionedIdentityAdded

• **PermissionedIdentityAdded** = ``"PermissionedIdentityAdded"``

#### Defined in

[middleware/types.ts:32274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32274)

___

### PermissionedIdentityRemoved

• **PermissionedIdentityRemoved** = ``"PermissionedIdentityRemoved"``

#### Defined in

[middleware/types.ts:32275](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32275)

___

### PermissionedValidatorAdded

• **PermissionedValidatorAdded** = ``"PermissionedValidatorAdded"``

#### Defined in

[middleware/types.ts:32276](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32276)

___

### PermissionedValidatorRemoved

• **PermissionedValidatorRemoved** = ``"PermissionedValidatorRemoved"``

#### Defined in

[middleware/types.ts:32277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32277)

___

### PermissionedValidatorStatusChanged

• **PermissionedValidatorStatusChanged** = ``"PermissionedValidatorStatusChanged"``

#### Defined in

[middleware/types.ts:32278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32278)

___

### PipClosed

• **PipClosed** = ``"PipClosed"``

#### Defined in

[middleware/types.ts:32279](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32279)

___

### PipSkipped

• **PipSkipped** = ``"PipSkipped"``

#### Defined in

[middleware/types.ts:32280](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32280)

___

### PlaceholderFillBlock

• **PlaceholderFillBlock** = ``"PlaceholderFillBlock"``

#### Defined in

[middleware/types.ts:32281](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32281)

___

### PortfolioCreated

• **PortfolioCreated** = ``"PortfolioCreated"``

#### Defined in

[middleware/types.ts:32282](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32282)

___

### PortfolioCustodianChanged

• **PortfolioCustodianChanged** = ``"PortfolioCustodianChanged"``

#### Defined in

[middleware/types.ts:32283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32283)

___

### PortfolioDeleted

• **PortfolioDeleted** = ``"PortfolioDeleted"``

#### Defined in

[middleware/types.ts:32284](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32284)

___

### PortfolioRenamed

• **PortfolioRenamed** = ``"PortfolioRenamed"``

#### Defined in

[middleware/types.ts:32285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32285)

___

### PreApprovedAsset

• **PreApprovedAsset** = ``"PreApprovedAsset"``

#### Defined in

[middleware/types.ts:32286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32286)

___

### PreApprovedPortfolio

• **PreApprovedPortfolio** = ``"PreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:32287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32287)

___

### PrimaryIssuanceAgentTransfered

• **PrimaryIssuanceAgentTransfered** = ``"PrimaryIssuanceAgentTransfered"``

#### Defined in

[middleware/types.ts:32288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32288)

___

### PrimaryIssuanceAgentTransferred

• **PrimaryIssuanceAgentTransferred** = ``"PrimaryIssuanceAgentTransferred"``

#### Defined in

[middleware/types.ts:32289](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32289)

___

### PrimaryKeyUpdated

• **PrimaryKeyUpdated** = ``"PrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:32290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32290)

___

### ProposalAdded

• **ProposalAdded** = ``"ProposalAdded"``

#### Defined in

[middleware/types.ts:32291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32291)

___

### ProposalApproved

• **ProposalApproved** = ``"ProposalApproved"``

#### Defined in

[middleware/types.ts:32292](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32292)

___

### ProposalBondAdjusted

• **ProposalBondAdjusted** = ``"ProposalBondAdjusted"``

#### Defined in

[middleware/types.ts:32293](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32293)

___

### ProposalCoolOffPeriodChanged

• **ProposalCoolOffPeriodChanged** = ``"ProposalCoolOffPeriodChanged"``

#### Defined in

[middleware/types.ts:32294](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32294)

___

### ProposalCreated

• **ProposalCreated** = ``"ProposalCreated"``

#### Defined in

[middleware/types.ts:32295](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32295)

___

### ProposalDetailsAmended

• **ProposalDetailsAmended** = ``"ProposalDetailsAmended"``

#### Defined in

[middleware/types.ts:32296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32296)

___

### ProposalDurationChanged

• **ProposalDurationChanged** = ``"ProposalDurationChanged"``

#### Defined in

[middleware/types.ts:32297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32297)

___

### ProposalExecuted

• **ProposalExecuted** = ``"ProposalExecuted"``

#### Defined in

[middleware/types.ts:32298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32298)

___

### ProposalExecutionFailed

• **ProposalExecutionFailed** = ``"ProposalExecutionFailed"``

#### Defined in

[middleware/types.ts:32299](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32299)

___

### ProposalRefund

• **ProposalRefund** = ``"ProposalRefund"``

#### Defined in

[middleware/types.ts:32300](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32300)

___

### ProposalRejected

• **ProposalRejected** = ``"ProposalRejected"``

#### Defined in

[middleware/types.ts:32301](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32301)

___

### ProposalRejectionVote

• **ProposalRejectionVote** = ``"ProposalRejectionVote"``

#### Defined in

[middleware/types.ts:32302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32302)

___

### ProposalStateUpdated

• **ProposalStateUpdated** = ``"ProposalStateUpdated"``

#### Defined in

[middleware/types.ts:32303](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32303)

___

### Proposed

• **Proposed** = ``"Proposed"``

#### Defined in

[middleware/types.ts:32304](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32304)

___

### PutCodeFlagChanged

• **PutCodeFlagChanged** = ``"PutCodeFlagChanged"``

#### Defined in

[middleware/types.ts:32305](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32305)

___

### QuorumThresholdChanged

• **QuorumThresholdChanged** = ``"QuorumThresholdChanged"``

#### Defined in

[middleware/types.ts:32306](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32306)

___

### RangeChanged

• **RangeChanged** = ``"RangeChanged"``

#### Defined in

[middleware/types.ts:32308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32308)

___

### RangeProofAdded

• **RangeProofAdded** = ``"RangeProofAdded"``

#### Defined in

[middleware/types.ts:32309](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32309)

___

### RangeProofVerified

• **RangeProofVerified** = ``"RangeProofVerified"``

#### Defined in

[middleware/types.ts:32310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32310)

___

### RcvChanged

• **RcvChanged** = ``"RCVChanged"``

#### Defined in

[middleware/types.ts:32307](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32307)

___

### ReceiptClaimed

• **ReceiptClaimed** = ``"ReceiptClaimed"``

#### Defined in

[middleware/types.ts:32311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32311)

___

### ReceiptUnclaimed

• **ReceiptUnclaimed** = ``"ReceiptUnclaimed"``

#### Defined in

[middleware/types.ts:32312](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32312)

___

### ReceiptValidityChanged

• **ReceiptValidityChanged** = ``"ReceiptValidityChanged"``

#### Defined in

[middleware/types.ts:32313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32313)

___

### Reclaimed

• **Reclaimed** = ``"Reclaimed"``

#### Defined in

[middleware/types.ts:32314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32314)

___

### RecordDateChanged

• **RecordDateChanged** = ``"RecordDateChanged"``

#### Defined in

[middleware/types.ts:32315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32315)

___

### Redeemed

• **Redeemed** = ``"Redeemed"``

#### Defined in

[middleware/types.ts:32316](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32316)

___

### RedeemedNft

• **RedeemedNft** = ``"RedeemedNFT"``

#### Defined in

[middleware/types.ts:32317](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32317)

___

### ReferendumCreated

• **ReferendumCreated** = ``"ReferendumCreated"``

#### Defined in

[middleware/types.ts:32318](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32318)

___

### ReferendumScheduled

• **ReferendumScheduled** = ``"ReferendumScheduled"``

#### Defined in

[middleware/types.ts:32319](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32319)

___

### ReferendumStateUpdated

• **ReferendumStateUpdated** = ``"ReferendumStateUpdated"``

#### Defined in

[middleware/types.ts:32320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32320)

___

### RegisterAssetMetadataGlobalType

• **RegisterAssetMetadataGlobalType** = ``"RegisterAssetMetadataGlobalType"``

#### Defined in

[middleware/types.ts:32321](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32321)

___

### RegisterAssetMetadataLocalType

• **RegisterAssetMetadataLocalType** = ``"RegisterAssetMetadataLocalType"``

#### Defined in

[middleware/types.ts:32322](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32322)

___

### Rejected

• **Rejected** = ``"Rejected"``

#### Defined in

[middleware/types.ts:32323](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32323)

___

### RelayedTx

• **RelayedTx** = ``"RelayedTx"``

#### Defined in

[middleware/types.ts:32324](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32324)

___

### ReleaseCoordinatorUpdated

• **ReleaseCoordinatorUpdated** = ``"ReleaseCoordinatorUpdated"``

#### Defined in

[middleware/types.ts:32325](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32325)

___

### Remarked

• **Remarked** = ``"Remarked"``

#### Defined in

[middleware/types.ts:32326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32326)

___

### RemoveAssetAffirmationExemption

• **RemoveAssetAffirmationExemption** = ``"RemoveAssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:32327](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32327)

___

### RemovePreApprovedAsset

• **RemovePreApprovedAsset** = ``"RemovePreApprovedAsset"``

#### Defined in

[middleware/types.ts:32328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32328)

___

### Removed

• **Removed** = ``"Removed"``

#### Defined in

[middleware/types.ts:32329](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32329)

___

### RemovedPayingKey

• **RemovedPayingKey** = ``"RemovedPayingKey"``

#### Defined in

[middleware/types.ts:32330](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32330)

___

### Requested

• **Requested** = ``"Requested"``

#### Defined in

[middleware/types.ts:32331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32331)

___

### ReserveRepatriated

• **ReserveRepatriated** = ``"ReserveRepatriated"``

#### Defined in

[middleware/types.ts:32332](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32332)

___

### Reserved

• **Reserved** = ``"Reserved"``

#### Defined in

[middleware/types.ts:32333](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32333)

___

### Restored

• **Restored** = ``"Restored"``

#### Defined in

[middleware/types.ts:32334](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32334)

___

### Resumed

• **Resumed** = ``"Resumed"``

#### Defined in

[middleware/types.ts:32335](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32335)

___

### RevokePreApprovedPortfolio

• **RevokePreApprovedPortfolio** = ``"RevokePreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:32336](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32336)

___

### Reward

• **Reward** = ``"Reward"``

#### Defined in

[middleware/types.ts:32337](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32337)

___

### RewardPaymentSchedulingInterrupted

• **RewardPaymentSchedulingInterrupted** = ``"RewardPaymentSchedulingInterrupted"``

#### Defined in

[middleware/types.ts:32338](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32338)

___

### ScRuntimeCall

• **ScRuntimeCall** = ``"SCRuntimeCall"``

#### Defined in

[middleware/types.ts:32339](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32339)

___

### ScheduleCreated

• **ScheduleCreated** = ``"ScheduleCreated"``

#### Defined in

[middleware/types.ts:32340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32340)

___

### ScheduleRemoved

• **ScheduleRemoved** = ``"ScheduleRemoved"``

#### Defined in

[middleware/types.ts:32341](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32341)

___

### ScheduleUpdated

• **ScheduleUpdated** = ``"ScheduleUpdated"``

#### Defined in

[middleware/types.ts:32342](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32342)

___

### Scheduled

• **Scheduled** = ``"Scheduled"``

#### Defined in

[middleware/types.ts:32343](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32343)

___

### SchedulingFailed

• **SchedulingFailed** = ``"SchedulingFailed"``

#### Defined in

[middleware/types.ts:32344](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32344)

___

### SecondaryKeyLeftIdentity

• **SecondaryKeyLeftIdentity** = ``"SecondaryKeyLeftIdentity"``

#### Defined in

[middleware/types.ts:32345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32345)

___

### SecondaryKeyPermissionsUpdated

• **SecondaryKeyPermissionsUpdated** = ``"SecondaryKeyPermissionsUpdated"``

#### Defined in

[middleware/types.ts:32346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32346)

___

### SecondaryKeysAdded

• **SecondaryKeysAdded** = ``"SecondaryKeysAdded"``

#### Defined in

[middleware/types.ts:32347](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32347)

___

### SecondaryKeysFrozen

• **SecondaryKeysFrozen** = ``"SecondaryKeysFrozen"``

#### Defined in

[middleware/types.ts:32348](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32348)

___

### SecondaryKeysRemoved

• **SecondaryKeysRemoved** = ``"SecondaryKeysRemoved"``

#### Defined in

[middleware/types.ts:32349](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32349)

___

### SecondaryKeysUnfrozen

• **SecondaryKeysUnfrozen** = ``"SecondaryKeysUnfrozen"``

#### Defined in

[middleware/types.ts:32350](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32350)

___

### SecondaryPermissionsUpdated

• **SecondaryPermissionsUpdated** = ``"SecondaryPermissionsUpdated"``

#### Defined in

[middleware/types.ts:32351](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32351)

___

### SetAssetMediators

• **SetAssetMediators** = ``"SetAssetMediators"``

#### Defined in

[middleware/types.ts:32352](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32352)

___

### SetAssetMetadataValue

• **SetAssetMetadataValue** = ``"SetAssetMetadataValue"``

#### Defined in

[middleware/types.ts:32353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32353)

___

### SetAssetMetadataValueDetails

• **SetAssetMetadataValueDetails** = ``"SetAssetMetadataValueDetails"``

#### Defined in

[middleware/types.ts:32354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32354)

___

### SetAssetTransferCompliance

• **SetAssetTransferCompliance** = ``"SetAssetTransferCompliance"``

#### Defined in

[middleware/types.ts:32355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32355)

___

### SettlementManuallyExecuted

• **SettlementManuallyExecuted** = ``"SettlementManuallyExecuted"``

#### Defined in

[middleware/types.ts:32356](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32356)

___

### SignerLeft

• **SignerLeft** = ``"SignerLeft"``

#### Defined in

[middleware/types.ts:32357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32357)

___

### SigningKeysAdded

• **SigningKeysAdded** = ``"SigningKeysAdded"``

#### Defined in

[middleware/types.ts:32358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32358)

___

### SigningKeysFrozen

• **SigningKeysFrozen** = ``"SigningKeysFrozen"``

#### Defined in

[middleware/types.ts:32359](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32359)

___

### SigningKeysRemoved

• **SigningKeysRemoved** = ``"SigningKeysRemoved"``

#### Defined in

[middleware/types.ts:32360](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32360)

___

### SigningKeysUnfrozen

• **SigningKeysUnfrozen** = ``"SigningKeysUnfrozen"``

#### Defined in

[middleware/types.ts:32361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32361)

___

### SigningPermissionsUpdated

• **SigningPermissionsUpdated** = ``"SigningPermissionsUpdated"``

#### Defined in

[middleware/types.ts:32362](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32362)

___

### Slash

• **Slash** = ``"Slash"``

#### Defined in

[middleware/types.ts:32363](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32363)

___

### SlashingAllowedForChanged

• **SlashingAllowedForChanged** = ``"SlashingAllowedForChanged"``

#### Defined in

[middleware/types.ts:32364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32364)

___

### SlashingParamsUpdated

• **SlashingParamsUpdated** = ``"SlashingParamsUpdated"``

#### Defined in

[middleware/types.ts:32365](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32365)

___

### SnapshotCleared

• **SnapshotCleared** = ``"SnapshotCleared"``

#### Defined in

[middleware/types.ts:32366](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32366)

___

### SnapshotResultsEnacted

• **SnapshotResultsEnacted** = ``"SnapshotResultsEnacted"``

#### Defined in

[middleware/types.ts:32367](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32367)

___

### SnapshotTaken

• **SnapshotTaken** = ``"SnapshotTaken"``

#### Defined in

[middleware/types.ts:32368](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32368)

___

### SolutionStored

• **SolutionStored** = ``"SolutionStored"``

#### Defined in

[middleware/types.ts:32369](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32369)

___

### SomeOffline

• **SomeOffline** = ``"SomeOffline"``

#### Defined in

[middleware/types.ts:32370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32370)

___

### StakingElection

• **StakingElection** = ``"StakingElection"``

#### Defined in

[middleware/types.ts:32371](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32371)

___

### StatTypesAdded

• **StatTypesAdded** = ``"StatTypesAdded"``

#### Defined in

[middleware/types.ts:32372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32372)

___

### StatTypesRemoved

• **StatTypesRemoved** = ``"StatTypesRemoved"``

#### Defined in

[middleware/types.ts:32373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32373)

___

### Sudid

• **Sudid** = ``"Sudid"``

#### Defined in

[middleware/types.ts:32374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32374)

___

### SudoAsDone

• **SudoAsDone** = ``"SudoAsDone"``

#### Defined in

[middleware/types.ts:32375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32375)

___

### TemplateInstantiationFeeChanged

• **TemplateInstantiationFeeChanged** = ``"TemplateInstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:32376](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32376)

___

### TemplateMetaUrlChanged

• **TemplateMetaUrlChanged** = ``"TemplateMetaUrlChanged"``

#### Defined in

[middleware/types.ts:32377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32377)

___

### TemplateOwnershipTransferred

• **TemplateOwnershipTransferred** = ``"TemplateOwnershipTransferred"``

#### Defined in

[middleware/types.ts:32378](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32378)

___

### TemplateUsageFeeChanged

• **TemplateUsageFeeChanged** = ``"TemplateUsageFeeChanged"``

#### Defined in

[middleware/types.ts:32379](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32379)

___

### Terminated

• **Terminated** = ``"Terminated"``

#### Defined in

[middleware/types.ts:32380](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32380)

___

### TickerRegistered

• **TickerRegistered** = ``"TickerRegistered"``

#### Defined in

[middleware/types.ts:32381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32381)

___

### TickerTransferred

• **TickerTransferred** = ``"TickerTransferred"``

#### Defined in

[middleware/types.ts:32382](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32382)

___

### TimelockChanged

• **TimelockChanged** = ``"TimelockChanged"``

#### Defined in

[middleware/types.ts:32383](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32383)

___

### TransactionAffirmed

• **TransactionAffirmed** = ``"TransactionAffirmed"``

#### Defined in

[middleware/types.ts:32384](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32384)

___

### TransactionCreated

• **TransactionCreated** = ``"TransactionCreated"``

#### Defined in

[middleware/types.ts:32385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32385)

___

### TransactionExecuted

• **TransactionExecuted** = ``"TransactionExecuted"``

#### Defined in

[middleware/types.ts:32386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32386)

___

### TransactionFeePaid

• **TransactionFeePaid** = ``"TransactionFeePaid"``

#### Defined in

[middleware/types.ts:32387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32387)

___

### TransactionRejected

• **TransactionRejected** = ``"TransactionRejected"``

#### Defined in

[middleware/types.ts:32388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32388)

___

### Transfer

• **Transfer** = ``"Transfer"``

#### Defined in

[middleware/types.ts:32389](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32389)

___

### TransferConditionExemptionsAdded

• **TransferConditionExemptionsAdded** = ``"TransferConditionExemptionsAdded"``

#### Defined in

[middleware/types.ts:32390](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32390)

___

### TransferConditionExemptionsRemoved

• **TransferConditionExemptionsRemoved** = ``"TransferConditionExemptionsRemoved"``

#### Defined in

[middleware/types.ts:32391](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32391)

___

### TransferManagerAdded

• **TransferManagerAdded** = ``"TransferManagerAdded"``

#### Defined in

[middleware/types.ts:32392](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32392)

___

### TransferManagerRemoved

• **TransferManagerRemoved** = ``"TransferManagerRemoved"``

#### Defined in

[middleware/types.ts:32393](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32393)

___

### TransferWithData

• **TransferWithData** = ``"TransferWithData"``

#### Defined in

[middleware/types.ts:32394](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32394)

___

### TreasuryDidSet

• **TreasuryDidSet** = ``"TreasuryDidSet"``

#### Defined in

[middleware/types.ts:32395](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32395)

___

### TreasuryDisbursement

• **TreasuryDisbursement** = ``"TreasuryDisbursement"``

#### Defined in

[middleware/types.ts:32396](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32396)

___

### TreasuryDisbursementFailed

• **TreasuryDisbursementFailed** = ``"TreasuryDisbursementFailed"``

#### Defined in

[middleware/types.ts:32397](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32397)

___

### TreasuryReimbursement

• **TreasuryReimbursement** = ``"TreasuryReimbursement"``

#### Defined in

[middleware/types.ts:32398](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32398)

___

### TrustedDefaultClaimIssuerAdded

• **TrustedDefaultClaimIssuerAdded** = ``"TrustedDefaultClaimIssuerAdded"``

#### Defined in

[middleware/types.ts:32399](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32399)

___

### TrustedDefaultClaimIssuerRemoved

• **TrustedDefaultClaimIssuerRemoved** = ``"TrustedDefaultClaimIssuerRemoved"``

#### Defined in

[middleware/types.ts:32400](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32400)

___

### TxRemoved

• **TxRemoved** = ``"TxRemoved"``

#### Defined in

[middleware/types.ts:32401](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32401)

___

### TxsHandled

• **TxsHandled** = ``"TxsHandled"``

#### Defined in

[middleware/types.ts:32402](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32402)

___

### Unbonded

• **Unbonded** = ``"Unbonded"``

#### Defined in

[middleware/types.ts:32403](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32403)

___

### UnexpectedError

• **UnexpectedError** = ``"UnexpectedError"``

#### Defined in

[middleware/types.ts:32404](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32404)

___

### Unfrozen

• **Unfrozen** = ``"Unfrozen"``

#### Defined in

[middleware/types.ts:32405](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32405)

___

### UnfrozenTx

• **UnfrozenTx** = ``"UnfrozenTx"``

#### Defined in

[middleware/types.ts:32406](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32406)

___

### Unreserved

• **Unreserved** = ``"Unreserved"``

#### Defined in

[middleware/types.ts:32407](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32407)

___

### UpdatedPolyxLimit

• **UpdatedPolyxLimit** = ``"UpdatedPolyxLimit"``

#### Defined in

[middleware/types.ts:32408](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32408)

___

### UserPortfolios

• **UserPortfolios** = ``"UserPortfolios"``

#### Defined in

[middleware/types.ts:32409](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32409)

___

### VenueCreated

• **VenueCreated** = ``"VenueCreated"``

#### Defined in

[middleware/types.ts:32410](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32410)

___

### VenueDetailsUpdated

• **VenueDetailsUpdated** = ``"VenueDetailsUpdated"``

#### Defined in

[middleware/types.ts:32411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32411)

___

### VenueFiltering

• **VenueFiltering** = ``"VenueFiltering"``

#### Defined in

[middleware/types.ts:32412](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32412)

___

### VenueSignersUpdated

• **VenueSignersUpdated** = ``"VenueSignersUpdated"``

#### Defined in

[middleware/types.ts:32413](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32413)

___

### VenueTypeUpdated

• **VenueTypeUpdated** = ``"VenueTypeUpdated"``

#### Defined in

[middleware/types.ts:32414](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32414)

___

### VenueUnauthorized

• **VenueUnauthorized** = ``"VenueUnauthorized"``

#### Defined in

[middleware/types.ts:32415](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32415)

___

### VenueUpdated

• **VenueUpdated** = ``"VenueUpdated"``

#### Defined in

[middleware/types.ts:32416](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32416)

___

### VenuesAllowed

• **VenuesAllowed** = ``"VenuesAllowed"``

#### Defined in

[middleware/types.ts:32417](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32417)

___

### VenuesBlocked

• **VenuesBlocked** = ``"VenuesBlocked"``

#### Defined in

[middleware/types.ts:32418](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32418)

___

### VoteCast

• **VoteCast** = ``"VoteCast"``

#### Defined in

[middleware/types.ts:32419](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32419)

___

### VoteEnactReferendum

• **VoteEnactReferendum** = ``"VoteEnactReferendum"``

#### Defined in

[middleware/types.ts:32420](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32420)

___

### VoteRejectReferendum

• **VoteRejectReferendum** = ``"VoteRejectReferendum"``

#### Defined in

[middleware/types.ts:32421](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32421)

___

### VoteRetracted

• **VoteRetracted** = ``"VoteRetracted"``

#### Defined in

[middleware/types.ts:32422](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32422)

___

### VoteThresholdUpdated

• **VoteThresholdUpdated** = ``"VoteThresholdUpdated"``

#### Defined in

[middleware/types.ts:32423](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32423)

___

### Voted

• **Voted** = ``"Voted"``

#### Defined in

[middleware/types.ts:32424](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32424)

___

### Withdrawn

• **Withdrawn** = ``"Withdrawn"``

#### Defined in

[middleware/types.ts:32425](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/middleware/types.ts#L32425)
