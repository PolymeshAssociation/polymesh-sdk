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
- [FundsMoved](../wiki/types.EventIdEnum#fundsmoved)
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
- [ProposalFailedToExecute](../wiki/types.EventIdEnum#proposalfailedtoexecute)
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
- [TickerLinkedToAsset](../wiki/types.EventIdEnum#tickerlinkedtoasset)
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

[middleware/types.ts:77254](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77254)

___

### AccountAssetFrozen

• **AccountAssetFrozen** = ``"AccountAssetFrozen"``

#### Defined in

[middleware/types.ts:77255](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77255)

___

### AccountAssetUnfrozen

• **AccountAssetUnfrozen** = ``"AccountAssetUnfrozen"``

#### Defined in

[middleware/types.ts:77256](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77256)

___

### AccountBalanceBurned

• **AccountBalanceBurned** = ``"AccountBalanceBurned"``

#### Defined in

[middleware/types.ts:77257](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77257)

___

### AccountCreated

• **AccountCreated** = ``"AccountCreated"``

#### Defined in

[middleware/types.ts:77258](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77258)

___

### AccountDeposit

• **AccountDeposit** = ``"AccountDeposit"``

#### Defined in

[middleware/types.ts:77259](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77259)

___

### AccountDepositIncoming

• **AccountDepositIncoming** = ``"AccountDepositIncoming"``

#### Defined in

[middleware/types.ts:77260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77260)

___

### AccountWithdraw

• **AccountWithdraw** = ``"AccountWithdraw"``

#### Defined in

[middleware/types.ts:77261](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77261)

___

### ActiveLimitChanged

• **ActiveLimitChanged** = ``"ActiveLimitChanged"``

#### Defined in

[middleware/types.ts:77262](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77262)

___

### ActivePipLimitChanged

• **ActivePipLimitChanged** = ``"ActivePipLimitChanged"``

#### Defined in

[middleware/types.ts:77263](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77263)

___

### AdminChanged

• **AdminChanged** = ``"AdminChanged"``

#### Defined in

[middleware/types.ts:77264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77264)

___

### AffirmationWithdrawn

• **AffirmationWithdrawn** = ``"AffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:77265](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77265)

___

### AgentAdded

• **AgentAdded** = ``"AgentAdded"``

#### Defined in

[middleware/types.ts:77266](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77266)

___

### AgentRemoved

• **AgentRemoved** = ``"AgentRemoved"``

#### Defined in

[middleware/types.ts:77267](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77267)

___

### AllGood

• **AllGood** = ``"AllGood"``

#### Defined in

[middleware/types.ts:77268](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77268)

___

### ApiHashUpdated

• **ApiHashUpdated** = ``"ApiHashUpdated"``

#### Defined in

[middleware/types.ts:77269](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77269)

___

### Approval

• **Approval** = ``"Approval"``

#### Defined in

[middleware/types.ts:77270](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77270)

___

### Approved

• **Approved** = ``"Approved"``

#### Defined in

[middleware/types.ts:77271](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77271)

___

### AssetAffirmationExemption

• **AssetAffirmationExemption** = ``"AssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:77272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77272)

___

### AssetBalanceUpdated

• **AssetBalanceUpdated** = ``"AssetBalanceUpdated"``

#### Defined in

[middleware/types.ts:77273](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77273)

___

### AssetCompliancePaused

• **AssetCompliancePaused** = ``"AssetCompliancePaused"``

#### Defined in

[middleware/types.ts:77274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77274)

___

### AssetComplianceReplaced

• **AssetComplianceReplaced** = ``"AssetComplianceReplaced"``

#### Defined in

[middleware/types.ts:77275](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77275)

___

### AssetComplianceReset

• **AssetComplianceReset** = ``"AssetComplianceReset"``

#### Defined in

[middleware/types.ts:77276](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77276)

___

### AssetComplianceResumed

• **AssetComplianceResumed** = ``"AssetComplianceResumed"``

#### Defined in

[middleware/types.ts:77277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77277)

___

### AssetCreated

• **AssetCreated** = ``"AssetCreated"``

#### Defined in

[middleware/types.ts:77278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77278)

___

### AssetDidRegistered

• **AssetDidRegistered** = ``"AssetDidRegistered"``

#### Defined in

[middleware/types.ts:77279](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77279)

___

### AssetFrozen

• **AssetFrozen** = ``"AssetFrozen"``

#### Defined in

[middleware/types.ts:77280](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77280)

___

### AssetMediatorsAdded

• **AssetMediatorsAdded** = ``"AssetMediatorsAdded"``

#### Defined in

[middleware/types.ts:77281](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77281)

___

### AssetMediatorsRemoved

• **AssetMediatorsRemoved** = ``"AssetMediatorsRemoved"``

#### Defined in

[middleware/types.ts:77282](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77282)

___

### AssetOwnershipTransferred

• **AssetOwnershipTransferred** = ``"AssetOwnershipTransferred"``

#### Defined in

[middleware/types.ts:77283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77283)

___

### AssetPurchased

• **AssetPurchased** = ``"AssetPurchased"``

#### Defined in

[middleware/types.ts:77284](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77284)

___

### AssetRenamed

• **AssetRenamed** = ``"AssetRenamed"``

#### Defined in

[middleware/types.ts:77285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77285)

___

### AssetRuleChanged

• **AssetRuleChanged** = ``"AssetRuleChanged"``

#### Defined in

[middleware/types.ts:77286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77286)

___

### AssetRuleRemoved

• **AssetRuleRemoved** = ``"AssetRuleRemoved"``

#### Defined in

[middleware/types.ts:77287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77287)

___

### AssetRulesPaused

• **AssetRulesPaused** = ``"AssetRulesPaused"``

#### Defined in

[middleware/types.ts:77288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77288)

___

### AssetRulesReplaced

• **AssetRulesReplaced** = ``"AssetRulesReplaced"``

#### Defined in

[middleware/types.ts:77289](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77289)

___

### AssetRulesReset

• **AssetRulesReset** = ``"AssetRulesReset"``

#### Defined in

[middleware/types.ts:77290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77290)

___

### AssetRulesResumed

• **AssetRulesResumed** = ``"AssetRulesResumed"``

#### Defined in

[middleware/types.ts:77291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77291)

___

### AssetStatsUpdated

• **AssetStatsUpdated** = ``"AssetStatsUpdated"``

#### Defined in

[middleware/types.ts:77292](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77292)

___

### AssetTypeChanged

• **AssetTypeChanged** = ``"AssetTypeChanged"``

#### Defined in

[middleware/types.ts:77293](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77293)

___

### AssetUnfrozen

• **AssetUnfrozen** = ``"AssetUnfrozen"``

#### Defined in

[middleware/types.ts:77294](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77294)

___

### AuthorizationAdded

• **AuthorizationAdded** = ``"AuthorizationAdded"``

#### Defined in

[middleware/types.ts:77295](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77295)

___

### AuthorizationConsumed

• **AuthorizationConsumed** = ``"AuthorizationConsumed"``

#### Defined in

[middleware/types.ts:77296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77296)

___

### AuthorizationRejected

• **AuthorizationRejected** = ``"AuthorizationRejected"``

#### Defined in

[middleware/types.ts:77297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77297)

___

### AuthorizationRetryLimitReached

• **AuthorizationRetryLimitReached** = ``"AuthorizationRetryLimitReached"``

#### Defined in

[middleware/types.ts:77298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77298)

___

### AuthorizationRevoked

• **AuthorizationRevoked** = ``"AuthorizationRevoked"``

#### Defined in

[middleware/types.ts:77299](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77299)

___

### AuthorizedPayingKey

• **AuthorizedPayingKey** = ``"AuthorizedPayingKey"``

#### Defined in

[middleware/types.ts:77300](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77300)

___

### BalanceSet

• **BalanceSet** = ``"BalanceSet"``

#### Defined in

[middleware/types.ts:77301](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77301)

___

### BallotCancelled

• **BallotCancelled** = ``"BallotCancelled"``

#### Defined in

[middleware/types.ts:77302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77302)

___

### BallotCreated

• **BallotCreated** = ``"BallotCreated"``

#### Defined in

[middleware/types.ts:77303](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77303)

___

### BatchCompleted

• **BatchCompleted** = ``"BatchCompleted"``

#### Defined in

[middleware/types.ts:77304](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77304)

___

### BatchCompletedOld

• **BatchCompletedOld** = ``"BatchCompletedOld"``

#### Defined in

[middleware/types.ts:77305](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77305)

___

### BatchCompletedWithErrors

• **BatchCompletedWithErrors** = ``"BatchCompletedWithErrors"``

#### Defined in

[middleware/types.ts:77306](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77306)

___

### BatchInterrupted

• **BatchInterrupted** = ``"BatchInterrupted"``

#### Defined in

[middleware/types.ts:77307](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77307)

___

### BatchInterruptedOld

• **BatchInterruptedOld** = ``"BatchInterruptedOld"``

#### Defined in

[middleware/types.ts:77308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77308)

___

### BatchOptimisticFailed

• **BatchOptimisticFailed** = ``"BatchOptimisticFailed"``

#### Defined in

[middleware/types.ts:77309](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77309)

___

### BenefitClaimed

• **BenefitClaimed** = ``"BenefitClaimed"``

#### Defined in

[middleware/types.ts:77310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77310)

___

### Bonded

• **Bonded** = ``"Bonded"``

#### Defined in

[middleware/types.ts:77311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77311)

___

### BridgeLimitUpdated

• **BridgeLimitUpdated** = ``"BridgeLimitUpdated"``

#### Defined in

[middleware/types.ts:77312](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77312)

___

### BridgeTxFailed

• **BridgeTxFailed** = ``"BridgeTxFailed"``

#### Defined in

[middleware/types.ts:77313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77313)

___

### BridgeTxScheduleFailed

• **BridgeTxScheduleFailed** = ``"BridgeTxScheduleFailed"``

#### Defined in

[middleware/types.ts:77314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77314)

___

### BridgeTxScheduled

• **BridgeTxScheduled** = ``"BridgeTxScheduled"``

#### Defined in

[middleware/types.ts:77315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77315)

___

### Bridged

• **Bridged** = ``"Bridged"``

#### Defined in

[middleware/types.ts:77316](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77316)

___

### Burned

• **Burned** = ``"Burned"``

#### Defined in

[middleware/types.ts:77317](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77317)

___

### CaInitiated

• **CaInitiated** = ``"CAInitiated"``

#### Defined in

[middleware/types.ts:77319](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77319)

___

### CaLinkedToDoc

• **CaLinkedToDoc** = ``"CALinkedToDoc"``

#### Defined in

[middleware/types.ts:77320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77320)

___

### CaRemoved

• **CaRemoved** = ``"CARemoved"``

#### Defined in

[middleware/types.ts:77321](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77321)

___

### CaaTransferred

• **CaaTransferred** = ``"CAATransferred"``

#### Defined in

[middleware/types.ts:77318](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77318)

___

### CallLookupFailed

• **CallLookupFailed** = ``"CallLookupFailed"``

#### Defined in

[middleware/types.ts:77322](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77322)

___

### CallUnavailable

• **CallUnavailable** = ``"CallUnavailable"``

#### Defined in

[middleware/types.ts:77323](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77323)

___

### Called

• **Called** = ``"Called"``

#### Defined in

[middleware/types.ts:77324](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77324)

___

### Canceled

• **Canceled** = ``"Canceled"``

#### Defined in

[middleware/types.ts:77325](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77325)

___

### CddClaimsInvalidated

• **CddClaimsInvalidated** = ``"CddClaimsInvalidated"``

#### Defined in

[middleware/types.ts:77326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77326)

___

### CddRequirementForMasterKeyUpdated

• **CddRequirementForMasterKeyUpdated** = ``"CddRequirementForMasterKeyUpdated"``

#### Defined in

[middleware/types.ts:77327](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77327)

___

### CddRequirementForPrimaryKeyUpdated

• **CddRequirementForPrimaryKeyUpdated** = ``"CddRequirementForPrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:77328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77328)

___

### CddStatus

• **CddStatus** = ``"CddStatus"``

#### Defined in

[middleware/types.ts:77329](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77329)

___

### CheckpointCreated

• **CheckpointCreated** = ``"CheckpointCreated"``

#### Defined in

[middleware/types.ts:77330](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77330)

___

### ChildDidCreated

• **ChildDidCreated** = ``"ChildDidCreated"``

#### Defined in

[middleware/types.ts:77331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77331)

___

### ChildDidUnlinked

• **ChildDidUnlinked** = ``"ChildDidUnlinked"``

#### Defined in

[middleware/types.ts:77332](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77332)

___

### ClaimAdded

• **ClaimAdded** = ``"ClaimAdded"``

#### Defined in

[middleware/types.ts:77333](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77333)

___

### ClaimRevoked

• **ClaimRevoked** = ``"ClaimRevoked"``

#### Defined in

[middleware/types.ts:77334](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77334)

___

### ClassicTickerClaimed

• **ClassicTickerClaimed** = ``"ClassicTickerClaimed"``

#### Defined in

[middleware/types.ts:77335](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77335)

___

### Cleared

• **Cleared** = ``"Cleared"``

#### Defined in

[middleware/types.ts:77336](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77336)

___

### Closed

• **Closed** = ``"Closed"``

#### Defined in

[middleware/types.ts:77337](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77337)

___

### CodeRemoved

• **CodeRemoved** = ``"CodeRemoved"``

#### Defined in

[middleware/types.ts:77338](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77338)

___

### CodeStored

• **CodeStored** = ``"CodeStored"``

#### Defined in

[middleware/types.ts:77339](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77339)

___

### CodeUpdated

• **CodeUpdated** = ``"CodeUpdated"``

#### Defined in

[middleware/types.ts:77340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77340)

___

### CoefficientSet

• **CoefficientSet** = ``"CoefficientSet"``

#### Defined in

[middleware/types.ts:77341](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77341)

___

### CommissionCapUpdated

• **CommissionCapUpdated** = ``"CommissionCapUpdated"``

#### Defined in

[middleware/types.ts:77342](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77342)

___

### ComplianceRequirementChanged

• **ComplianceRequirementChanged** = ``"ComplianceRequirementChanged"``

#### Defined in

[middleware/types.ts:77343](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77343)

___

### ComplianceRequirementCreated

• **ComplianceRequirementCreated** = ``"ComplianceRequirementCreated"``

#### Defined in

[middleware/types.ts:77344](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77344)

___

### ComplianceRequirementRemoved

• **ComplianceRequirementRemoved** = ``"ComplianceRequirementRemoved"``

#### Defined in

[middleware/types.ts:77345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77345)

___

### ContractCodeUpdated

• **ContractCodeUpdated** = ``"ContractCodeUpdated"``

#### Defined in

[middleware/types.ts:77346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77346)

___

### ContractEmitted

• **ContractEmitted** = ``"ContractEmitted"``

#### Defined in

[middleware/types.ts:77347](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77347)

___

### ContractExecution

• **ContractExecution** = ``"ContractExecution"``

#### Defined in

[middleware/types.ts:77348](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77348)

___

### ControllerChanged

• **ControllerChanged** = ``"ControllerChanged"``

#### Defined in

[middleware/types.ts:77349](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77349)

___

### ControllerRedemption

• **ControllerRedemption** = ``"ControllerRedemption"``

#### Defined in

[middleware/types.ts:77350](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77350)

___

### ControllerTransfer

• **ControllerTransfer** = ``"ControllerTransfer"``

#### Defined in

[middleware/types.ts:77351](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77351)

___

### Created

• **Created** = ``"Created"``

#### Defined in

[middleware/types.ts:77352](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77352)

___

### CustodyAllowanceChanged

• **CustodyAllowanceChanged** = ``"CustodyAllowanceChanged"``

#### Defined in

[middleware/types.ts:77353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77353)

___

### CustodyTransfer

• **CustodyTransfer** = ``"CustodyTransfer"``

#### Defined in

[middleware/types.ts:77354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77354)

___

### CustomAssetTypeExists

• **CustomAssetTypeExists** = ``"CustomAssetTypeExists"``

#### Defined in

[middleware/types.ts:77355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77355)

___

### CustomAssetTypeRegistered

• **CustomAssetTypeRegistered** = ``"CustomAssetTypeRegistered"``

#### Defined in

[middleware/types.ts:77356](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77356)

___

### CustomClaimTypeAdded

• **CustomClaimTypeAdded** = ``"CustomClaimTypeAdded"``

#### Defined in

[middleware/types.ts:77357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77357)

___

### DefaultEnactmentPeriodChanged

• **DefaultEnactmentPeriodChanged** = ``"DefaultEnactmentPeriodChanged"``

#### Defined in

[middleware/types.ts:77358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77358)

___

### DefaultTargetIdentitiesChanged

• **DefaultTargetIdentitiesChanged** = ``"DefaultTargetIdentitiesChanged"``

#### Defined in

[middleware/types.ts:77359](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77359)

___

### DefaultWithholdingTaxChanged

• **DefaultWithholdingTaxChanged** = ``"DefaultWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:77360](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77360)

___

### DelegateCalled

• **DelegateCalled** = ``"DelegateCalled"``

#### Defined in

[middleware/types.ts:77361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77361)

___

### DidCreated

• **DidCreated** = ``"DidCreated"``

#### Defined in

[middleware/types.ts:77362](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77362)

___

### DidStatus

• **DidStatus** = ``"DidStatus"``

#### Defined in

[middleware/types.ts:77363](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77363)

___

### DidWithholdingTaxChanged

• **DidWithholdingTaxChanged** = ``"DidWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:77364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77364)

___

### Dispatched

• **Dispatched** = ``"Dispatched"``

#### Defined in

[middleware/types.ts:77365](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77365)

___

### DispatchedAs

• **DispatchedAs** = ``"DispatchedAs"``

#### Defined in

[middleware/types.ts:77366](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77366)

___

### DividendCanceled

• **DividendCanceled** = ``"DividendCanceled"``

#### Defined in

[middleware/types.ts:77367](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77367)

___

### DividendCreated

• **DividendCreated** = ``"DividendCreated"``

#### Defined in

[middleware/types.ts:77368](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77368)

___

### DividendPaidOutToUser

• **DividendPaidOutToUser** = ``"DividendPaidOutToUser"``

#### Defined in

[middleware/types.ts:77369](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77369)

___

### DividendRemainingClaimed

• **DividendRemainingClaimed** = ``"DividendRemainingClaimed"``

#### Defined in

[middleware/types.ts:77370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77370)

___

### DivisibilityChanged

• **DivisibilityChanged** = ``"DivisibilityChanged"``

#### Defined in

[middleware/types.ts:77371](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77371)

___

### DocumentAdded

• **DocumentAdded** = ``"DocumentAdded"``

#### Defined in

[middleware/types.ts:77372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77372)

___

### DocumentRemoved

• **DocumentRemoved** = ``"DocumentRemoved"``

#### Defined in

[middleware/types.ts:77373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77373)

___

### Dummy

• **Dummy** = ``"Dummy"``

#### Defined in

[middleware/types.ts:77374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77374)

___

### Endowed

• **Endowed** = ``"Endowed"``

#### Defined in

[middleware/types.ts:77375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77375)

___

### EraPayout

• **EraPayout** = ``"EraPayout"``

#### Defined in

[middleware/types.ts:77376](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77376)

___

### Evicted

• **Evicted** = ``"Evicted"``

#### Defined in

[middleware/types.ts:77377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77377)

___

### Executed

• **Executed** = ``"Executed"``

#### Defined in

[middleware/types.ts:77378](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77378)

___

### ExecutionCancellingFailed

• **ExecutionCancellingFailed** = ``"ExecutionCancellingFailed"``

#### Defined in

[middleware/types.ts:77379](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77379)

___

### ExecutionScheduled

• **ExecutionScheduled** = ``"ExecutionScheduled"``

#### Defined in

[middleware/types.ts:77380](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77380)

___

### ExecutionSchedulingFailed

• **ExecutionSchedulingFailed** = ``"ExecutionSchedulingFailed"``

#### Defined in

[middleware/types.ts:77381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77381)

___

### ExemptedUpdated

• **ExemptedUpdated** = ``"ExemptedUpdated"``

#### Defined in

[middleware/types.ts:77382](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77382)

___

### ExemptionListModified

• **ExemptionListModified** = ``"ExemptionListModified"``

#### Defined in

[middleware/types.ts:77383](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77383)

___

### ExemptionsAdded

• **ExemptionsAdded** = ``"ExemptionsAdded"``

#### Defined in

[middleware/types.ts:77384](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77384)

___

### ExemptionsRemoved

• **ExemptionsRemoved** = ``"ExemptionsRemoved"``

#### Defined in

[middleware/types.ts:77385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77385)

___

### ExpiresAfterUpdated

• **ExpiresAfterUpdated** = ``"ExpiresAfterUpdated"``

#### Defined in

[middleware/types.ts:77386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77386)

___

### ExpiryScheduled

• **ExpiryScheduled** = ``"ExpiryScheduled"``

#### Defined in

[middleware/types.ts:77387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77387)

___

### ExpirySchedulingFailed

• **ExpirySchedulingFailed** = ``"ExpirySchedulingFailed"``

#### Defined in

[middleware/types.ts:77388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77388)

___

### ExtensionAdded

• **ExtensionAdded** = ``"ExtensionAdded"``

#### Defined in

[middleware/types.ts:77389](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77389)

___

### ExtensionArchived

• **ExtensionArchived** = ``"ExtensionArchived"``

#### Defined in

[middleware/types.ts:77390](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77390)

___

### ExtensionRemoved

• **ExtensionRemoved** = ``"ExtensionRemoved"``

#### Defined in

[middleware/types.ts:77391](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77391)

___

### ExtensionUnArchive

• **ExtensionUnArchive** = ``"ExtensionUnArchive"``

#### Defined in

[middleware/types.ts:77392](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77392)

___

### ExtrinsicFailed

• **ExtrinsicFailed** = ``"ExtrinsicFailed"``

#### Defined in

[middleware/types.ts:77393](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77393)

___

### ExtrinsicSuccess

• **ExtrinsicSuccess** = ``"ExtrinsicSuccess"``

#### Defined in

[middleware/types.ts:77394](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77394)

___

### FailedToExecuteInstruction

• **FailedToExecuteInstruction** = ``"FailedToExecuteInstruction"``

#### Defined in

[middleware/types.ts:77395](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77395)

___

### FeeCharged

• **FeeCharged** = ``"FeeCharged"``

#### Defined in

[middleware/types.ts:77396](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77396)

___

### FeeSet

• **FeeSet** = ``"FeeSet"``

#### Defined in

[middleware/types.ts:77397](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77397)

___

### FinalVotes

• **FinalVotes** = ``"FinalVotes"``

#### Defined in

[middleware/types.ts:77398](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77398)

___

### FreezeAdminAdded

• **FreezeAdminAdded** = ``"FreezeAdminAdded"``

#### Defined in

[middleware/types.ts:77399](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77399)

___

### FreezeAdminRemoved

• **FreezeAdminRemoved** = ``"FreezeAdminRemoved"``

#### Defined in

[middleware/types.ts:77400](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77400)

___

### Frozen

• **Frozen** = ``"Frozen"``

#### Defined in

[middleware/types.ts:77401](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77401)

___

### FrozenTx

• **FrozenTx** = ``"FrozenTx"``

#### Defined in

[middleware/types.ts:77402](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77402)

___

### FundingRoundSet

• **FundingRoundSet** = ``"FundingRoundSet"``

#### Defined in

[middleware/types.ts:77403](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77403)

___

### FundraiserClosed

• **FundraiserClosed** = ``"FundraiserClosed"``

#### Defined in

[middleware/types.ts:77404](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77404)

___

### FundraiserCreated

• **FundraiserCreated** = ``"FundraiserCreated"``

#### Defined in

[middleware/types.ts:77405](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77405)

___

### FundraiserFrozen

• **FundraiserFrozen** = ``"FundraiserFrozen"``

#### Defined in

[middleware/types.ts:77406](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77406)

___

### FundraiserUnfrozen

• **FundraiserUnfrozen** = ``"FundraiserUnfrozen"``

#### Defined in

[middleware/types.ts:77407](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77407)

___

### FundraiserWindowModifed

• **FundraiserWindowModifed** = ``"FundraiserWindowModifed"``

#### Defined in

[middleware/types.ts:77408](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77408)

___

### FundraiserWindowModified

• **FundraiserWindowModified** = ``"FundraiserWindowModified"``

#### Defined in

[middleware/types.ts:77409](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77409)

___

### FundsMoved

• **FundsMoved** = ``"FundsMoved"``

#### Defined in

[middleware/types.ts:77410](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77410)

___

### FundsMovedBetweenPortfolios

• **FundsMovedBetweenPortfolios** = ``"FundsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:77411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77411)

___

### FundsRaised

• **FundsRaised** = ``"FundsRaised"``

#### Defined in

[middleware/types.ts:77412](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77412)

___

### FungibleTokensMovedBetweenPortfolios

• **FungibleTokensMovedBetweenPortfolios** = ``"FungibleTokensMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:77413](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77413)

___

### GlobalCommissionUpdated

• **GlobalCommissionUpdated** = ``"GlobalCommissionUpdated"``

#### Defined in

[middleware/types.ts:77414](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77414)

___

### GroupChanged

• **GroupChanged** = ``"GroupChanged"``

#### Defined in

[middleware/types.ts:77415](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77415)

___

### GroupCreated

• **GroupCreated** = ``"GroupCreated"``

#### Defined in

[middleware/types.ts:77416](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77416)

___

### GroupPermissionsUpdated

• **GroupPermissionsUpdated** = ``"GroupPermissionsUpdated"``

#### Defined in

[middleware/types.ts:77417](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77417)

___

### HeartbeatReceived

• **HeartbeatReceived** = ``"HeartbeatReceived"``

#### Defined in

[middleware/types.ts:77418](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77418)

___

### HistoricalPipsPruned

• **HistoricalPipsPruned** = ``"HistoricalPipsPruned"``

#### Defined in

[middleware/types.ts:77419](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77419)

___

### IdentifiersUpdated

• **IdentifiersUpdated** = ``"IdentifiersUpdated"``

#### Defined in

[middleware/types.ts:77420](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77420)

___

### IndexAssigned

• **IndexAssigned** = ``"IndexAssigned"``

#### Defined in

[middleware/types.ts:77421](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77421)

___

### IndexFreed

• **IndexFreed** = ``"IndexFreed"``

#### Defined in

[middleware/types.ts:77422](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77422)

___

### IndexFrozen

• **IndexFrozen** = ``"IndexFrozen"``

#### Defined in

[middleware/types.ts:77423](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77423)

___

### IndividualCommissionEnabled

• **IndividualCommissionEnabled** = ``"IndividualCommissionEnabled"``

#### Defined in

[middleware/types.ts:77424](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77424)

___

### Instantiated

• **Instantiated** = ``"Instantiated"``

#### Defined in

[middleware/types.ts:77425](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77425)

___

### InstantiationFeeChanged

• **InstantiationFeeChanged** = ``"InstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:77426](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77426)

___

### InstantiationFreezed

• **InstantiationFreezed** = ``"InstantiationFreezed"``

#### Defined in

[middleware/types.ts:77427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77427)

___

### InstantiationUnFreezed

• **InstantiationUnFreezed** = ``"InstantiationUnFreezed"``

#### Defined in

[middleware/types.ts:77428](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77428)

___

### InstructionAffirmed

• **InstructionAffirmed** = ``"InstructionAffirmed"``

#### Defined in

[middleware/types.ts:77429](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77429)

___

### InstructionAuthorized

• **InstructionAuthorized** = ``"InstructionAuthorized"``

#### Defined in

[middleware/types.ts:77430](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77430)

___

### InstructionAutomaticallyAffirmed

• **InstructionAutomaticallyAffirmed** = ``"InstructionAutomaticallyAffirmed"``

#### Defined in

[middleware/types.ts:77431](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77431)

___

### InstructionCreated

• **InstructionCreated** = ``"InstructionCreated"``

#### Defined in

[middleware/types.ts:77432](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77432)

___

### InstructionExecuted

• **InstructionExecuted** = ``"InstructionExecuted"``

#### Defined in

[middleware/types.ts:77433](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77433)

___

### InstructionFailed

• **InstructionFailed** = ``"InstructionFailed"``

#### Defined in

[middleware/types.ts:77434](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77434)

___

### InstructionMediators

• **InstructionMediators** = ``"InstructionMediators"``

#### Defined in

[middleware/types.ts:77435](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77435)

___

### InstructionRejected

• **InstructionRejected** = ``"InstructionRejected"``

#### Defined in

[middleware/types.ts:77436](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77436)

___

### InstructionRescheduled

• **InstructionRescheduled** = ``"InstructionRescheduled"``

#### Defined in

[middleware/types.ts:77437](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77437)

___

### InstructionUnauthorized

• **InstructionUnauthorized** = ``"InstructionUnauthorized"``

#### Defined in

[middleware/types.ts:77438](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77438)

___

### InstructionV2Created

• **InstructionV2Created** = ``"InstructionV2Created"``

#### Defined in

[middleware/types.ts:77439](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77439)

___

### InvalidatedNominators

• **InvalidatedNominators** = ``"InvalidatedNominators"``

#### Defined in

[middleware/types.ts:77440](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77440)

___

### Invested

• **Invested** = ``"Invested"``

#### Defined in

[middleware/types.ts:77441](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77441)

___

### InvestorUniquenessClaimNotAllowed

• **InvestorUniquenessClaimNotAllowed** = ``"InvestorUniquenessClaimNotAllowed"``

#### Defined in

[middleware/types.ts:77442](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77442)

___

### IsIssuable

• **IsIssuable** = ``"IsIssuable"``

#### Defined in

[middleware/types.ts:77443](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77443)

___

### Issued

• **Issued** = ``"Issued"``

#### Defined in

[middleware/types.ts:77444](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77444)

___

### IssuedNft

• **IssuedNft** = ``"IssuedNFT"``

#### Defined in

[middleware/types.ts:77445](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77445)

___

### ItemCompleted

• **ItemCompleted** = ``"ItemCompleted"``

#### Defined in

[middleware/types.ts:77446](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77446)

___

### ItemFailed

• **ItemFailed** = ``"ItemFailed"``

#### Defined in

[middleware/types.ts:77447](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77447)

___

### ItnRewardClaimed

• **ItnRewardClaimed** = ``"ItnRewardClaimed"``

#### Defined in

[middleware/types.ts:77448](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77448)

___

### KeyChanged

• **KeyChanged** = ``"KeyChanged"``

#### Defined in

[middleware/types.ts:77449](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77449)

___

### KilledAccount

• **KilledAccount** = ``"KilledAccount"``

#### Defined in

[middleware/types.ts:77450](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77450)

___

### LegFailedExecution

• **LegFailedExecution** = ``"LegFailedExecution"``

#### Defined in

[middleware/types.ts:77451](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77451)

___

### LocalMetadataKeyDeleted

• **LocalMetadataKeyDeleted** = ``"LocalMetadataKeyDeleted"``

#### Defined in

[middleware/types.ts:77452](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77452)

___

### MasterKeyUpdated

• **MasterKeyUpdated** = ``"MasterKeyUpdated"``

#### Defined in

[middleware/types.ts:77453](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77453)

___

### MaxDetailsLengthChanged

• **MaxDetailsLengthChanged** = ``"MaxDetailsLengthChanged"``

#### Defined in

[middleware/types.ts:77454](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77454)

___

### MaxPipSkipCountChanged

• **MaxPipSkipCountChanged** = ``"MaxPipSkipCountChanged"``

#### Defined in

[middleware/types.ts:77455](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77455)

___

### MaximumSchedulesComplexityChanged

• **MaximumSchedulesComplexityChanged** = ``"MaximumSchedulesComplexityChanged"``

#### Defined in

[middleware/types.ts:77456](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77456)

___

### MediatorAffirmationReceived

• **MediatorAffirmationReceived** = ``"MediatorAffirmationReceived"``

#### Defined in

[middleware/types.ts:77457](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77457)

___

### MediatorAffirmationWithdrawn

• **MediatorAffirmationWithdrawn** = ``"MediatorAffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:77458](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77458)

___

### MemberAdded

• **MemberAdded** = ``"MemberAdded"``

#### Defined in

[middleware/types.ts:77459](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77459)

___

### MemberRemoved

• **MemberRemoved** = ``"MemberRemoved"``

#### Defined in

[middleware/types.ts:77460](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77460)

___

### MemberRevoked

• **MemberRevoked** = ``"MemberRevoked"``

#### Defined in

[middleware/types.ts:77461](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77461)

___

### MembersReset

• **MembersReset** = ``"MembersReset"``

#### Defined in

[middleware/types.ts:77462](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77462)

___

### MembersSwapped

• **MembersSwapped** = ``"MembersSwapped"``

#### Defined in

[middleware/types.ts:77463](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77463)

___

### MetaChanged

• **MetaChanged** = ``"MetaChanged"``

#### Defined in

[middleware/types.ts:77464](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77464)

___

### MetadataValueDeleted

• **MetadataValueDeleted** = ``"MetadataValueDeleted"``

#### Defined in

[middleware/types.ts:77465](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77465)

___

### MinimumBondThresholdUpdated

• **MinimumBondThresholdUpdated** = ``"MinimumBondThresholdUpdated"``

#### Defined in

[middleware/types.ts:77466](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77466)

___

### MinimumProposalDepositChanged

• **MinimumProposalDepositChanged** = ``"MinimumProposalDepositChanged"``

#### Defined in

[middleware/types.ts:77467](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77467)

___

### MockInvestorUidCreated

• **MockInvestorUidCreated** = ``"MockInvestorUIDCreated"``

#### Defined in

[middleware/types.ts:77468](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77468)

___

### MovedBetweenPortfolios

• **MovedBetweenPortfolios** = ``"MovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:77469](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77469)

___

### MultiSigCreated

• **MultiSigCreated** = ``"MultiSigCreated"``

#### Defined in

[middleware/types.ts:77470](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77470)

___

### MultiSigSignaturesRequiredChanged

• **MultiSigSignaturesRequiredChanged** = ``"MultiSigSignaturesRequiredChanged"``

#### Defined in

[middleware/types.ts:77471](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77471)

___

### MultiSigSignerAdded

• **MultiSigSignerAdded** = ``"MultiSigSignerAdded"``

#### Defined in

[middleware/types.ts:77472](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77472)

___

### MultiSigSignerAuthorized

• **MultiSigSignerAuthorized** = ``"MultiSigSignerAuthorized"``

#### Defined in

[middleware/types.ts:77473](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77473)

___

### MultiSigSignerRemoved

• **MultiSigSignerRemoved** = ``"MultiSigSignerRemoved"``

#### Defined in

[middleware/types.ts:77474](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77474)

___

### NewAccount

• **NewAccount** = ``"NewAccount"``

#### Defined in

[middleware/types.ts:77477](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77477)

___

### NewAssetRuleCreated

• **NewAssetRuleCreated** = ``"NewAssetRuleCreated"``

#### Defined in

[middleware/types.ts:77478](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77478)

___

### NewAuthorities

• **NewAuthorities** = ``"NewAuthorities"``

#### Defined in

[middleware/types.ts:77479](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77479)

___

### NewSession

• **NewSession** = ``"NewSession"``

#### Defined in

[middleware/types.ts:77480](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77480)

___

### NfTsMovedBetweenPortfolios

• **NfTsMovedBetweenPortfolios** = ``"NFTsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:77476](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77476)

___

### NftCollectionCreated

• **NftCollectionCreated** = ``"NftCollectionCreated"``

#### Defined in

[middleware/types.ts:77481](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77481)

___

### NftPortfolioUpdated

• **NftPortfolioUpdated** = ``"NFTPortfolioUpdated"``

#### Defined in

[middleware/types.ts:77475](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77475)

___

### Nominated

• **Nominated** = ``"Nominated"``

#### Defined in

[middleware/types.ts:77482](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77482)

___

### Noted

• **Noted** = ``"Noted"``

#### Defined in

[middleware/types.ts:77483](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77483)

___

### OffChainAuthorizationRevoked

• **OffChainAuthorizationRevoked** = ``"OffChainAuthorizationRevoked"``

#### Defined in

[middleware/types.ts:77484](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77484)

___

### Offence

• **Offence** = ``"Offence"``

#### Defined in

[middleware/types.ts:77485](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77485)

___

### OldSlashingReportDiscarded

• **OldSlashingReportDiscarded** = ``"OldSlashingReportDiscarded"``

#### Defined in

[middleware/types.ts:77486](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77486)

___

### Paused

• **Paused** = ``"Paused"``

#### Defined in

[middleware/types.ts:77487](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77487)

___

### PendingPipExpiryChanged

• **PendingPipExpiryChanged** = ``"PendingPipExpiryChanged"``

#### Defined in

[middleware/types.ts:77488](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77488)

___

### PeriodicFailed

• **PeriodicFailed** = ``"PeriodicFailed"``

#### Defined in

[middleware/types.ts:77489](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77489)

___

### PermanentlyOverweight

• **PermanentlyOverweight** = ``"PermanentlyOverweight"``

#### Defined in

[middleware/types.ts:77490](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77490)

___

### PermissionedIdentityAdded

• **PermissionedIdentityAdded** = ``"PermissionedIdentityAdded"``

#### Defined in

[middleware/types.ts:77491](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77491)

___

### PermissionedIdentityRemoved

• **PermissionedIdentityRemoved** = ``"PermissionedIdentityRemoved"``

#### Defined in

[middleware/types.ts:77492](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77492)

___

### PermissionedValidatorAdded

• **PermissionedValidatorAdded** = ``"PermissionedValidatorAdded"``

#### Defined in

[middleware/types.ts:77493](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77493)

___

### PermissionedValidatorRemoved

• **PermissionedValidatorRemoved** = ``"PermissionedValidatorRemoved"``

#### Defined in

[middleware/types.ts:77494](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77494)

___

### PermissionedValidatorStatusChanged

• **PermissionedValidatorStatusChanged** = ``"PermissionedValidatorStatusChanged"``

#### Defined in

[middleware/types.ts:77495](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77495)

___

### PipClosed

• **PipClosed** = ``"PipClosed"``

#### Defined in

[middleware/types.ts:77496](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77496)

___

### PipSkipped

• **PipSkipped** = ``"PipSkipped"``

#### Defined in

[middleware/types.ts:77497](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77497)

___

### PlaceholderFillBlock

• **PlaceholderFillBlock** = ``"PlaceholderFillBlock"``

#### Defined in

[middleware/types.ts:77498](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77498)

___

### PortfolioCreated

• **PortfolioCreated** = ``"PortfolioCreated"``

#### Defined in

[middleware/types.ts:77499](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77499)

___

### PortfolioCustodianChanged

• **PortfolioCustodianChanged** = ``"PortfolioCustodianChanged"``

#### Defined in

[middleware/types.ts:77500](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77500)

___

### PortfolioDeleted

• **PortfolioDeleted** = ``"PortfolioDeleted"``

#### Defined in

[middleware/types.ts:77501](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77501)

___

### PortfolioRenamed

• **PortfolioRenamed** = ``"PortfolioRenamed"``

#### Defined in

[middleware/types.ts:77502](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77502)

___

### PreApprovedAsset

• **PreApprovedAsset** = ``"PreApprovedAsset"``

#### Defined in

[middleware/types.ts:77503](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77503)

___

### PreApprovedPortfolio

• **PreApprovedPortfolio** = ``"PreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:77504](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77504)

___

### PrimaryIssuanceAgentTransfered

• **PrimaryIssuanceAgentTransfered** = ``"PrimaryIssuanceAgentTransfered"``

#### Defined in

[middleware/types.ts:77505](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77505)

___

### PrimaryIssuanceAgentTransferred

• **PrimaryIssuanceAgentTransferred** = ``"PrimaryIssuanceAgentTransferred"``

#### Defined in

[middleware/types.ts:77506](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77506)

___

### PrimaryKeyUpdated

• **PrimaryKeyUpdated** = ``"PrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:77507](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77507)

___

### ProposalAdded

• **ProposalAdded** = ``"ProposalAdded"``

#### Defined in

[middleware/types.ts:77508](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77508)

___

### ProposalApproved

• **ProposalApproved** = ``"ProposalApproved"``

#### Defined in

[middleware/types.ts:77509](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77509)

___

### ProposalBondAdjusted

• **ProposalBondAdjusted** = ``"ProposalBondAdjusted"``

#### Defined in

[middleware/types.ts:77510](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77510)

___

### ProposalCoolOffPeriodChanged

• **ProposalCoolOffPeriodChanged** = ``"ProposalCoolOffPeriodChanged"``

#### Defined in

[middleware/types.ts:77511](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77511)

___

### ProposalCreated

• **ProposalCreated** = ``"ProposalCreated"``

#### Defined in

[middleware/types.ts:77512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77512)

___

### ProposalDetailsAmended

• **ProposalDetailsAmended** = ``"ProposalDetailsAmended"``

#### Defined in

[middleware/types.ts:77513](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77513)

___

### ProposalDurationChanged

• **ProposalDurationChanged** = ``"ProposalDurationChanged"``

#### Defined in

[middleware/types.ts:77514](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77514)

___

### ProposalExecuted

• **ProposalExecuted** = ``"ProposalExecuted"``

#### Defined in

[middleware/types.ts:77515](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77515)

___

### ProposalExecutionFailed

• **ProposalExecutionFailed** = ``"ProposalExecutionFailed"``

#### Defined in

[middleware/types.ts:77516](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77516)

___

### ProposalFailedToExecute

• **ProposalFailedToExecute** = ``"ProposalFailedToExecute"``

#### Defined in

[middleware/types.ts:77517](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77517)

___

### ProposalRefund

• **ProposalRefund** = ``"ProposalRefund"``

#### Defined in

[middleware/types.ts:77518](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77518)

___

### ProposalRejected

• **ProposalRejected** = ``"ProposalRejected"``

#### Defined in

[middleware/types.ts:77519](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77519)

___

### ProposalRejectionVote

• **ProposalRejectionVote** = ``"ProposalRejectionVote"``

#### Defined in

[middleware/types.ts:77520](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77520)

___

### ProposalStateUpdated

• **ProposalStateUpdated** = ``"ProposalStateUpdated"``

#### Defined in

[middleware/types.ts:77521](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77521)

___

### Proposed

• **Proposed** = ``"Proposed"``

#### Defined in

[middleware/types.ts:77522](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77522)

___

### PutCodeFlagChanged

• **PutCodeFlagChanged** = ``"PutCodeFlagChanged"``

#### Defined in

[middleware/types.ts:77523](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77523)

___

### QuorumThresholdChanged

• **QuorumThresholdChanged** = ``"QuorumThresholdChanged"``

#### Defined in

[middleware/types.ts:77524](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77524)

___

### RangeChanged

• **RangeChanged** = ``"RangeChanged"``

#### Defined in

[middleware/types.ts:77526](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77526)

___

### RangeProofAdded

• **RangeProofAdded** = ``"RangeProofAdded"``

#### Defined in

[middleware/types.ts:77527](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77527)

___

### RangeProofVerified

• **RangeProofVerified** = ``"RangeProofVerified"``

#### Defined in

[middleware/types.ts:77528](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77528)

___

### RcvChanged

• **RcvChanged** = ``"RCVChanged"``

#### Defined in

[middleware/types.ts:77525](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77525)

___

### ReceiptClaimed

• **ReceiptClaimed** = ``"ReceiptClaimed"``

#### Defined in

[middleware/types.ts:77529](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77529)

___

### ReceiptUnclaimed

• **ReceiptUnclaimed** = ``"ReceiptUnclaimed"``

#### Defined in

[middleware/types.ts:77530](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77530)

___

### ReceiptValidityChanged

• **ReceiptValidityChanged** = ``"ReceiptValidityChanged"``

#### Defined in

[middleware/types.ts:77531](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77531)

___

### Reclaimed

• **Reclaimed** = ``"Reclaimed"``

#### Defined in

[middleware/types.ts:77532](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77532)

___

### RecordDateChanged

• **RecordDateChanged** = ``"RecordDateChanged"``

#### Defined in

[middleware/types.ts:77533](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77533)

___

### Redeemed

• **Redeemed** = ``"Redeemed"``

#### Defined in

[middleware/types.ts:77534](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77534)

___

### RedeemedNft

• **RedeemedNft** = ``"RedeemedNFT"``

#### Defined in

[middleware/types.ts:77535](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77535)

___

### ReferendumCreated

• **ReferendumCreated** = ``"ReferendumCreated"``

#### Defined in

[middleware/types.ts:77536](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77536)

___

### ReferendumScheduled

• **ReferendumScheduled** = ``"ReferendumScheduled"``

#### Defined in

[middleware/types.ts:77537](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77537)

___

### ReferendumStateUpdated

• **ReferendumStateUpdated** = ``"ReferendumStateUpdated"``

#### Defined in

[middleware/types.ts:77538](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77538)

___

### RegisterAssetMetadataGlobalType

• **RegisterAssetMetadataGlobalType** = ``"RegisterAssetMetadataGlobalType"``

#### Defined in

[middleware/types.ts:77539](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77539)

___

### RegisterAssetMetadataLocalType

• **RegisterAssetMetadataLocalType** = ``"RegisterAssetMetadataLocalType"``

#### Defined in

[middleware/types.ts:77540](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77540)

___

### Rejected

• **Rejected** = ``"Rejected"``

#### Defined in

[middleware/types.ts:77541](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77541)

___

### RelayedTx

• **RelayedTx** = ``"RelayedTx"``

#### Defined in

[middleware/types.ts:77542](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77542)

___

### ReleaseCoordinatorUpdated

• **ReleaseCoordinatorUpdated** = ``"ReleaseCoordinatorUpdated"``

#### Defined in

[middleware/types.ts:77543](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77543)

___

### Remarked

• **Remarked** = ``"Remarked"``

#### Defined in

[middleware/types.ts:77544](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77544)

___

### RemoveAssetAffirmationExemption

• **RemoveAssetAffirmationExemption** = ``"RemoveAssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:77545](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77545)

___

### RemovePreApprovedAsset

• **RemovePreApprovedAsset** = ``"RemovePreApprovedAsset"``

#### Defined in

[middleware/types.ts:77546](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77546)

___

### Removed

• **Removed** = ``"Removed"``

#### Defined in

[middleware/types.ts:77547](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77547)

___

### RemovedPayingKey

• **RemovedPayingKey** = ``"RemovedPayingKey"``

#### Defined in

[middleware/types.ts:77548](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77548)

___

### Requested

• **Requested** = ``"Requested"``

#### Defined in

[middleware/types.ts:77549](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77549)

___

### ReserveRepatriated

• **ReserveRepatriated** = ``"ReserveRepatriated"``

#### Defined in

[middleware/types.ts:77550](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77550)

___

### Reserved

• **Reserved** = ``"Reserved"``

#### Defined in

[middleware/types.ts:77551](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77551)

___

### Restored

• **Restored** = ``"Restored"``

#### Defined in

[middleware/types.ts:77552](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77552)

___

### Resumed

• **Resumed** = ``"Resumed"``

#### Defined in

[middleware/types.ts:77553](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77553)

___

### RevokePreApprovedPortfolio

• **RevokePreApprovedPortfolio** = ``"RevokePreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:77554](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77554)

___

### Reward

• **Reward** = ``"Reward"``

#### Defined in

[middleware/types.ts:77555](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77555)

___

### RewardPaymentSchedulingInterrupted

• **RewardPaymentSchedulingInterrupted** = ``"RewardPaymentSchedulingInterrupted"``

#### Defined in

[middleware/types.ts:77556](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77556)

___

### ScRuntimeCall

• **ScRuntimeCall** = ``"SCRuntimeCall"``

#### Defined in

[middleware/types.ts:77557](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77557)

___

### ScheduleCreated

• **ScheduleCreated** = ``"ScheduleCreated"``

#### Defined in

[middleware/types.ts:77558](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77558)

___

### ScheduleRemoved

• **ScheduleRemoved** = ``"ScheduleRemoved"``

#### Defined in

[middleware/types.ts:77559](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77559)

___

### ScheduleUpdated

• **ScheduleUpdated** = ``"ScheduleUpdated"``

#### Defined in

[middleware/types.ts:77560](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77560)

___

### Scheduled

• **Scheduled** = ``"Scheduled"``

#### Defined in

[middleware/types.ts:77561](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77561)

___

### SchedulingFailed

• **SchedulingFailed** = ``"SchedulingFailed"``

#### Defined in

[middleware/types.ts:77562](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77562)

___

### SecondaryKeyLeftIdentity

• **SecondaryKeyLeftIdentity** = ``"SecondaryKeyLeftIdentity"``

#### Defined in

[middleware/types.ts:77563](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77563)

___

### SecondaryKeyPermissionsUpdated

• **SecondaryKeyPermissionsUpdated** = ``"SecondaryKeyPermissionsUpdated"``

#### Defined in

[middleware/types.ts:77564](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77564)

___

### SecondaryKeysAdded

• **SecondaryKeysAdded** = ``"SecondaryKeysAdded"``

#### Defined in

[middleware/types.ts:77565](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77565)

___

### SecondaryKeysFrozen

• **SecondaryKeysFrozen** = ``"SecondaryKeysFrozen"``

#### Defined in

[middleware/types.ts:77566](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77566)

___

### SecondaryKeysRemoved

• **SecondaryKeysRemoved** = ``"SecondaryKeysRemoved"``

#### Defined in

[middleware/types.ts:77567](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77567)

___

### SecondaryKeysUnfrozen

• **SecondaryKeysUnfrozen** = ``"SecondaryKeysUnfrozen"``

#### Defined in

[middleware/types.ts:77568](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77568)

___

### SecondaryPermissionsUpdated

• **SecondaryPermissionsUpdated** = ``"SecondaryPermissionsUpdated"``

#### Defined in

[middleware/types.ts:77569](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77569)

___

### SetAssetMediators

• **SetAssetMediators** = ``"SetAssetMediators"``

#### Defined in

[middleware/types.ts:77570](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77570)

___

### SetAssetMetadataValue

• **SetAssetMetadataValue** = ``"SetAssetMetadataValue"``

#### Defined in

[middleware/types.ts:77571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77571)

___

### SetAssetMetadataValueDetails

• **SetAssetMetadataValueDetails** = ``"SetAssetMetadataValueDetails"``

#### Defined in

[middleware/types.ts:77572](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77572)

___

### SetAssetTransferCompliance

• **SetAssetTransferCompliance** = ``"SetAssetTransferCompliance"``

#### Defined in

[middleware/types.ts:77573](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77573)

___

### SettlementManuallyExecuted

• **SettlementManuallyExecuted** = ``"SettlementManuallyExecuted"``

#### Defined in

[middleware/types.ts:77574](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77574)

___

### SignerLeft

• **SignerLeft** = ``"SignerLeft"``

#### Defined in

[middleware/types.ts:77575](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77575)

___

### SigningKeysAdded

• **SigningKeysAdded** = ``"SigningKeysAdded"``

#### Defined in

[middleware/types.ts:77576](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77576)

___

### SigningKeysFrozen

• **SigningKeysFrozen** = ``"SigningKeysFrozen"``

#### Defined in

[middleware/types.ts:77577](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77577)

___

### SigningKeysRemoved

• **SigningKeysRemoved** = ``"SigningKeysRemoved"``

#### Defined in

[middleware/types.ts:77578](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77578)

___

### SigningKeysUnfrozen

• **SigningKeysUnfrozen** = ``"SigningKeysUnfrozen"``

#### Defined in

[middleware/types.ts:77579](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77579)

___

### SigningPermissionsUpdated

• **SigningPermissionsUpdated** = ``"SigningPermissionsUpdated"``

#### Defined in

[middleware/types.ts:77580](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77580)

___

### Slash

• **Slash** = ``"Slash"``

#### Defined in

[middleware/types.ts:77581](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77581)

___

### SlashingAllowedForChanged

• **SlashingAllowedForChanged** = ``"SlashingAllowedForChanged"``

#### Defined in

[middleware/types.ts:77582](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77582)

___

### SlashingParamsUpdated

• **SlashingParamsUpdated** = ``"SlashingParamsUpdated"``

#### Defined in

[middleware/types.ts:77583](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77583)

___

### SnapshotCleared

• **SnapshotCleared** = ``"SnapshotCleared"``

#### Defined in

[middleware/types.ts:77584](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77584)

___

### SnapshotResultsEnacted

• **SnapshotResultsEnacted** = ``"SnapshotResultsEnacted"``

#### Defined in

[middleware/types.ts:77585](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77585)

___

### SnapshotTaken

• **SnapshotTaken** = ``"SnapshotTaken"``

#### Defined in

[middleware/types.ts:77586](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77586)

___

### SolutionStored

• **SolutionStored** = ``"SolutionStored"``

#### Defined in

[middleware/types.ts:77587](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77587)

___

### SomeOffline

• **SomeOffline** = ``"SomeOffline"``

#### Defined in

[middleware/types.ts:77588](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77588)

___

### StakingElection

• **StakingElection** = ``"StakingElection"``

#### Defined in

[middleware/types.ts:77589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77589)

___

### StatTypesAdded

• **StatTypesAdded** = ``"StatTypesAdded"``

#### Defined in

[middleware/types.ts:77590](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77590)

___

### StatTypesRemoved

• **StatTypesRemoved** = ``"StatTypesRemoved"``

#### Defined in

[middleware/types.ts:77591](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77591)

___

### Sudid

• **Sudid** = ``"Sudid"``

#### Defined in

[middleware/types.ts:77592](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77592)

___

### SudoAsDone

• **SudoAsDone** = ``"SudoAsDone"``

#### Defined in

[middleware/types.ts:77593](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77593)

___

### TemplateInstantiationFeeChanged

• **TemplateInstantiationFeeChanged** = ``"TemplateInstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:77594](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77594)

___

### TemplateMetaUrlChanged

• **TemplateMetaUrlChanged** = ``"TemplateMetaUrlChanged"``

#### Defined in

[middleware/types.ts:77595](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77595)

___

### TemplateOwnershipTransferred

• **TemplateOwnershipTransferred** = ``"TemplateOwnershipTransferred"``

#### Defined in

[middleware/types.ts:77596](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77596)

___

### TemplateUsageFeeChanged

• **TemplateUsageFeeChanged** = ``"TemplateUsageFeeChanged"``

#### Defined in

[middleware/types.ts:77597](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77597)

___

### Terminated

• **Terminated** = ``"Terminated"``

#### Defined in

[middleware/types.ts:77598](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77598)

___

### TickerLinkedToAsset

• **TickerLinkedToAsset** = ``"TickerLinkedToAsset"``

#### Defined in

[middleware/types.ts:77599](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77599)

___

### TickerRegistered

• **TickerRegistered** = ``"TickerRegistered"``

#### Defined in

[middleware/types.ts:77600](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77600)

___

### TickerTransferred

• **TickerTransferred** = ``"TickerTransferred"``

#### Defined in

[middleware/types.ts:77601](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77601)

___

### TimelockChanged

• **TimelockChanged** = ``"TimelockChanged"``

#### Defined in

[middleware/types.ts:77602](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77602)

___

### TransactionAffirmed

• **TransactionAffirmed** = ``"TransactionAffirmed"``

#### Defined in

[middleware/types.ts:77603](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77603)

___

### TransactionCreated

• **TransactionCreated** = ``"TransactionCreated"``

#### Defined in

[middleware/types.ts:77604](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77604)

___

### TransactionExecuted

• **TransactionExecuted** = ``"TransactionExecuted"``

#### Defined in

[middleware/types.ts:77605](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77605)

___

### TransactionFeePaid

• **TransactionFeePaid** = ``"TransactionFeePaid"``

#### Defined in

[middleware/types.ts:77606](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77606)

___

### TransactionRejected

• **TransactionRejected** = ``"TransactionRejected"``

#### Defined in

[middleware/types.ts:77607](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77607)

___

### Transfer

• **Transfer** = ``"Transfer"``

#### Defined in

[middleware/types.ts:77608](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77608)

___

### TransferConditionExemptionsAdded

• **TransferConditionExemptionsAdded** = ``"TransferConditionExemptionsAdded"``

#### Defined in

[middleware/types.ts:77609](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77609)

___

### TransferConditionExemptionsRemoved

• **TransferConditionExemptionsRemoved** = ``"TransferConditionExemptionsRemoved"``

#### Defined in

[middleware/types.ts:77610](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77610)

___

### TransferManagerAdded

• **TransferManagerAdded** = ``"TransferManagerAdded"``

#### Defined in

[middleware/types.ts:77611](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77611)

___

### TransferManagerRemoved

• **TransferManagerRemoved** = ``"TransferManagerRemoved"``

#### Defined in

[middleware/types.ts:77612](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77612)

___

### TransferWithData

• **TransferWithData** = ``"TransferWithData"``

#### Defined in

[middleware/types.ts:77613](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77613)

___

### TreasuryDidSet

• **TreasuryDidSet** = ``"TreasuryDidSet"``

#### Defined in

[middleware/types.ts:77614](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77614)

___

### TreasuryDisbursement

• **TreasuryDisbursement** = ``"TreasuryDisbursement"``

#### Defined in

[middleware/types.ts:77615](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77615)

___

### TreasuryDisbursementFailed

• **TreasuryDisbursementFailed** = ``"TreasuryDisbursementFailed"``

#### Defined in

[middleware/types.ts:77616](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77616)

___

### TreasuryReimbursement

• **TreasuryReimbursement** = ``"TreasuryReimbursement"``

#### Defined in

[middleware/types.ts:77617](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77617)

___

### TrustedDefaultClaimIssuerAdded

• **TrustedDefaultClaimIssuerAdded** = ``"TrustedDefaultClaimIssuerAdded"``

#### Defined in

[middleware/types.ts:77618](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77618)

___

### TrustedDefaultClaimIssuerRemoved

• **TrustedDefaultClaimIssuerRemoved** = ``"TrustedDefaultClaimIssuerRemoved"``

#### Defined in

[middleware/types.ts:77619](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77619)

___

### TxRemoved

• **TxRemoved** = ``"TxRemoved"``

#### Defined in

[middleware/types.ts:77620](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77620)

___

### TxsHandled

• **TxsHandled** = ``"TxsHandled"``

#### Defined in

[middleware/types.ts:77621](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77621)

___

### Unbonded

• **Unbonded** = ``"Unbonded"``

#### Defined in

[middleware/types.ts:77622](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77622)

___

### UnexpectedError

• **UnexpectedError** = ``"UnexpectedError"``

#### Defined in

[middleware/types.ts:77623](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77623)

___

### Unfrozen

• **Unfrozen** = ``"Unfrozen"``

#### Defined in

[middleware/types.ts:77624](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77624)

___

### UnfrozenTx

• **UnfrozenTx** = ``"UnfrozenTx"``

#### Defined in

[middleware/types.ts:77625](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77625)

___

### Unreserved

• **Unreserved** = ``"Unreserved"``

#### Defined in

[middleware/types.ts:77626](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77626)

___

### UpdatedPolyxLimit

• **UpdatedPolyxLimit** = ``"UpdatedPolyxLimit"``

#### Defined in

[middleware/types.ts:77627](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77627)

___

### UserPortfolios

• **UserPortfolios** = ``"UserPortfolios"``

#### Defined in

[middleware/types.ts:77628](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77628)

___

### VenueCreated

• **VenueCreated** = ``"VenueCreated"``

#### Defined in

[middleware/types.ts:77629](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77629)

___

### VenueDetailsUpdated

• **VenueDetailsUpdated** = ``"VenueDetailsUpdated"``

#### Defined in

[middleware/types.ts:77630](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77630)

___

### VenueFiltering

• **VenueFiltering** = ``"VenueFiltering"``

#### Defined in

[middleware/types.ts:77631](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77631)

___

### VenueSignersUpdated

• **VenueSignersUpdated** = ``"VenueSignersUpdated"``

#### Defined in

[middleware/types.ts:77632](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77632)

___

### VenueTypeUpdated

• **VenueTypeUpdated** = ``"VenueTypeUpdated"``

#### Defined in

[middleware/types.ts:77633](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77633)

___

### VenueUnauthorized

• **VenueUnauthorized** = ``"VenueUnauthorized"``

#### Defined in

[middleware/types.ts:77634](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77634)

___

### VenueUpdated

• **VenueUpdated** = ``"VenueUpdated"``

#### Defined in

[middleware/types.ts:77635](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77635)

___

### VenuesAllowed

• **VenuesAllowed** = ``"VenuesAllowed"``

#### Defined in

[middleware/types.ts:77636](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77636)

___

### VenuesBlocked

• **VenuesBlocked** = ``"VenuesBlocked"``

#### Defined in

[middleware/types.ts:77637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77637)

___

### VoteCast

• **VoteCast** = ``"VoteCast"``

#### Defined in

[middleware/types.ts:77638](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77638)

___

### VoteEnactReferendum

• **VoteEnactReferendum** = ``"VoteEnactReferendum"``

#### Defined in

[middleware/types.ts:77639](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77639)

___

### VoteRejectReferendum

• **VoteRejectReferendum** = ``"VoteRejectReferendum"``

#### Defined in

[middleware/types.ts:77640](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77640)

___

### VoteRetracted

• **VoteRetracted** = ``"VoteRetracted"``

#### Defined in

[middleware/types.ts:77641](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77641)

___

### VoteThresholdUpdated

• **VoteThresholdUpdated** = ``"VoteThresholdUpdated"``

#### Defined in

[middleware/types.ts:77642](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77642)

___

### Voted

• **Voted** = ``"Voted"``

#### Defined in

[middleware/types.ts:77643](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77643)

___

### Withdrawn

• **Withdrawn** = ``"Withdrawn"``

#### Defined in

[middleware/types.ts:77644](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/middleware/types.ts#L77644)
