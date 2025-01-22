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
- [Chilled](../wiki/types.EventIdEnum#chilled)
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
- [ElectionFailed](../wiki/types.EventIdEnum#electionfailed)
- [ElectionFinalized](../wiki/types.EventIdEnum#electionfinalized)
- [Endowed](../wiki/types.EventIdEnum#endowed)
- [EraPaid](../wiki/types.EventIdEnum#erapaid)
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
- [ForceEra](../wiki/types.EventIdEnum#forceera)
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
- [Kicked](../wiki/types.EventIdEnum#kicked)
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
- [MultiSigAddedAdmin](../wiki/types.EventIdEnum#multisigaddedadmin)
- [MultiSigCreated](../wiki/types.EventIdEnum#multisigcreated)
- [MultiSigRemovedAdmin](../wiki/types.EventIdEnum#multisigremovedadmin)
- [MultiSigRemovedPayingDid](../wiki/types.EventIdEnum#multisigremovedpayingdid)
- [MultiSigSignaturesRequiredChanged](../wiki/types.EventIdEnum#multisigsignaturesrequiredchanged)
- [MultiSigSignerAdded](../wiki/types.EventIdEnum#multisigsigneradded)
- [MultiSigSignerAuthorized](../wiki/types.EventIdEnum#multisigsignerauthorized)
- [MultiSigSignerRemoved](../wiki/types.EventIdEnum#multisigsignerremoved)
- [MultiSigSignersAuthorized](../wiki/types.EventIdEnum#multisigsignersauthorized)
- [MultiSigSignersRemoved](../wiki/types.EventIdEnum#multisigsignersremoved)
- [MultiSigSignersRequiredChanged](../wiki/types.EventIdEnum#multisigsignersrequiredchanged)
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
- [PayoutStarted](../wiki/types.EventIdEnum#payoutstarted)
- [PendingPipExpiryChanged](../wiki/types.EventIdEnum#pendingpipexpirychanged)
- [PeriodicFailed](../wiki/types.EventIdEnum#periodicfailed)
- [PermanentlyOverweight](../wiki/types.EventIdEnum#permanentlyoverweight)
- [PermissionedIdentityAdded](../wiki/types.EventIdEnum#permissionedidentityadded)
- [PermissionedIdentityRemoved](../wiki/types.EventIdEnum#permissionedidentityremoved)
- [PermissionedValidatorAdded](../wiki/types.EventIdEnum#permissionedvalidatoradded)
- [PermissionedValidatorRemoved](../wiki/types.EventIdEnum#permissionedvalidatorremoved)
- [PermissionedValidatorStatusChanged](../wiki/types.EventIdEnum#permissionedvalidatorstatuschanged)
- [PhaseTransitioned](../wiki/types.EventIdEnum#phasetransitioned)
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
- [ProposalApprovalVote](../wiki/types.EventIdEnum#proposalapprovalvote)
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
- [Rewarded](../wiki/types.EventIdEnum#rewarded)
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
- [SlashReported](../wiki/types.EventIdEnum#slashreported)
- [Slashed](../wiki/types.EventIdEnum#slashed)
- [SlashingAllowedForChanged](../wiki/types.EventIdEnum#slashingallowedforchanged)
- [SlashingParamsUpdated](../wiki/types.EventIdEnum#slashingparamsupdated)
- [SnapshotCleared](../wiki/types.EventIdEnum#snapshotcleared)
- [SnapshotResultsEnacted](../wiki/types.EventIdEnum#snapshotresultsenacted)
- [SnapshotTaken](../wiki/types.EventIdEnum#snapshottaken)
- [SolutionStored](../wiki/types.EventIdEnum#solutionstored)
- [SomeOffline](../wiki/types.EventIdEnum#someoffline)
- [StakersElected](../wiki/types.EventIdEnum#stakerselected)
- [StakingElection](../wiki/types.EventIdEnum#stakingelection)
- [StakingElectionFailed](../wiki/types.EventIdEnum#stakingelectionfailed)
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
- [TickerUnlinkedFromAsset](../wiki/types.EventIdEnum#tickerunlinkedfromasset)
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
- [ValidatorPrefsSet](../wiki/types.EventIdEnum#validatorprefsset)
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

[middleware/types.ts:78691](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78691)

___

### AccountAssetFrozen

• **AccountAssetFrozen** = ``"AccountAssetFrozen"``

#### Defined in

[middleware/types.ts:78692](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78692)

___

### AccountAssetUnfrozen

• **AccountAssetUnfrozen** = ``"AccountAssetUnfrozen"``

#### Defined in

[middleware/types.ts:78693](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78693)

___

### AccountBalanceBurned

• **AccountBalanceBurned** = ``"AccountBalanceBurned"``

#### Defined in

[middleware/types.ts:78694](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78694)

___

### AccountCreated

• **AccountCreated** = ``"AccountCreated"``

#### Defined in

[middleware/types.ts:78695](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78695)

___

### AccountDeposit

• **AccountDeposit** = ``"AccountDeposit"``

#### Defined in

[middleware/types.ts:78696](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78696)

___

### AccountDepositIncoming

• **AccountDepositIncoming** = ``"AccountDepositIncoming"``

#### Defined in

[middleware/types.ts:78697](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78697)

___

### AccountWithdraw

• **AccountWithdraw** = ``"AccountWithdraw"``

#### Defined in

[middleware/types.ts:78698](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78698)

___

### ActiveLimitChanged

• **ActiveLimitChanged** = ``"ActiveLimitChanged"``

#### Defined in

[middleware/types.ts:78699](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78699)

___

### ActivePipLimitChanged

• **ActivePipLimitChanged** = ``"ActivePipLimitChanged"``

#### Defined in

[middleware/types.ts:78700](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78700)

___

### AdminChanged

• **AdminChanged** = ``"AdminChanged"``

#### Defined in

[middleware/types.ts:78701](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78701)

___

### AffirmationWithdrawn

• **AffirmationWithdrawn** = ``"AffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:78702](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78702)

___

### AgentAdded

• **AgentAdded** = ``"AgentAdded"``

#### Defined in

[middleware/types.ts:78703](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78703)

___

### AgentRemoved

• **AgentRemoved** = ``"AgentRemoved"``

#### Defined in

[middleware/types.ts:78704](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78704)

___

### AllGood

• **AllGood** = ``"AllGood"``

#### Defined in

[middleware/types.ts:78705](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78705)

___

### ApiHashUpdated

• **ApiHashUpdated** = ``"ApiHashUpdated"``

#### Defined in

[middleware/types.ts:78706](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78706)

___

### Approval

• **Approval** = ``"Approval"``

#### Defined in

[middleware/types.ts:78707](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78707)

___

### Approved

• **Approved** = ``"Approved"``

#### Defined in

[middleware/types.ts:78708](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78708)

___

### AssetAffirmationExemption

• **AssetAffirmationExemption** = ``"AssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:78709](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78709)

___

### AssetBalanceUpdated

• **AssetBalanceUpdated** = ``"AssetBalanceUpdated"``

#### Defined in

[middleware/types.ts:78710](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78710)

___

### AssetCompliancePaused

• **AssetCompliancePaused** = ``"AssetCompliancePaused"``

#### Defined in

[middleware/types.ts:78711](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78711)

___

### AssetComplianceReplaced

• **AssetComplianceReplaced** = ``"AssetComplianceReplaced"``

#### Defined in

[middleware/types.ts:78712](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78712)

___

### AssetComplianceReset

• **AssetComplianceReset** = ``"AssetComplianceReset"``

#### Defined in

[middleware/types.ts:78713](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78713)

___

### AssetComplianceResumed

• **AssetComplianceResumed** = ``"AssetComplianceResumed"``

#### Defined in

[middleware/types.ts:78714](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78714)

___

### AssetCreated

• **AssetCreated** = ``"AssetCreated"``

#### Defined in

[middleware/types.ts:78715](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78715)

___

### AssetDidRegistered

• **AssetDidRegistered** = ``"AssetDidRegistered"``

#### Defined in

[middleware/types.ts:78716](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78716)

___

### AssetFrozen

• **AssetFrozen** = ``"AssetFrozen"``

#### Defined in

[middleware/types.ts:78717](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78717)

___

### AssetMediatorsAdded

• **AssetMediatorsAdded** = ``"AssetMediatorsAdded"``

#### Defined in

[middleware/types.ts:78718](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78718)

___

### AssetMediatorsRemoved

• **AssetMediatorsRemoved** = ``"AssetMediatorsRemoved"``

#### Defined in

[middleware/types.ts:78719](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78719)

___

### AssetOwnershipTransferred

• **AssetOwnershipTransferred** = ``"AssetOwnershipTransferred"``

#### Defined in

[middleware/types.ts:78720](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78720)

___

### AssetPurchased

• **AssetPurchased** = ``"AssetPurchased"``

#### Defined in

[middleware/types.ts:78721](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78721)

___

### AssetRenamed

• **AssetRenamed** = ``"AssetRenamed"``

#### Defined in

[middleware/types.ts:78722](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78722)

___

### AssetRuleChanged

• **AssetRuleChanged** = ``"AssetRuleChanged"``

#### Defined in

[middleware/types.ts:78723](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78723)

___

### AssetRuleRemoved

• **AssetRuleRemoved** = ``"AssetRuleRemoved"``

#### Defined in

[middleware/types.ts:78724](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78724)

___

### AssetRulesPaused

• **AssetRulesPaused** = ``"AssetRulesPaused"``

#### Defined in

[middleware/types.ts:78725](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78725)

___

### AssetRulesReplaced

• **AssetRulesReplaced** = ``"AssetRulesReplaced"``

#### Defined in

[middleware/types.ts:78726](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78726)

___

### AssetRulesReset

• **AssetRulesReset** = ``"AssetRulesReset"``

#### Defined in

[middleware/types.ts:78727](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78727)

___

### AssetRulesResumed

• **AssetRulesResumed** = ``"AssetRulesResumed"``

#### Defined in

[middleware/types.ts:78728](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78728)

___

### AssetStatsUpdated

• **AssetStatsUpdated** = ``"AssetStatsUpdated"``

#### Defined in

[middleware/types.ts:78729](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78729)

___

### AssetTypeChanged

• **AssetTypeChanged** = ``"AssetTypeChanged"``

#### Defined in

[middleware/types.ts:78730](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78730)

___

### AssetUnfrozen

• **AssetUnfrozen** = ``"AssetUnfrozen"``

#### Defined in

[middleware/types.ts:78731](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78731)

___

### AuthorizationAdded

• **AuthorizationAdded** = ``"AuthorizationAdded"``

#### Defined in

[middleware/types.ts:78732](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78732)

___

### AuthorizationConsumed

• **AuthorizationConsumed** = ``"AuthorizationConsumed"``

#### Defined in

[middleware/types.ts:78733](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78733)

___

### AuthorizationRejected

• **AuthorizationRejected** = ``"AuthorizationRejected"``

#### Defined in

[middleware/types.ts:78734](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78734)

___

### AuthorizationRetryLimitReached

• **AuthorizationRetryLimitReached** = ``"AuthorizationRetryLimitReached"``

#### Defined in

[middleware/types.ts:78735](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78735)

___

### AuthorizationRevoked

• **AuthorizationRevoked** = ``"AuthorizationRevoked"``

#### Defined in

[middleware/types.ts:78736](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78736)

___

### AuthorizedPayingKey

• **AuthorizedPayingKey** = ``"AuthorizedPayingKey"``

#### Defined in

[middleware/types.ts:78737](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78737)

___

### BalanceSet

• **BalanceSet** = ``"BalanceSet"``

#### Defined in

[middleware/types.ts:78738](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78738)

___

### BallotCancelled

• **BallotCancelled** = ``"BallotCancelled"``

#### Defined in

[middleware/types.ts:78739](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78739)

___

### BallotCreated

• **BallotCreated** = ``"BallotCreated"``

#### Defined in

[middleware/types.ts:78740](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78740)

___

### BatchCompleted

• **BatchCompleted** = ``"BatchCompleted"``

#### Defined in

[middleware/types.ts:78741](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78741)

___

### BatchCompletedOld

• **BatchCompletedOld** = ``"BatchCompletedOld"``

#### Defined in

[middleware/types.ts:78742](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78742)

___

### BatchCompletedWithErrors

• **BatchCompletedWithErrors** = ``"BatchCompletedWithErrors"``

#### Defined in

[middleware/types.ts:78743](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78743)

___

### BatchInterrupted

• **BatchInterrupted** = ``"BatchInterrupted"``

#### Defined in

[middleware/types.ts:78744](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78744)

___

### BatchInterruptedOld

• **BatchInterruptedOld** = ``"BatchInterruptedOld"``

#### Defined in

[middleware/types.ts:78745](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78745)

___

### BatchOptimisticFailed

• **BatchOptimisticFailed** = ``"BatchOptimisticFailed"``

#### Defined in

[middleware/types.ts:78746](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78746)

___

### BenefitClaimed

• **BenefitClaimed** = ``"BenefitClaimed"``

#### Defined in

[middleware/types.ts:78747](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78747)

___

### Bonded

• **Bonded** = ``"Bonded"``

#### Defined in

[middleware/types.ts:78748](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78748)

___

### BridgeLimitUpdated

• **BridgeLimitUpdated** = ``"BridgeLimitUpdated"``

#### Defined in

[middleware/types.ts:78749](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78749)

___

### BridgeTxFailed

• **BridgeTxFailed** = ``"BridgeTxFailed"``

#### Defined in

[middleware/types.ts:78750](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78750)

___

### BridgeTxScheduleFailed

• **BridgeTxScheduleFailed** = ``"BridgeTxScheduleFailed"``

#### Defined in

[middleware/types.ts:78751](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78751)

___

### BridgeTxScheduled

• **BridgeTxScheduled** = ``"BridgeTxScheduled"``

#### Defined in

[middleware/types.ts:78752](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78752)

___

### Bridged

• **Bridged** = ``"Bridged"``

#### Defined in

[middleware/types.ts:78753](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78753)

___

### Burned

• **Burned** = ``"Burned"``

#### Defined in

[middleware/types.ts:78754](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78754)

___

### CaInitiated

• **CaInitiated** = ``"CAInitiated"``

#### Defined in

[middleware/types.ts:78756](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78756)

___

### CaLinkedToDoc

• **CaLinkedToDoc** = ``"CALinkedToDoc"``

#### Defined in

[middleware/types.ts:78757](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78757)

___

### CaRemoved

• **CaRemoved** = ``"CARemoved"``

#### Defined in

[middleware/types.ts:78758](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78758)

___

### CaaTransferred

• **CaaTransferred** = ``"CAATransferred"``

#### Defined in

[middleware/types.ts:78755](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78755)

___

### CallLookupFailed

• **CallLookupFailed** = ``"CallLookupFailed"``

#### Defined in

[middleware/types.ts:78759](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78759)

___

### CallUnavailable

• **CallUnavailable** = ``"CallUnavailable"``

#### Defined in

[middleware/types.ts:78760](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78760)

___

### Called

• **Called** = ``"Called"``

#### Defined in

[middleware/types.ts:78761](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78761)

___

### Canceled

• **Canceled** = ``"Canceled"``

#### Defined in

[middleware/types.ts:78762](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78762)

___

### CddClaimsInvalidated

• **CddClaimsInvalidated** = ``"CddClaimsInvalidated"``

#### Defined in

[middleware/types.ts:78763](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78763)

___

### CddRequirementForMasterKeyUpdated

• **CddRequirementForMasterKeyUpdated** = ``"CddRequirementForMasterKeyUpdated"``

#### Defined in

[middleware/types.ts:78764](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78764)

___

### CddRequirementForPrimaryKeyUpdated

• **CddRequirementForPrimaryKeyUpdated** = ``"CddRequirementForPrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:78765](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78765)

___

### CddStatus

• **CddStatus** = ``"CddStatus"``

#### Defined in

[middleware/types.ts:78766](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78766)

___

### CheckpointCreated

• **CheckpointCreated** = ``"CheckpointCreated"``

#### Defined in

[middleware/types.ts:78767](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78767)

___

### ChildDidCreated

• **ChildDidCreated** = ``"ChildDidCreated"``

#### Defined in

[middleware/types.ts:78768](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78768)

___

### ChildDidUnlinked

• **ChildDidUnlinked** = ``"ChildDidUnlinked"``

#### Defined in

[middleware/types.ts:78769](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78769)

___

### Chilled

• **Chilled** = ``"Chilled"``

#### Defined in

[middleware/types.ts:78770](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78770)

___

### ClaimAdded

• **ClaimAdded** = ``"ClaimAdded"``

#### Defined in

[middleware/types.ts:78771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78771)

___

### ClaimRevoked

• **ClaimRevoked** = ``"ClaimRevoked"``

#### Defined in

[middleware/types.ts:78772](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78772)

___

### ClassicTickerClaimed

• **ClassicTickerClaimed** = ``"ClassicTickerClaimed"``

#### Defined in

[middleware/types.ts:78773](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78773)

___

### Cleared

• **Cleared** = ``"Cleared"``

#### Defined in

[middleware/types.ts:78774](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78774)

___

### Closed

• **Closed** = ``"Closed"``

#### Defined in

[middleware/types.ts:78775](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78775)

___

### CodeRemoved

• **CodeRemoved** = ``"CodeRemoved"``

#### Defined in

[middleware/types.ts:78776](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78776)

___

### CodeStored

• **CodeStored** = ``"CodeStored"``

#### Defined in

[middleware/types.ts:78777](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78777)

___

### CodeUpdated

• **CodeUpdated** = ``"CodeUpdated"``

#### Defined in

[middleware/types.ts:78778](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78778)

___

### CoefficientSet

• **CoefficientSet** = ``"CoefficientSet"``

#### Defined in

[middleware/types.ts:78779](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78779)

___

### CommissionCapUpdated

• **CommissionCapUpdated** = ``"CommissionCapUpdated"``

#### Defined in

[middleware/types.ts:78780](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78780)

___

### ComplianceRequirementChanged

• **ComplianceRequirementChanged** = ``"ComplianceRequirementChanged"``

#### Defined in

[middleware/types.ts:78781](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78781)

___

### ComplianceRequirementCreated

• **ComplianceRequirementCreated** = ``"ComplianceRequirementCreated"``

#### Defined in

[middleware/types.ts:78782](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78782)

___

### ComplianceRequirementRemoved

• **ComplianceRequirementRemoved** = ``"ComplianceRequirementRemoved"``

#### Defined in

[middleware/types.ts:78783](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78783)

___

### ContractCodeUpdated

• **ContractCodeUpdated** = ``"ContractCodeUpdated"``

#### Defined in

[middleware/types.ts:78784](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78784)

___

### ContractEmitted

• **ContractEmitted** = ``"ContractEmitted"``

#### Defined in

[middleware/types.ts:78785](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78785)

___

### ContractExecution

• **ContractExecution** = ``"ContractExecution"``

#### Defined in

[middleware/types.ts:78786](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78786)

___

### ControllerChanged

• **ControllerChanged** = ``"ControllerChanged"``

#### Defined in

[middleware/types.ts:78787](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78787)

___

### ControllerRedemption

• **ControllerRedemption** = ``"ControllerRedemption"``

#### Defined in

[middleware/types.ts:78788](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78788)

___

### ControllerTransfer

• **ControllerTransfer** = ``"ControllerTransfer"``

#### Defined in

[middleware/types.ts:78789](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78789)

___

### Created

• **Created** = ``"Created"``

#### Defined in

[middleware/types.ts:78790](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78790)

___

### CustodyAllowanceChanged

• **CustodyAllowanceChanged** = ``"CustodyAllowanceChanged"``

#### Defined in

[middleware/types.ts:78791](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78791)

___

### CustodyTransfer

• **CustodyTransfer** = ``"CustodyTransfer"``

#### Defined in

[middleware/types.ts:78792](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78792)

___

### CustomAssetTypeExists

• **CustomAssetTypeExists** = ``"CustomAssetTypeExists"``

#### Defined in

[middleware/types.ts:78793](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78793)

___

### CustomAssetTypeRegistered

• **CustomAssetTypeRegistered** = ``"CustomAssetTypeRegistered"``

#### Defined in

[middleware/types.ts:78794](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78794)

___

### CustomClaimTypeAdded

• **CustomClaimTypeAdded** = ``"CustomClaimTypeAdded"``

#### Defined in

[middleware/types.ts:78795](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78795)

___

### DefaultEnactmentPeriodChanged

• **DefaultEnactmentPeriodChanged** = ``"DefaultEnactmentPeriodChanged"``

#### Defined in

[middleware/types.ts:78796](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78796)

___

### DefaultTargetIdentitiesChanged

• **DefaultTargetIdentitiesChanged** = ``"DefaultTargetIdentitiesChanged"``

#### Defined in

[middleware/types.ts:78797](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78797)

___

### DefaultWithholdingTaxChanged

• **DefaultWithholdingTaxChanged** = ``"DefaultWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:78798](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78798)

___

### DelegateCalled

• **DelegateCalled** = ``"DelegateCalled"``

#### Defined in

[middleware/types.ts:78799](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78799)

___

### DidCreated

• **DidCreated** = ``"DidCreated"``

#### Defined in

[middleware/types.ts:78800](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78800)

___

### DidStatus

• **DidStatus** = ``"DidStatus"``

#### Defined in

[middleware/types.ts:78801](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78801)

___

### DidWithholdingTaxChanged

• **DidWithholdingTaxChanged** = ``"DidWithholdingTaxChanged"``

#### Defined in

[middleware/types.ts:78802](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78802)

___

### Dispatched

• **Dispatched** = ``"Dispatched"``

#### Defined in

[middleware/types.ts:78803](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78803)

___

### DispatchedAs

• **DispatchedAs** = ``"DispatchedAs"``

#### Defined in

[middleware/types.ts:78804](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78804)

___

### DividendCanceled

• **DividendCanceled** = ``"DividendCanceled"``

#### Defined in

[middleware/types.ts:78805](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78805)

___

### DividendCreated

• **DividendCreated** = ``"DividendCreated"``

#### Defined in

[middleware/types.ts:78806](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78806)

___

### DividendPaidOutToUser

• **DividendPaidOutToUser** = ``"DividendPaidOutToUser"``

#### Defined in

[middleware/types.ts:78807](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78807)

___

### DividendRemainingClaimed

• **DividendRemainingClaimed** = ``"DividendRemainingClaimed"``

#### Defined in

[middleware/types.ts:78808](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78808)

___

### DivisibilityChanged

• **DivisibilityChanged** = ``"DivisibilityChanged"``

#### Defined in

[middleware/types.ts:78809](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78809)

___

### DocumentAdded

• **DocumentAdded** = ``"DocumentAdded"``

#### Defined in

[middleware/types.ts:78810](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78810)

___

### DocumentRemoved

• **DocumentRemoved** = ``"DocumentRemoved"``

#### Defined in

[middleware/types.ts:78811](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78811)

___

### Dummy

• **Dummy** = ``"Dummy"``

#### Defined in

[middleware/types.ts:78812](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78812)

___

### ElectionFailed

• **ElectionFailed** = ``"ElectionFailed"``

#### Defined in

[middleware/types.ts:78813](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78813)

___

### ElectionFinalized

• **ElectionFinalized** = ``"ElectionFinalized"``

#### Defined in

[middleware/types.ts:78814](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78814)

___

### Endowed

• **Endowed** = ``"Endowed"``

#### Defined in

[middleware/types.ts:78815](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78815)

___

### EraPaid

• **EraPaid** = ``"EraPaid"``

#### Defined in

[middleware/types.ts:78816](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78816)

___

### EraPayout

• **EraPayout** = ``"EraPayout"``

#### Defined in

[middleware/types.ts:78817](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78817)

___

### Evicted

• **Evicted** = ``"Evicted"``

#### Defined in

[middleware/types.ts:78818](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78818)

___

### Executed

• **Executed** = ``"Executed"``

#### Defined in

[middleware/types.ts:78819](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78819)

___

### ExecutionCancellingFailed

• **ExecutionCancellingFailed** = ``"ExecutionCancellingFailed"``

#### Defined in

[middleware/types.ts:78820](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78820)

___

### ExecutionScheduled

• **ExecutionScheduled** = ``"ExecutionScheduled"``

#### Defined in

[middleware/types.ts:78821](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78821)

___

### ExecutionSchedulingFailed

• **ExecutionSchedulingFailed** = ``"ExecutionSchedulingFailed"``

#### Defined in

[middleware/types.ts:78822](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78822)

___

### ExemptedUpdated

• **ExemptedUpdated** = ``"ExemptedUpdated"``

#### Defined in

[middleware/types.ts:78823](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78823)

___

### ExemptionListModified

• **ExemptionListModified** = ``"ExemptionListModified"``

#### Defined in

[middleware/types.ts:78824](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78824)

___

### ExemptionsAdded

• **ExemptionsAdded** = ``"ExemptionsAdded"``

#### Defined in

[middleware/types.ts:78825](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78825)

___

### ExemptionsRemoved

• **ExemptionsRemoved** = ``"ExemptionsRemoved"``

#### Defined in

[middleware/types.ts:78826](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78826)

___

### ExpiresAfterUpdated

• **ExpiresAfterUpdated** = ``"ExpiresAfterUpdated"``

#### Defined in

[middleware/types.ts:78827](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78827)

___

### ExpiryScheduled

• **ExpiryScheduled** = ``"ExpiryScheduled"``

#### Defined in

[middleware/types.ts:78828](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78828)

___

### ExpirySchedulingFailed

• **ExpirySchedulingFailed** = ``"ExpirySchedulingFailed"``

#### Defined in

[middleware/types.ts:78829](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78829)

___

### ExtensionAdded

• **ExtensionAdded** = ``"ExtensionAdded"``

#### Defined in

[middleware/types.ts:78830](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78830)

___

### ExtensionArchived

• **ExtensionArchived** = ``"ExtensionArchived"``

#### Defined in

[middleware/types.ts:78831](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78831)

___

### ExtensionRemoved

• **ExtensionRemoved** = ``"ExtensionRemoved"``

#### Defined in

[middleware/types.ts:78832](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78832)

___

### ExtensionUnArchive

• **ExtensionUnArchive** = ``"ExtensionUnArchive"``

#### Defined in

[middleware/types.ts:78833](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78833)

___

### ExtrinsicFailed

• **ExtrinsicFailed** = ``"ExtrinsicFailed"``

#### Defined in

[middleware/types.ts:78834](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78834)

___

### ExtrinsicSuccess

• **ExtrinsicSuccess** = ``"ExtrinsicSuccess"``

#### Defined in

[middleware/types.ts:78835](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78835)

___

### FailedToExecuteInstruction

• **FailedToExecuteInstruction** = ``"FailedToExecuteInstruction"``

#### Defined in

[middleware/types.ts:78836](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78836)

___

### FeeCharged

• **FeeCharged** = ``"FeeCharged"``

#### Defined in

[middleware/types.ts:78837](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78837)

___

### FeeSet

• **FeeSet** = ``"FeeSet"``

#### Defined in

[middleware/types.ts:78838](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78838)

___

### FinalVotes

• **FinalVotes** = ``"FinalVotes"``

#### Defined in

[middleware/types.ts:78839](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78839)

___

### ForceEra

• **ForceEra** = ``"ForceEra"``

#### Defined in

[middleware/types.ts:78840](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78840)

___

### FreezeAdminAdded

• **FreezeAdminAdded** = ``"FreezeAdminAdded"``

#### Defined in

[middleware/types.ts:78841](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78841)

___

### FreezeAdminRemoved

• **FreezeAdminRemoved** = ``"FreezeAdminRemoved"``

#### Defined in

[middleware/types.ts:78842](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78842)

___

### Frozen

• **Frozen** = ``"Frozen"``

#### Defined in

[middleware/types.ts:78843](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78843)

___

### FrozenTx

• **FrozenTx** = ``"FrozenTx"``

#### Defined in

[middleware/types.ts:78844](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78844)

___

### FundingRoundSet

• **FundingRoundSet** = ``"FundingRoundSet"``

#### Defined in

[middleware/types.ts:78845](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78845)

___

### FundraiserClosed

• **FundraiserClosed** = ``"FundraiserClosed"``

#### Defined in

[middleware/types.ts:78846](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78846)

___

### FundraiserCreated

• **FundraiserCreated** = ``"FundraiserCreated"``

#### Defined in

[middleware/types.ts:78847](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78847)

___

### FundraiserFrozen

• **FundraiserFrozen** = ``"FundraiserFrozen"``

#### Defined in

[middleware/types.ts:78848](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78848)

___

### FundraiserUnfrozen

• **FundraiserUnfrozen** = ``"FundraiserUnfrozen"``

#### Defined in

[middleware/types.ts:78849](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78849)

___

### FundraiserWindowModifed

• **FundraiserWindowModifed** = ``"FundraiserWindowModifed"``

#### Defined in

[middleware/types.ts:78850](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78850)

___

### FundraiserWindowModified

• **FundraiserWindowModified** = ``"FundraiserWindowModified"``

#### Defined in

[middleware/types.ts:78851](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78851)

___

### FundsMoved

• **FundsMoved** = ``"FundsMoved"``

#### Defined in

[middleware/types.ts:78852](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78852)

___

### FundsMovedBetweenPortfolios

• **FundsMovedBetweenPortfolios** = ``"FundsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:78853](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78853)

___

### FundsRaised

• **FundsRaised** = ``"FundsRaised"``

#### Defined in

[middleware/types.ts:78854](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78854)

___

### FungibleTokensMovedBetweenPortfolios

• **FungibleTokensMovedBetweenPortfolios** = ``"FungibleTokensMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:78855](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78855)

___

### GlobalCommissionUpdated

• **GlobalCommissionUpdated** = ``"GlobalCommissionUpdated"``

#### Defined in

[middleware/types.ts:78856](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78856)

___

### GroupChanged

• **GroupChanged** = ``"GroupChanged"``

#### Defined in

[middleware/types.ts:78857](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78857)

___

### GroupCreated

• **GroupCreated** = ``"GroupCreated"``

#### Defined in

[middleware/types.ts:78858](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78858)

___

### GroupPermissionsUpdated

• **GroupPermissionsUpdated** = ``"GroupPermissionsUpdated"``

#### Defined in

[middleware/types.ts:78859](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78859)

___

### HeartbeatReceived

• **HeartbeatReceived** = ``"HeartbeatReceived"``

#### Defined in

[middleware/types.ts:78860](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78860)

___

### HistoricalPipsPruned

• **HistoricalPipsPruned** = ``"HistoricalPipsPruned"``

#### Defined in

[middleware/types.ts:78861](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78861)

___

### IdentifiersUpdated

• **IdentifiersUpdated** = ``"IdentifiersUpdated"``

#### Defined in

[middleware/types.ts:78862](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78862)

___

### IndexAssigned

• **IndexAssigned** = ``"IndexAssigned"``

#### Defined in

[middleware/types.ts:78863](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78863)

___

### IndexFreed

• **IndexFreed** = ``"IndexFreed"``

#### Defined in

[middleware/types.ts:78864](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78864)

___

### IndexFrozen

• **IndexFrozen** = ``"IndexFrozen"``

#### Defined in

[middleware/types.ts:78865](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78865)

___

### IndividualCommissionEnabled

• **IndividualCommissionEnabled** = ``"IndividualCommissionEnabled"``

#### Defined in

[middleware/types.ts:78866](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78866)

___

### Instantiated

• **Instantiated** = ``"Instantiated"``

#### Defined in

[middleware/types.ts:78867](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78867)

___

### InstantiationFeeChanged

• **InstantiationFeeChanged** = ``"InstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:78868](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78868)

___

### InstantiationFreezed

• **InstantiationFreezed** = ``"InstantiationFreezed"``

#### Defined in

[middleware/types.ts:78869](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78869)

___

### InstantiationUnFreezed

• **InstantiationUnFreezed** = ``"InstantiationUnFreezed"``

#### Defined in

[middleware/types.ts:78870](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78870)

___

### InstructionAffirmed

• **InstructionAffirmed** = ``"InstructionAffirmed"``

#### Defined in

[middleware/types.ts:78871](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78871)

___

### InstructionAuthorized

• **InstructionAuthorized** = ``"InstructionAuthorized"``

#### Defined in

[middleware/types.ts:78872](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78872)

___

### InstructionAutomaticallyAffirmed

• **InstructionAutomaticallyAffirmed** = ``"InstructionAutomaticallyAffirmed"``

#### Defined in

[middleware/types.ts:78873](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78873)

___

### InstructionCreated

• **InstructionCreated** = ``"InstructionCreated"``

#### Defined in

[middleware/types.ts:78874](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78874)

___

### InstructionExecuted

• **InstructionExecuted** = ``"InstructionExecuted"``

#### Defined in

[middleware/types.ts:78875](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78875)

___

### InstructionFailed

• **InstructionFailed** = ``"InstructionFailed"``

#### Defined in

[middleware/types.ts:78876](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78876)

___

### InstructionMediators

• **InstructionMediators** = ``"InstructionMediators"``

#### Defined in

[middleware/types.ts:78877](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78877)

___

### InstructionRejected

• **InstructionRejected** = ``"InstructionRejected"``

#### Defined in

[middleware/types.ts:78878](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78878)

___

### InstructionRescheduled

• **InstructionRescheduled** = ``"InstructionRescheduled"``

#### Defined in

[middleware/types.ts:78879](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78879)

___

### InstructionUnauthorized

• **InstructionUnauthorized** = ``"InstructionUnauthorized"``

#### Defined in

[middleware/types.ts:78880](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78880)

___

### InstructionV2Created

• **InstructionV2Created** = ``"InstructionV2Created"``

#### Defined in

[middleware/types.ts:78881](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78881)

___

### InvalidatedNominators

• **InvalidatedNominators** = ``"InvalidatedNominators"``

#### Defined in

[middleware/types.ts:78882](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78882)

___

### Invested

• **Invested** = ``"Invested"``

#### Defined in

[middleware/types.ts:78883](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78883)

___

### InvestorUniquenessClaimNotAllowed

• **InvestorUniquenessClaimNotAllowed** = ``"InvestorUniquenessClaimNotAllowed"``

#### Defined in

[middleware/types.ts:78884](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78884)

___

### IsIssuable

• **IsIssuable** = ``"IsIssuable"``

#### Defined in

[middleware/types.ts:78885](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78885)

___

### Issued

• **Issued** = ``"Issued"``

#### Defined in

[middleware/types.ts:78886](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78886)

___

### IssuedNft

• **IssuedNft** = ``"IssuedNFT"``

#### Defined in

[middleware/types.ts:78887](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78887)

___

### ItemCompleted

• **ItemCompleted** = ``"ItemCompleted"``

#### Defined in

[middleware/types.ts:78888](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78888)

___

### ItemFailed

• **ItemFailed** = ``"ItemFailed"``

#### Defined in

[middleware/types.ts:78889](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78889)

___

### ItnRewardClaimed

• **ItnRewardClaimed** = ``"ItnRewardClaimed"``

#### Defined in

[middleware/types.ts:78890](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78890)

___

### KeyChanged

• **KeyChanged** = ``"KeyChanged"``

#### Defined in

[middleware/types.ts:78891](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78891)

___

### Kicked

• **Kicked** = ``"Kicked"``

#### Defined in

[middleware/types.ts:78892](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78892)

___

### KilledAccount

• **KilledAccount** = ``"KilledAccount"``

#### Defined in

[middleware/types.ts:78893](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78893)

___

### LegFailedExecution

• **LegFailedExecution** = ``"LegFailedExecution"``

#### Defined in

[middleware/types.ts:78894](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78894)

___

### LocalMetadataKeyDeleted

• **LocalMetadataKeyDeleted** = ``"LocalMetadataKeyDeleted"``

#### Defined in

[middleware/types.ts:78895](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78895)

___

### MasterKeyUpdated

• **MasterKeyUpdated** = ``"MasterKeyUpdated"``

#### Defined in

[middleware/types.ts:78896](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78896)

___

### MaxDetailsLengthChanged

• **MaxDetailsLengthChanged** = ``"MaxDetailsLengthChanged"``

#### Defined in

[middleware/types.ts:78897](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78897)

___

### MaxPipSkipCountChanged

• **MaxPipSkipCountChanged** = ``"MaxPipSkipCountChanged"``

#### Defined in

[middleware/types.ts:78898](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78898)

___

### MaximumSchedulesComplexityChanged

• **MaximumSchedulesComplexityChanged** = ``"MaximumSchedulesComplexityChanged"``

#### Defined in

[middleware/types.ts:78899](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78899)

___

### MediatorAffirmationReceived

• **MediatorAffirmationReceived** = ``"MediatorAffirmationReceived"``

#### Defined in

[middleware/types.ts:78900](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78900)

___

### MediatorAffirmationWithdrawn

• **MediatorAffirmationWithdrawn** = ``"MediatorAffirmationWithdrawn"``

#### Defined in

[middleware/types.ts:78901](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78901)

___

### MemberAdded

• **MemberAdded** = ``"MemberAdded"``

#### Defined in

[middleware/types.ts:78902](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78902)

___

### MemberRemoved

• **MemberRemoved** = ``"MemberRemoved"``

#### Defined in

[middleware/types.ts:78903](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78903)

___

### MemberRevoked

• **MemberRevoked** = ``"MemberRevoked"``

#### Defined in

[middleware/types.ts:78904](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78904)

___

### MembersReset

• **MembersReset** = ``"MembersReset"``

#### Defined in

[middleware/types.ts:78905](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78905)

___

### MembersSwapped

• **MembersSwapped** = ``"MembersSwapped"``

#### Defined in

[middleware/types.ts:78906](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78906)

___

### MetaChanged

• **MetaChanged** = ``"MetaChanged"``

#### Defined in

[middleware/types.ts:78907](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78907)

___

### MetadataValueDeleted

• **MetadataValueDeleted** = ``"MetadataValueDeleted"``

#### Defined in

[middleware/types.ts:78908](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78908)

___

### MinimumBondThresholdUpdated

• **MinimumBondThresholdUpdated** = ``"MinimumBondThresholdUpdated"``

#### Defined in

[middleware/types.ts:78909](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78909)

___

### MinimumProposalDepositChanged

• **MinimumProposalDepositChanged** = ``"MinimumProposalDepositChanged"``

#### Defined in

[middleware/types.ts:78910](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78910)

___

### MockInvestorUidCreated

• **MockInvestorUidCreated** = ``"MockInvestorUIDCreated"``

#### Defined in

[middleware/types.ts:78911](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78911)

___

### MovedBetweenPortfolios

• **MovedBetweenPortfolios** = ``"MovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:78912](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78912)

___

### MultiSigAddedAdmin

• **MultiSigAddedAdmin** = ``"MultiSigAddedAdmin"``

#### Defined in

[middleware/types.ts:78913](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78913)

___

### MultiSigCreated

• **MultiSigCreated** = ``"MultiSigCreated"``

#### Defined in

[middleware/types.ts:78914](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78914)

___

### MultiSigRemovedAdmin

• **MultiSigRemovedAdmin** = ``"MultiSigRemovedAdmin"``

#### Defined in

[middleware/types.ts:78915](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78915)

___

### MultiSigRemovedPayingDid

• **MultiSigRemovedPayingDid** = ``"MultiSigRemovedPayingDid"``

#### Defined in

[middleware/types.ts:78916](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78916)

___

### MultiSigSignaturesRequiredChanged

• **MultiSigSignaturesRequiredChanged** = ``"MultiSigSignaturesRequiredChanged"``

#### Defined in

[middleware/types.ts:78917](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78917)

___

### MultiSigSignerAdded

• **MultiSigSignerAdded** = ``"MultiSigSignerAdded"``

#### Defined in

[middleware/types.ts:78918](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78918)

___

### MultiSigSignerAuthorized

• **MultiSigSignerAuthorized** = ``"MultiSigSignerAuthorized"``

#### Defined in

[middleware/types.ts:78919](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78919)

___

### MultiSigSignerRemoved

• **MultiSigSignerRemoved** = ``"MultiSigSignerRemoved"``

#### Defined in

[middleware/types.ts:78920](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78920)

___

### MultiSigSignersAuthorized

• **MultiSigSignersAuthorized** = ``"MultiSigSignersAuthorized"``

#### Defined in

[middleware/types.ts:78921](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78921)

___

### MultiSigSignersRemoved

• **MultiSigSignersRemoved** = ``"MultiSigSignersRemoved"``

#### Defined in

[middleware/types.ts:78922](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78922)

___

### MultiSigSignersRequiredChanged

• **MultiSigSignersRequiredChanged** = ``"MultiSigSignersRequiredChanged"``

#### Defined in

[middleware/types.ts:78923](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78923)

___

### NewAccount

• **NewAccount** = ``"NewAccount"``

#### Defined in

[middleware/types.ts:78926](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78926)

___

### NewAssetRuleCreated

• **NewAssetRuleCreated** = ``"NewAssetRuleCreated"``

#### Defined in

[middleware/types.ts:78927](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78927)

___

### NewAuthorities

• **NewAuthorities** = ``"NewAuthorities"``

#### Defined in

[middleware/types.ts:78928](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78928)

___

### NewSession

• **NewSession** = ``"NewSession"``

#### Defined in

[middleware/types.ts:78929](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78929)

___

### NfTsMovedBetweenPortfolios

• **NfTsMovedBetweenPortfolios** = ``"NFTsMovedBetweenPortfolios"``

#### Defined in

[middleware/types.ts:78925](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78925)

___

### NftCollectionCreated

• **NftCollectionCreated** = ``"NftCollectionCreated"``

#### Defined in

[middleware/types.ts:78930](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78930)

___

### NftPortfolioUpdated

• **NftPortfolioUpdated** = ``"NFTPortfolioUpdated"``

#### Defined in

[middleware/types.ts:78924](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78924)

___

### Nominated

• **Nominated** = ``"Nominated"``

#### Defined in

[middleware/types.ts:78931](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78931)

___

### Noted

• **Noted** = ``"Noted"``

#### Defined in

[middleware/types.ts:78932](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78932)

___

### OffChainAuthorizationRevoked

• **OffChainAuthorizationRevoked** = ``"OffChainAuthorizationRevoked"``

#### Defined in

[middleware/types.ts:78933](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78933)

___

### Offence

• **Offence** = ``"Offence"``

#### Defined in

[middleware/types.ts:78934](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78934)

___

### OldSlashingReportDiscarded

• **OldSlashingReportDiscarded** = ``"OldSlashingReportDiscarded"``

#### Defined in

[middleware/types.ts:78935](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78935)

___

### Paused

• **Paused** = ``"Paused"``

#### Defined in

[middleware/types.ts:78936](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78936)

___

### PayoutStarted

• **PayoutStarted** = ``"PayoutStarted"``

#### Defined in

[middleware/types.ts:78937](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78937)

___

### PendingPipExpiryChanged

• **PendingPipExpiryChanged** = ``"PendingPipExpiryChanged"``

#### Defined in

[middleware/types.ts:78938](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78938)

___

### PeriodicFailed

• **PeriodicFailed** = ``"PeriodicFailed"``

#### Defined in

[middleware/types.ts:78939](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78939)

___

### PermanentlyOverweight

• **PermanentlyOverweight** = ``"PermanentlyOverweight"``

#### Defined in

[middleware/types.ts:78940](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78940)

___

### PermissionedIdentityAdded

• **PermissionedIdentityAdded** = ``"PermissionedIdentityAdded"``

#### Defined in

[middleware/types.ts:78941](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78941)

___

### PermissionedIdentityRemoved

• **PermissionedIdentityRemoved** = ``"PermissionedIdentityRemoved"``

#### Defined in

[middleware/types.ts:78942](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78942)

___

### PermissionedValidatorAdded

• **PermissionedValidatorAdded** = ``"PermissionedValidatorAdded"``

#### Defined in

[middleware/types.ts:78943](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78943)

___

### PermissionedValidatorRemoved

• **PermissionedValidatorRemoved** = ``"PermissionedValidatorRemoved"``

#### Defined in

[middleware/types.ts:78944](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78944)

___

### PermissionedValidatorStatusChanged

• **PermissionedValidatorStatusChanged** = ``"PermissionedValidatorStatusChanged"``

#### Defined in

[middleware/types.ts:78945](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78945)

___

### PhaseTransitioned

• **PhaseTransitioned** = ``"PhaseTransitioned"``

#### Defined in

[middleware/types.ts:78946](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78946)

___

### PipClosed

• **PipClosed** = ``"PipClosed"``

#### Defined in

[middleware/types.ts:78947](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78947)

___

### PipSkipped

• **PipSkipped** = ``"PipSkipped"``

#### Defined in

[middleware/types.ts:78948](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78948)

___

### PlaceholderFillBlock

• **PlaceholderFillBlock** = ``"PlaceholderFillBlock"``

#### Defined in

[middleware/types.ts:78949](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78949)

___

### PortfolioCreated

• **PortfolioCreated** = ``"PortfolioCreated"``

#### Defined in

[middleware/types.ts:78950](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78950)

___

### PortfolioCustodianChanged

• **PortfolioCustodianChanged** = ``"PortfolioCustodianChanged"``

#### Defined in

[middleware/types.ts:78951](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78951)

___

### PortfolioDeleted

• **PortfolioDeleted** = ``"PortfolioDeleted"``

#### Defined in

[middleware/types.ts:78952](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78952)

___

### PortfolioRenamed

• **PortfolioRenamed** = ``"PortfolioRenamed"``

#### Defined in

[middleware/types.ts:78953](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78953)

___

### PreApprovedAsset

• **PreApprovedAsset** = ``"PreApprovedAsset"``

#### Defined in

[middleware/types.ts:78954](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78954)

___

### PreApprovedPortfolio

• **PreApprovedPortfolio** = ``"PreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:78955](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78955)

___

### PrimaryIssuanceAgentTransfered

• **PrimaryIssuanceAgentTransfered** = ``"PrimaryIssuanceAgentTransfered"``

#### Defined in

[middleware/types.ts:78956](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78956)

___

### PrimaryIssuanceAgentTransferred

• **PrimaryIssuanceAgentTransferred** = ``"PrimaryIssuanceAgentTransferred"``

#### Defined in

[middleware/types.ts:78957](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78957)

___

### PrimaryKeyUpdated

• **PrimaryKeyUpdated** = ``"PrimaryKeyUpdated"``

#### Defined in

[middleware/types.ts:78958](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78958)

___

### ProposalAdded

• **ProposalAdded** = ``"ProposalAdded"``

#### Defined in

[middleware/types.ts:78959](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78959)

___

### ProposalApprovalVote

• **ProposalApprovalVote** = ``"ProposalApprovalVote"``

#### Defined in

[middleware/types.ts:78960](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78960)

___

### ProposalApproved

• **ProposalApproved** = ``"ProposalApproved"``

#### Defined in

[middleware/types.ts:78961](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78961)

___

### ProposalBondAdjusted

• **ProposalBondAdjusted** = ``"ProposalBondAdjusted"``

#### Defined in

[middleware/types.ts:78962](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78962)

___

### ProposalCoolOffPeriodChanged

• **ProposalCoolOffPeriodChanged** = ``"ProposalCoolOffPeriodChanged"``

#### Defined in

[middleware/types.ts:78963](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78963)

___

### ProposalCreated

• **ProposalCreated** = ``"ProposalCreated"``

#### Defined in

[middleware/types.ts:78964](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78964)

___

### ProposalDetailsAmended

• **ProposalDetailsAmended** = ``"ProposalDetailsAmended"``

#### Defined in

[middleware/types.ts:78965](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78965)

___

### ProposalDurationChanged

• **ProposalDurationChanged** = ``"ProposalDurationChanged"``

#### Defined in

[middleware/types.ts:78966](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78966)

___

### ProposalExecuted

• **ProposalExecuted** = ``"ProposalExecuted"``

#### Defined in

[middleware/types.ts:78967](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78967)

___

### ProposalExecutionFailed

• **ProposalExecutionFailed** = ``"ProposalExecutionFailed"``

#### Defined in

[middleware/types.ts:78968](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78968)

___

### ProposalFailedToExecute

• **ProposalFailedToExecute** = ``"ProposalFailedToExecute"``

#### Defined in

[middleware/types.ts:78969](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78969)

___

### ProposalRefund

• **ProposalRefund** = ``"ProposalRefund"``

#### Defined in

[middleware/types.ts:78970](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78970)

___

### ProposalRejected

• **ProposalRejected** = ``"ProposalRejected"``

#### Defined in

[middleware/types.ts:78971](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78971)

___

### ProposalRejectionVote

• **ProposalRejectionVote** = ``"ProposalRejectionVote"``

#### Defined in

[middleware/types.ts:78972](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78972)

___

### ProposalStateUpdated

• **ProposalStateUpdated** = ``"ProposalStateUpdated"``

#### Defined in

[middleware/types.ts:78973](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78973)

___

### Proposed

• **Proposed** = ``"Proposed"``

#### Defined in

[middleware/types.ts:78974](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78974)

___

### PutCodeFlagChanged

• **PutCodeFlagChanged** = ``"PutCodeFlagChanged"``

#### Defined in

[middleware/types.ts:78975](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78975)

___

### QuorumThresholdChanged

• **QuorumThresholdChanged** = ``"QuorumThresholdChanged"``

#### Defined in

[middleware/types.ts:78976](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78976)

___

### RangeChanged

• **RangeChanged** = ``"RangeChanged"``

#### Defined in

[middleware/types.ts:78978](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78978)

___

### RangeProofAdded

• **RangeProofAdded** = ``"RangeProofAdded"``

#### Defined in

[middleware/types.ts:78979](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78979)

___

### RangeProofVerified

• **RangeProofVerified** = ``"RangeProofVerified"``

#### Defined in

[middleware/types.ts:78980](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78980)

___

### RcvChanged

• **RcvChanged** = ``"RCVChanged"``

#### Defined in

[middleware/types.ts:78977](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78977)

___

### ReceiptClaimed

• **ReceiptClaimed** = ``"ReceiptClaimed"``

#### Defined in

[middleware/types.ts:78981](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78981)

___

### ReceiptUnclaimed

• **ReceiptUnclaimed** = ``"ReceiptUnclaimed"``

#### Defined in

[middleware/types.ts:78982](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78982)

___

### ReceiptValidityChanged

• **ReceiptValidityChanged** = ``"ReceiptValidityChanged"``

#### Defined in

[middleware/types.ts:78983](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78983)

___

### Reclaimed

• **Reclaimed** = ``"Reclaimed"``

#### Defined in

[middleware/types.ts:78984](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78984)

___

### RecordDateChanged

• **RecordDateChanged** = ``"RecordDateChanged"``

#### Defined in

[middleware/types.ts:78985](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78985)

___

### Redeemed

• **Redeemed** = ``"Redeemed"``

#### Defined in

[middleware/types.ts:78986](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78986)

___

### RedeemedNft

• **RedeemedNft** = ``"RedeemedNFT"``

#### Defined in

[middleware/types.ts:78987](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78987)

___

### ReferendumCreated

• **ReferendumCreated** = ``"ReferendumCreated"``

#### Defined in

[middleware/types.ts:78988](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78988)

___

### ReferendumScheduled

• **ReferendumScheduled** = ``"ReferendumScheduled"``

#### Defined in

[middleware/types.ts:78989](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78989)

___

### ReferendumStateUpdated

• **ReferendumStateUpdated** = ``"ReferendumStateUpdated"``

#### Defined in

[middleware/types.ts:78990](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78990)

___

### RegisterAssetMetadataGlobalType

• **RegisterAssetMetadataGlobalType** = ``"RegisterAssetMetadataGlobalType"``

#### Defined in

[middleware/types.ts:78991](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78991)

___

### RegisterAssetMetadataLocalType

• **RegisterAssetMetadataLocalType** = ``"RegisterAssetMetadataLocalType"``

#### Defined in

[middleware/types.ts:78992](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78992)

___

### Rejected

• **Rejected** = ``"Rejected"``

#### Defined in

[middleware/types.ts:78993](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78993)

___

### RelayedTx

• **RelayedTx** = ``"RelayedTx"``

#### Defined in

[middleware/types.ts:78994](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78994)

___

### ReleaseCoordinatorUpdated

• **ReleaseCoordinatorUpdated** = ``"ReleaseCoordinatorUpdated"``

#### Defined in

[middleware/types.ts:78995](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78995)

___

### Remarked

• **Remarked** = ``"Remarked"``

#### Defined in

[middleware/types.ts:78996](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78996)

___

### RemoveAssetAffirmationExemption

• **RemoveAssetAffirmationExemption** = ``"RemoveAssetAffirmationExemption"``

#### Defined in

[middleware/types.ts:78997](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78997)

___

### RemovePreApprovedAsset

• **RemovePreApprovedAsset** = ``"RemovePreApprovedAsset"``

#### Defined in

[middleware/types.ts:78998](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78998)

___

### Removed

• **Removed** = ``"Removed"``

#### Defined in

[middleware/types.ts:78999](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L78999)

___

### RemovedPayingKey

• **RemovedPayingKey** = ``"RemovedPayingKey"``

#### Defined in

[middleware/types.ts:79000](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79000)

___

### Requested

• **Requested** = ``"Requested"``

#### Defined in

[middleware/types.ts:79001](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79001)

___

### ReserveRepatriated

• **ReserveRepatriated** = ``"ReserveRepatriated"``

#### Defined in

[middleware/types.ts:79002](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79002)

___

### Reserved

• **Reserved** = ``"Reserved"``

#### Defined in

[middleware/types.ts:79003](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79003)

___

### Restored

• **Restored** = ``"Restored"``

#### Defined in

[middleware/types.ts:79004](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79004)

___

### Resumed

• **Resumed** = ``"Resumed"``

#### Defined in

[middleware/types.ts:79005](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79005)

___

### RevokePreApprovedPortfolio

• **RevokePreApprovedPortfolio** = ``"RevokePreApprovedPortfolio"``

#### Defined in

[middleware/types.ts:79006](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79006)

___

### Reward

• **Reward** = ``"Reward"``

#### Defined in

[middleware/types.ts:79007](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79007)

___

### RewardPaymentSchedulingInterrupted

• **RewardPaymentSchedulingInterrupted** = ``"RewardPaymentSchedulingInterrupted"``

#### Defined in

[middleware/types.ts:79008](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79008)

___

### Rewarded

• **Rewarded** = ``"Rewarded"``

#### Defined in

[middleware/types.ts:79009](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79009)

___

### ScRuntimeCall

• **ScRuntimeCall** = ``"SCRuntimeCall"``

#### Defined in

[middleware/types.ts:79010](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79010)

___

### ScheduleCreated

• **ScheduleCreated** = ``"ScheduleCreated"``

#### Defined in

[middleware/types.ts:79011](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79011)

___

### ScheduleRemoved

• **ScheduleRemoved** = ``"ScheduleRemoved"``

#### Defined in

[middleware/types.ts:79012](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79012)

___

### ScheduleUpdated

• **ScheduleUpdated** = ``"ScheduleUpdated"``

#### Defined in

[middleware/types.ts:79013](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79013)

___

### Scheduled

• **Scheduled** = ``"Scheduled"``

#### Defined in

[middleware/types.ts:79014](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79014)

___

### SchedulingFailed

• **SchedulingFailed** = ``"SchedulingFailed"``

#### Defined in

[middleware/types.ts:79015](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79015)

___

### SecondaryKeyLeftIdentity

• **SecondaryKeyLeftIdentity** = ``"SecondaryKeyLeftIdentity"``

#### Defined in

[middleware/types.ts:79016](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79016)

___

### SecondaryKeyPermissionsUpdated

• **SecondaryKeyPermissionsUpdated** = ``"SecondaryKeyPermissionsUpdated"``

#### Defined in

[middleware/types.ts:79017](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79017)

___

### SecondaryKeysAdded

• **SecondaryKeysAdded** = ``"SecondaryKeysAdded"``

#### Defined in

[middleware/types.ts:79018](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79018)

___

### SecondaryKeysFrozen

• **SecondaryKeysFrozen** = ``"SecondaryKeysFrozen"``

#### Defined in

[middleware/types.ts:79019](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79019)

___

### SecondaryKeysRemoved

• **SecondaryKeysRemoved** = ``"SecondaryKeysRemoved"``

#### Defined in

[middleware/types.ts:79020](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79020)

___

### SecondaryKeysUnfrozen

• **SecondaryKeysUnfrozen** = ``"SecondaryKeysUnfrozen"``

#### Defined in

[middleware/types.ts:79021](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79021)

___

### SecondaryPermissionsUpdated

• **SecondaryPermissionsUpdated** = ``"SecondaryPermissionsUpdated"``

#### Defined in

[middleware/types.ts:79022](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79022)

___

### SetAssetMediators

• **SetAssetMediators** = ``"SetAssetMediators"``

#### Defined in

[middleware/types.ts:79023](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79023)

___

### SetAssetMetadataValue

• **SetAssetMetadataValue** = ``"SetAssetMetadataValue"``

#### Defined in

[middleware/types.ts:79024](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79024)

___

### SetAssetMetadataValueDetails

• **SetAssetMetadataValueDetails** = ``"SetAssetMetadataValueDetails"``

#### Defined in

[middleware/types.ts:79025](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79025)

___

### SetAssetTransferCompliance

• **SetAssetTransferCompliance** = ``"SetAssetTransferCompliance"``

#### Defined in

[middleware/types.ts:79026](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79026)

___

### SettlementManuallyExecuted

• **SettlementManuallyExecuted** = ``"SettlementManuallyExecuted"``

#### Defined in

[middleware/types.ts:79027](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79027)

___

### SignerLeft

• **SignerLeft** = ``"SignerLeft"``

#### Defined in

[middleware/types.ts:79028](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79028)

___

### SigningKeysAdded

• **SigningKeysAdded** = ``"SigningKeysAdded"``

#### Defined in

[middleware/types.ts:79029](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79029)

___

### SigningKeysFrozen

• **SigningKeysFrozen** = ``"SigningKeysFrozen"``

#### Defined in

[middleware/types.ts:79030](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79030)

___

### SigningKeysRemoved

• **SigningKeysRemoved** = ``"SigningKeysRemoved"``

#### Defined in

[middleware/types.ts:79031](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79031)

___

### SigningKeysUnfrozen

• **SigningKeysUnfrozen** = ``"SigningKeysUnfrozen"``

#### Defined in

[middleware/types.ts:79032](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79032)

___

### SigningPermissionsUpdated

• **SigningPermissionsUpdated** = ``"SigningPermissionsUpdated"``

#### Defined in

[middleware/types.ts:79033](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79033)

___

### Slash

• **Slash** = ``"Slash"``

#### Defined in

[middleware/types.ts:79034](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79034)

___

### SlashReported

• **SlashReported** = ``"SlashReported"``

#### Defined in

[middleware/types.ts:79035](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79035)

___

### Slashed

• **Slashed** = ``"Slashed"``

#### Defined in

[middleware/types.ts:79036](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79036)

___

### SlashingAllowedForChanged

• **SlashingAllowedForChanged** = ``"SlashingAllowedForChanged"``

#### Defined in

[middleware/types.ts:79037](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79037)

___

### SlashingParamsUpdated

• **SlashingParamsUpdated** = ``"SlashingParamsUpdated"``

#### Defined in

[middleware/types.ts:79038](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79038)

___

### SnapshotCleared

• **SnapshotCleared** = ``"SnapshotCleared"``

#### Defined in

[middleware/types.ts:79039](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79039)

___

### SnapshotResultsEnacted

• **SnapshotResultsEnacted** = ``"SnapshotResultsEnacted"``

#### Defined in

[middleware/types.ts:79040](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79040)

___

### SnapshotTaken

• **SnapshotTaken** = ``"SnapshotTaken"``

#### Defined in

[middleware/types.ts:79041](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79041)

___

### SolutionStored

• **SolutionStored** = ``"SolutionStored"``

#### Defined in

[middleware/types.ts:79042](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79042)

___

### SomeOffline

• **SomeOffline** = ``"SomeOffline"``

#### Defined in

[middleware/types.ts:79043](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79043)

___

### StakersElected

• **StakersElected** = ``"StakersElected"``

#### Defined in

[middleware/types.ts:79044](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79044)

___

### StakingElection

• **StakingElection** = ``"StakingElection"``

#### Defined in

[middleware/types.ts:79045](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79045)

___

### StakingElectionFailed

• **StakingElectionFailed** = ``"StakingElectionFailed"``

#### Defined in

[middleware/types.ts:79046](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79046)

___

### StatTypesAdded

• **StatTypesAdded** = ``"StatTypesAdded"``

#### Defined in

[middleware/types.ts:79047](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79047)

___

### StatTypesRemoved

• **StatTypesRemoved** = ``"StatTypesRemoved"``

#### Defined in

[middleware/types.ts:79048](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79048)

___

### Sudid

• **Sudid** = ``"Sudid"``

#### Defined in

[middleware/types.ts:79049](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79049)

___

### SudoAsDone

• **SudoAsDone** = ``"SudoAsDone"``

#### Defined in

[middleware/types.ts:79050](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79050)

___

### TemplateInstantiationFeeChanged

• **TemplateInstantiationFeeChanged** = ``"TemplateInstantiationFeeChanged"``

#### Defined in

[middleware/types.ts:79051](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79051)

___

### TemplateMetaUrlChanged

• **TemplateMetaUrlChanged** = ``"TemplateMetaUrlChanged"``

#### Defined in

[middleware/types.ts:79052](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79052)

___

### TemplateOwnershipTransferred

• **TemplateOwnershipTransferred** = ``"TemplateOwnershipTransferred"``

#### Defined in

[middleware/types.ts:79053](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79053)

___

### TemplateUsageFeeChanged

• **TemplateUsageFeeChanged** = ``"TemplateUsageFeeChanged"``

#### Defined in

[middleware/types.ts:79054](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79054)

___

### Terminated

• **Terminated** = ``"Terminated"``

#### Defined in

[middleware/types.ts:79055](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79055)

___

### TickerLinkedToAsset

• **TickerLinkedToAsset** = ``"TickerLinkedToAsset"``

#### Defined in

[middleware/types.ts:79056](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79056)

___

### TickerRegistered

• **TickerRegistered** = ``"TickerRegistered"``

#### Defined in

[middleware/types.ts:79057](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79057)

___

### TickerTransferred

• **TickerTransferred** = ``"TickerTransferred"``

#### Defined in

[middleware/types.ts:79058](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79058)

___

### TickerUnlinkedFromAsset

• **TickerUnlinkedFromAsset** = ``"TickerUnlinkedFromAsset"``

#### Defined in

[middleware/types.ts:79059](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79059)

___

### TimelockChanged

• **TimelockChanged** = ``"TimelockChanged"``

#### Defined in

[middleware/types.ts:79060](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79060)

___

### TransactionAffirmed

• **TransactionAffirmed** = ``"TransactionAffirmed"``

#### Defined in

[middleware/types.ts:79061](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79061)

___

### TransactionCreated

• **TransactionCreated** = ``"TransactionCreated"``

#### Defined in

[middleware/types.ts:79062](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79062)

___

### TransactionExecuted

• **TransactionExecuted** = ``"TransactionExecuted"``

#### Defined in

[middleware/types.ts:79063](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79063)

___

### TransactionFeePaid

• **TransactionFeePaid** = ``"TransactionFeePaid"``

#### Defined in

[middleware/types.ts:79064](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79064)

___

### TransactionRejected

• **TransactionRejected** = ``"TransactionRejected"``

#### Defined in

[middleware/types.ts:79065](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79065)

___

### Transfer

• **Transfer** = ``"Transfer"``

#### Defined in

[middleware/types.ts:79066](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79066)

___

### TransferConditionExemptionsAdded

• **TransferConditionExemptionsAdded** = ``"TransferConditionExemptionsAdded"``

#### Defined in

[middleware/types.ts:79067](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79067)

___

### TransferConditionExemptionsRemoved

• **TransferConditionExemptionsRemoved** = ``"TransferConditionExemptionsRemoved"``

#### Defined in

[middleware/types.ts:79068](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79068)

___

### TransferManagerAdded

• **TransferManagerAdded** = ``"TransferManagerAdded"``

#### Defined in

[middleware/types.ts:79069](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79069)

___

### TransferManagerRemoved

• **TransferManagerRemoved** = ``"TransferManagerRemoved"``

#### Defined in

[middleware/types.ts:79070](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79070)

___

### TransferWithData

• **TransferWithData** = ``"TransferWithData"``

#### Defined in

[middleware/types.ts:79071](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79071)

___

### TreasuryDidSet

• **TreasuryDidSet** = ``"TreasuryDidSet"``

#### Defined in

[middleware/types.ts:79072](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79072)

___

### TreasuryDisbursement

• **TreasuryDisbursement** = ``"TreasuryDisbursement"``

#### Defined in

[middleware/types.ts:79073](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79073)

___

### TreasuryDisbursementFailed

• **TreasuryDisbursementFailed** = ``"TreasuryDisbursementFailed"``

#### Defined in

[middleware/types.ts:79074](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79074)

___

### TreasuryReimbursement

• **TreasuryReimbursement** = ``"TreasuryReimbursement"``

#### Defined in

[middleware/types.ts:79075](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79075)

___

### TrustedDefaultClaimIssuerAdded

• **TrustedDefaultClaimIssuerAdded** = ``"TrustedDefaultClaimIssuerAdded"``

#### Defined in

[middleware/types.ts:79076](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79076)

___

### TrustedDefaultClaimIssuerRemoved

• **TrustedDefaultClaimIssuerRemoved** = ``"TrustedDefaultClaimIssuerRemoved"``

#### Defined in

[middleware/types.ts:79077](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79077)

___

### TxRemoved

• **TxRemoved** = ``"TxRemoved"``

#### Defined in

[middleware/types.ts:79078](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79078)

___

### TxsHandled

• **TxsHandled** = ``"TxsHandled"``

#### Defined in

[middleware/types.ts:79079](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79079)

___

### Unbonded

• **Unbonded** = ``"Unbonded"``

#### Defined in

[middleware/types.ts:79080](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79080)

___

### UnexpectedError

• **UnexpectedError** = ``"UnexpectedError"``

#### Defined in

[middleware/types.ts:79081](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79081)

___

### Unfrozen

• **Unfrozen** = ``"Unfrozen"``

#### Defined in

[middleware/types.ts:79082](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79082)

___

### UnfrozenTx

• **UnfrozenTx** = ``"UnfrozenTx"``

#### Defined in

[middleware/types.ts:79083](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79083)

___

### Unreserved

• **Unreserved** = ``"Unreserved"``

#### Defined in

[middleware/types.ts:79084](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79084)

___

### UpdatedPolyxLimit

• **UpdatedPolyxLimit** = ``"UpdatedPolyxLimit"``

#### Defined in

[middleware/types.ts:79085](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79085)

___

### UserPortfolios

• **UserPortfolios** = ``"UserPortfolios"``

#### Defined in

[middleware/types.ts:79086](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79086)

___

### ValidatorPrefsSet

• **ValidatorPrefsSet** = ``"ValidatorPrefsSet"``

#### Defined in

[middleware/types.ts:79087](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79087)

___

### VenueCreated

• **VenueCreated** = ``"VenueCreated"``

#### Defined in

[middleware/types.ts:79088](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79088)

___

### VenueDetailsUpdated

• **VenueDetailsUpdated** = ``"VenueDetailsUpdated"``

#### Defined in

[middleware/types.ts:79089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79089)

___

### VenueFiltering

• **VenueFiltering** = ``"VenueFiltering"``

#### Defined in

[middleware/types.ts:79090](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79090)

___

### VenueSignersUpdated

• **VenueSignersUpdated** = ``"VenueSignersUpdated"``

#### Defined in

[middleware/types.ts:79091](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79091)

___

### VenueTypeUpdated

• **VenueTypeUpdated** = ``"VenueTypeUpdated"``

#### Defined in

[middleware/types.ts:79092](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79092)

___

### VenueUnauthorized

• **VenueUnauthorized** = ``"VenueUnauthorized"``

#### Defined in

[middleware/types.ts:79093](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79093)

___

### VenueUpdated

• **VenueUpdated** = ``"VenueUpdated"``

#### Defined in

[middleware/types.ts:79094](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79094)

___

### VenuesAllowed

• **VenuesAllowed** = ``"VenuesAllowed"``

#### Defined in

[middleware/types.ts:79095](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79095)

___

### VenuesBlocked

• **VenuesBlocked** = ``"VenuesBlocked"``

#### Defined in

[middleware/types.ts:79096](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79096)

___

### VoteCast

• **VoteCast** = ``"VoteCast"``

#### Defined in

[middleware/types.ts:79097](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79097)

___

### VoteEnactReferendum

• **VoteEnactReferendum** = ``"VoteEnactReferendum"``

#### Defined in

[middleware/types.ts:79098](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79098)

___

### VoteRejectReferendum

• **VoteRejectReferendum** = ``"VoteRejectReferendum"``

#### Defined in

[middleware/types.ts:79099](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79099)

___

### VoteRetracted

• **VoteRetracted** = ``"VoteRetracted"``

#### Defined in

[middleware/types.ts:79100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79100)

___

### VoteThresholdUpdated

• **VoteThresholdUpdated** = ``"VoteThresholdUpdated"``

#### Defined in

[middleware/types.ts:79101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79101)

___

### Voted

• **Voted** = ``"Voted"``

#### Defined in

[middleware/types.ts:79102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79102)

___

### Withdrawn

• **Withdrawn** = ``"Withdrawn"``

#### Defined in

[middleware/types.ts:79103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/middleware/types.ts#L79103)
