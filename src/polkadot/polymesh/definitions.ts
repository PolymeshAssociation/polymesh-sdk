/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {},
  runtime: {
    AssetApi: [
      {
        methods: {
          transfer_report: {
            description:
              "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
            params: [
              {
                name: 'senderPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'receiverPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'assetId',
                type: 'AssetID',
              },
              {
                name: 'transferValue',
                type: 'Balance',
              },
              {
                name: 'skipLockedCheck',
                type: 'bool',
              },
            ],
            type: 'Vec<DispatchError>',
          },
        },
        version: 4,
      },
      {
        methods: {
          can_transfer_granular: {
            description:
              'Checks whether a transaction with given parameters can take place or not. The result is granular meaning each check is run and returned regardless of outcome.',
            params: [
              {
                name: 'fromCustodian',
                type: 'Option<IdentityId>',
              },
              {
                name: 'fromPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'toCustodian',
                type: 'Option<IdentityId>',
              },
              {
                name: 'toPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'ticker',
                type: 'Ticker',
              },
              {
                name: 'value',
                type: 'Balance',
              },
            ],
            type: 'CanTransferGranularReturn',
          },
        },
        version: 3,
      },
    ],
    ComplianceApi: [
      {
        methods: {
          compliance_report: {
            description: 'Checks all compliance requirements for the given asset_id.',
            params: [
              {
                name: 'assetId',
                type: 'AssetID',
              },
              {
                name: 'senderIdentity',
                type: 'IdentityId',
              },
              {
                name: 'receiverIdentity',
                type: 'IdentityId',
              },
            ],
            type: 'Result<ComplianceReport, DispatchError>',
          },
        },
        version: 2,
      },
      {
        methods: {
          compliance_report: {
            description: 'Checks all compliance requirements for the given ticker.',
            params: [
              {
                name: 'ticker',
                type: 'Ticker',
              },
              {
                name: 'senderIdentity',
                type: 'IdentityId',
              },
              {
                name: 'receiverIdentity',
                type: 'IdentityId',
              },
            ],
            type: 'Result<ComplianceReport, DispatchError>',
          },
        },
        version: 1,
      },
    ],
    GroupApi: [
      {
        methods: {
          get_cdd_valid_members: {
            description: 'Get the CDD members',
            params: [],
            type: 'Vec<Member>',
          },
          get_gc_valid_members: {
            description: 'Get the GC members',
            params: [],
            type: 'Vec<Member>',
          },
        },
        version: 1,
      },
    ],
    IdentityApi: [
      {
        methods: {
          is_identity_has_valid_cdd: {
            description: 'use to tell whether the given did has valid cdd claim or not',
            params: [
              {
                name: 'did',
                type: 'IdentityId',
              },
              {
                name: 'bufferTime',
                type: 'Option<u64>',
              },
            ],
            type: 'CddStatus',
          },
          get_did_records: {
            description: 'Used to get the did record values for a given DID',
            params: [
              {
                name: 'did',
                type: 'IdentityId',
              },
            ],
            type: 'RpcDidRecords',
          },
          get_did_status: {
            description: 'Retrieve status of the DID',
            params: [
              {
                name: 'did',
                type: 'Vec<IdentityId>',
              },
            ],
            type: 'Vec<DidStatus>',
          },
          get_filtered_authorizations: {
            description:
              'Retrieve authorizations data for a given signatory and filtered using the given authorization type',
            params: [
              {
                name: 'signatory',
                type: 'Signatory',
              },
              {
                name: 'allowExpired',
                type: 'bool',
              },
              {
                name: 'authType',
                type: 'Option<AuthorizationType>',
              },
            ],
            type: 'Vec<Authorization>',
          },
          get_key_identity_data: {
            description: 'Query relation between a signing key and a DID',
            params: [
              {
                name: 'acc',
                type: 'AccountId',
              },
            ],
            type: 'Option<KeyIdentityData>',
          },
          valid_cdd_claims: {
            description:
              'Returns all valid IdentityClaim of type CustomerDueDiligence for the given target_identity',
            params: [
              {
                name: 'targetIdentity',
                type: 'IdentityId',
              },
              {
                name: 'cddCheckerLeeway',
                type: 'Option<u64>',
              },
            ],
            type: 'Vec<IdentityClaim>',
          },
        },
        version: 4,
      },
      {
        methods: {
          is_identity_has_valid_cdd: {
            description: 'use to tell whether the given did has valid cdd claim or not',
            params: [
              {
                name: 'did',
                type: 'IdentityId',
              },
              {
                name: 'bufferTime',
                type: 'Option<u64>',
              },
            ],
            type: 'CddStatus',
          },
          get_asset_did: {
            description: 'function is used to query the given ticker DID',
            params: [
              {
                name: 'ticker',
                type: 'Ticker',
              },
            ],
            type: 'AssetDidResult',
          },
          get_did_records: {
            description: 'Used to get the did record values for a given DID',
            params: [
              {
                name: 'did',
                type: 'IdentityId',
              },
            ],
            type: 'RpcDidRecords',
          },
          get_did_status: {
            description: 'Retrieve status of the DID',
            params: [
              {
                name: 'did',
                type: 'Vec<IdentityId>',
              },
            ],
            type: 'Vec<DidStatus>',
          },
          get_filtered_authorizations: {
            description:
              'Retrieve authorizations data for a given signatory and filtered using the given authorization type',
            params: [
              {
                name: 'signatory',
                type: 'Signatory',
              },
              {
                name: 'allowExpired',
                type: 'bool',
              },
              {
                name: 'authType',
                type: 'Option<AuthorizationType>',
              },
            ],
            type: 'Vec<Authorization>',
          },
          get_key_identity_data: {
            description: 'Query relation between a signing key and a DID',
            params: [
              {
                name: 'acc',
                type: 'AccountId',
              },
            ],
            type: 'Option<KeyIdentityData>',
          },
          valid_cdd_claims: {
            description:
              'Returns all valid IdentityClaim of type CustomerDueDiligence for the given target_identity',
            params: [
              {
                name: 'targetIdentity',
                type: 'IdentityId',
              },
              {
                name: 'cddCheckerLeeway',
                type: 'Option<u64>',
              },
            ],
            type: 'Vec<IdentityClaim>',
          },
        },
        version: 3,
      },
    ],
    NFTApi: [
      {
        methods: {
          transfer_report: {
            description:
              "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
            params: [
              {
                name: 'senderPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'receiverPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'nfts',
                type: 'NFTs',
              },
              {
                name: 'skipLockedCheck',
                type: 'bool',
              },
            ],
            type: 'Vec<DispatchError>',
          },
        },
        version: 2,
      },
      {
        methods: {
          validate_nft_transfer: {
            description:
              'Verifies if and the sender and receiver are not the same, if both have valid balances, if the sender owns the nft, and if all compliance rules are being respected.',
            params: [
              {
                name: 'senderPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'receiverPortfolio',
                type: 'PortfolioId',
              },
              {
                name: 'nfts',
                type: 'NFTs',
              },
            ],
            type: 'DispatchResult',
          },
        },
        version: 1,
      },
    ],
    PipsApi: [
      {
        methods: {
          get_votes: {
            description: 'Summary of votes of a proposal given by index',
            params: [
              {
                name: 'index',
                type: 'PipId',
              },
            ],
            type: 'VoteCount',
          },
          proposed_by: {
            description: 'Retrieves proposal indices started by address',
            params: [
              {
                name: 'address',
                type: 'AccountId',
              },
            ],
            type: 'Vec<PipId>',
          },
          voted_on: {
            description: 'Retrieves proposal address indices voted on',
            params: [
              {
                name: 'address',
                type: 'AccountId',
              },
            ],
            type: 'Vec<PipId>',
          },
        },
        version: 1,
      },
    ],
    ProtocolFeeApi: [
      {
        methods: {
          compute_fee: {
            description: 'Gets the fee of a chargeable extrinsic operation',
            params: [
              {
                name: 'op',
                type: 'ProtocolOp',
              },
            ],
            type: 'CappedFee',
          },
        },
        version: 1,
      },
    ],
    SettlementApi: [
      {
        methods: {
          get_execute_instruction_info: {
            description:
              'Returns an ExecuteInstructionInfo instance containing the consumed weight and the number of tokens in the instruction.',
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
            ],
            type: 'Option<ExecuteInstructionInfo>',
          },
          get_affirmation_count: {
            description:
              'Returns an AffirmationCount instance containing the number of assets being sent/received from portfolios, and the number of off-chain assets in the instruction.',
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
              {
                name: 'portfolios',
                type: 'Vec<PortfolioId>',
              },
            ],
            type: 'AffirmationCount',
          },
          get_transfer_report: {
            description:
              "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
            params: [
              {
                name: 'leg',
                type: 'Leg',
              },
              {
                name: 'skipLockedCheck',
                type: 'bool',
              },
            ],
            type: 'Vec<DispatchError>',
          },
          get_execute_instruction_report: {
            description:
              "Returns a vector containing all errors for the execution. An empty vec means there's no error.",
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
            ],
            type: 'Vec<DispatchError>',
          },
        },
        version: 2,
      },
      {
        methods: {
          get_execute_instruction_info: {
            description:
              'Returns an ExecuteInstructionInfo instance containing the consumed weight and the number of tokens in the instruction.',
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
            ],
            type: 'ExecuteInstructionInfo',
          },
          get_affirmation_count: {
            description:
              'Returns an AffirmationCount instance containing the number of assets being sent/received from portfolios, and the number of off-chain assets in the instruction.',
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
              {
                name: 'portfolios',
                type: 'Vec<PortfolioId>',
              },
            ],
            type: 'AffirmationCount',
          },
          get_transfer_report: {
            description:
              "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
            params: [
              {
                name: 'leg',
                type: 'Leg',
              },
              {
                name: 'skipLockedCheck',
                type: 'bool',
              },
            ],
            type: 'Vec<DispatchError>',
          },
          get_execute_instruction_report: {
            description:
              "Returns a vector containing all errors for the execution. An empty vec means there's no error.",
            params: [
              {
                name: 'instructionId',
                type: 'InstructionId',
              },
            ],
            type: 'Vec<DispatchError>',
          },
        },
        version: 1,
      },
    ],
    StakingApi: [
      {
        methods: {
          get_curve: {
            description: 'Retrieves curves parameters',
            params: [],
            type: 'Vec<(Perbill, Perbill)>',
          },
        },
        version: 1,
      },
    ],
  },
  types: {
    AssetID: '[u8; 16]',
    IdentityId: '[u8; 32]',
    Ticker: '[u8; 12]',
    CddId: '[u8; 32]',
    PalletName: 'Text',
    DispatchableName: 'Text',
    AssetPermissions: {
      _enum: {
        Whole: '',
        These: 'Vec<AssetID>',
        Except: 'Vec<AssetID>',
      },
    },
    PortfolioPermissions: {
      _enum: {
        Whole: '',
        These: 'Vec<PortfolioId>',
        Except: 'Vec<PortfolioId>',
      },
    },
    DispatchableNames: {
      _enum: {
        Whole: '',
        These: 'Vec<DispatchableName>',
        Except: 'Vec<DispatchableName>',
      },
    },
    PalletPermissions: {
      palletName: 'PalletName',
      dispatchableNames: 'DispatchableNames',
    },
    ExtrinsicPermissions: {
      _enum: {
        Whole: '',
        These: 'Vec<PalletPermissions>',
        Except: 'Vec<PalletPermissions>',
      },
    },
    Permissions: {
      asset: 'AssetPermissions',
      extrinsic: 'ExtrinsicPermissions',
      portfolio: 'PortfolioPermissions',
    },
    Signatory: {
      _enum: {
        Identity: 'IdentityId',
        Account: 'AccountId',
      },
    },
    SecondaryKey: {
      key: 'AccountId',
      permissions: 'Permissions',
    },
    KeyIdentityData: {
      identity: 'IdentityId',
      permissions: 'Option<Permissions>',
    },
    CountryCode: {
      _enum: [
        'AF',
        'AX',
        'AL',
        'DZ',
        'AS',
        'AD',
        'AO',
        'AI',
        'AQ',
        'AG',
        'AR',
        'AM',
        'AW',
        'AU',
        'AT',
        'AZ',
        'BS',
        'BH',
        'BD',
        'BB',
        'BY',
        'BE',
        'BZ',
        'BJ',
        'BM',
        'BT',
        'BO',
        'BA',
        'BW',
        'BV',
        'BR',
        'VG',
        'IO',
        'BN',
        'BG',
        'BF',
        'BI',
        'KH',
        'CM',
        'CA',
        'CV',
        'KY',
        'CF',
        'TD',
        'CL',
        'CN',
        'HK',
        'MO',
        'CX',
        'CC',
        'CO',
        'KM',
        'CG',
        'CD',
        'CK',
        'CR',
        'CI',
        'HR',
        'CU',
        'CY',
        'CZ',
        'DK',
        'DJ',
        'DM',
        'DO',
        'EC',
        'EG',
        'SV',
        'GQ',
        'ER',
        'EE',
        'ET',
        'FK',
        'FO',
        'FJ',
        'FI',
        'FR',
        'GF',
        'PF',
        'TF',
        'GA',
        'GM',
        'GE',
        'DE',
        'GH',
        'GI',
        'GR',
        'GL',
        'GD',
        'GP',
        'GU',
        'GT',
        'GG',
        'GN',
        'GW',
        'GY',
        'HT',
        'HM',
        'VA',
        'HN',
        'HU',
        'IS',
        'IN',
        'ID',
        'IR',
        'IQ',
        'IE',
        'IM',
        'IL',
        'IT',
        'JM',
        'JP',
        'JE',
        'JO',
        'KZ',
        'KE',
        'KI',
        'KP',
        'KR',
        'KW',
        'KG',
        'LA',
        'LV',
        'LB',
        'LS',
        'LR',
        'LY',
        'LI',
        'LT',
        'LU',
        'MK',
        'MG',
        'MW',
        'MY',
        'MV',
        'ML',
        'MT',
        'MH',
        'MQ',
        'MR',
        'MU',
        'YT',
        'MX',
        'FM',
        'MD',
        'MC',
        'MN',
        'ME',
        'MS',
        'MA',
        'MZ',
        'MM',
        'NA',
        'NR',
        'NP',
        'NL',
        'AN',
        'NC',
        'NZ',
        'NI',
        'NE',
        'NG',
        'NU',
        'NF',
        'MP',
        'NO',
        'OM',
        'PK',
        'PW',
        'PS',
        'PA',
        'PG',
        'PY',
        'PE',
        'PH',
        'PN',
        'PL',
        'PT',
        'PR',
        'QA',
        'RE',
        'RO',
        'RU',
        'RW',
        'BL',
        'SH',
        'KN',
        'LC',
        'MF',
        'PM',
        'VC',
        'WS',
        'SM',
        'ST',
        'SA',
        'SN',
        'RS',
        'SC',
        'SL',
        'SG',
        'SK',
        'SI',
        'SB',
        'SO',
        'ZA',
        'GS',
        'SS',
        'ES',
        'LK',
        'SD',
        'SR',
        'SJ',
        'SZ',
        'SE',
        'CH',
        'SY',
        'TW',
        'TJ',
        'TZ',
        'TH',
        'TL',
        'TG',
        'TK',
        'TO',
        'TT',
        'TN',
        'TR',
        'TM',
        'TC',
        'TV',
        'UG',
        'UA',
        'AE',
        'GB',
        'US',
        'UM',
        'UY',
        'UZ',
        'VU',
        'VE',
        'VN',
        'VI',
        'WF',
        'EH',
        'YE',
        'ZM',
        'ZW',
        'BQ',
        'CW',
        'SX',
      ],
    },
    Scope: {
      _enum: {
        Identity: 'IdentityId',
        Asset: 'AssetID',
        Ticker: 'Ticker',
        Custom: 'Vec<u8>',
      },
    },
    CustomClaimTypeId: 'u32',
    Claim: {
      _enum: {
        Accredited: 'Scope',
        Affiliate: 'Scope',
        BuyLockup: 'Scope',
        SellLockup: 'Scope',
        CustomerDueDiligence: 'CddId',
        KnowYourCustomer: 'Scope',
        Jurisdiction: '(CountryCode, Scope)',
        Exempted: 'Scope',
        Blocked: 'Scope',
        Custom: '(CustomClaimTypeId, Option<Scope>)',
      },
    },
    ClaimType: {
      _enum: {
        Accredited: '',
        Affiliate: '',
        BuyLockup: '',
        SellLockup: '',
        CustomerDueDiligence: '',
        KnowYourCustomer: '',
        Jurisdiction: '',
        Exempted: '',
        Blocked: '',
        Custom: 'CustomClaimTypeId',
      },
    },
    IdentityClaim: {
      claimIssuer: 'IdentityId',
      issuanceDate: 'Moment',
      lastUpdateDate: 'Moment',
      expiry: 'Option<Moment>',
      claim: 'Claim',
    },
    ComplianceRequirementResult: {
      senderConditions: 'Vec<ConditionResult>',
      receiverConditions: 'Vec<ConditionResult>',
      id: 'u32',
      result: 'bool',
    },
    ConditionType: {
      _enum: {
        IsPresent: 'Claim',
        IsAbsent: 'Claim',
        IsAnyOf: 'Vec<Claim>',
        IsNoneOf: 'Vec<Claim>',
        IsIdentity: 'TargetIdentity',
      },
    },
    TrustedFor: {
      _enum: {
        Any: '',
        Specific: 'Vec<ClaimType>',
      },
    },
    TrustedIssuer: {
      issuer: 'IdentityId',
      trustedFor: 'TrustedFor',
    },
    Condition: {
      conditionType: 'PolymeshPrimitivesConditionConditionType',
      issuers: 'Vec<PolymeshPrimitivesConditionTrustedIssuer>',
    },
    ConditionResult: {
      condition: 'Condition',
      result: 'bool',
    },
    PipId: 'u32',
    Authorization: {
      authorizationData: 'AuthorizationData',
      authorizedBy: 'IdentityId',
      expiry: 'Option<Moment>',
      authId: 'u64',
      count: 'u32',
    },
    AuthorizationData: {
      _enum: {
        AttestPrimaryKeyRotation: 'IdentityId',
        RotatePrimaryKey: '',
        TransferTicker: 'Ticker',
        AddMultiSigSigner: 'AccountId',
        TransferAssetOwnership: 'AssetID',
        JoinIdentity: 'Permissions',
        PortfolioCustody: 'PortfolioId',
        BecomeAgent: '(AssetID, AgentGroup)',
        AddRelayerPayingKey: '(AccountId, AccountId, Balance)',
        RotatePrimaryKeyToSecondary: 'Permissions',
      },
    },
    Percentage: 'Permill',
    StatClaim: {
      _enum: {
        Accredited: 'bool',
        Affiliate: 'bool',
        Jurisdiction: 'Option<CountryCode>',
      },
    },
    TransferCondition: {
      _enum: {
        MaxInvestorCount: 'u64',
        MaxInvestorOwnership: 'Percentage',
        ClaimCount: '(StatClaim, IdentityId, u64, Option<u64>)',
        ClaimOwnership: '(StatClaim, IdentityId, Percentage, Percentage)',
      },
    },
    AssetComplianceResult: {
      paused: 'bool',
      requirements: 'Vec<ComplianceRequirementResult>',
      result: 'bool',
    },
    ProtocolOp: {
      _enum: [
        'AssetRegisterTicker',
        'AssetIssue',
        'AssetAddDocuments',
        'AssetCreateAsset',
        'CheckpointCreateSchedule',
        'ComplianceManagerAddComplianceRequirement',
        'IdentityCddRegisterDid',
        'IdentityAddClaim',
        'IdentityAddSecondaryKeysWithAuthorization',
        'PipsPropose',
        'ContractsPutCode',
        'CorporateBallotAttachBallot',
        'CapitalDistributionDistribute',
        'NFTCreateCollection',
        'NFTMint',
        'IdentityCreateChildIdentity',
      ],
    },
    CddStatus: {
      _enum: {
        Ok: 'IdentityId',
        Err: 'Vec<u8>',
      },
    },
    AssetDidResult: {
      _enum: {
        Ok: 'IdentityId',
        Err: 'Vec<u8>',
      },
    },
    RpcDidRecordsSuccess: {
      primaryKey: 'AccountId',
      secondaryKeys: 'Vec<SecondaryKey>',
    },
    RpcDidRecords: {
      _enum: {
        Success: 'RpcDidRecordsSuccess',
        IdNotFound: 'Vec<u8>',
      },
    },
    VoteCountProposalFound: {
      ayes: 'u64',
      nays: 'u64',
    },
    VoteCount: {
      _enum: {
        ProposalFound: 'VoteCountProposalFound',
        ProposalNotFound: '',
      },
    },
    CappedFee: 'u64',
    AuthorizationType: {
      _enum: {
        AttestPrimaryKeyRotation: '',
        RotatePrimaryKey: '',
        TransferTicker: '',
        AddMultiSigSigner: '',
        TransferAssetOwnership: '',
        JoinIdentity: '',
        PortfolioCustody: '',
        BecomeAgent: '',
        AddRelayerPayingKey: '',
        RotatePrimaryKeyToSecondary: '',
      },
    },
    DidStatus: {
      _enum: {
        Unknown: '',
        Exists: '',
        CddVerified: '',
      },
    },
    PortfolioNumber: 'u64',
    PortfolioKind: {
      _enum: {
        Default: '',
        User: 'PortfolioNumber',
      },
    },
    PortfolioId: {
      did: 'IdentityId',
      kind: 'PortfolioKind',
    },
    Moment: 'u64',
    InstructionId: 'u64',
    TargetIdentity: {
      _enum: {
        ExternalAgent: '',
        Specific: 'IdentityId',
      },
    },
    CanTransferGranularReturn: {
      _enum: {
        Ok: 'GranularCanTransferResult',
        Err: 'DispatchError',
      },
    },
    GranularCanTransferResult: {
      invalidGranularity: 'bool',
      selfTransfer: 'bool',
      invalidReceiverCdd: 'bool',
      invalidSenderCdd: 'bool',
      receiverCustodianError: 'bool',
      senderCustodianError: 'bool',
      senderInsufficientBalance: 'bool',
      portfolioValidityResult: 'PortfolioValidityResult',
      assetFrozen: 'bool',
      transferConditionResult: 'Vec<TransferConditionResult>',
      complianceResult: 'AssetComplianceResult',
      result: 'bool',
      consumedWeight: 'Option<Weight>',
    },
    PortfolioValidityResult: {
      receiverIsSamePortfolio: 'bool',
      senderPortfolioDoesNotExist: 'bool',
      receiverPortfolioDoesNotExist: 'bool',
      senderInsufficientBalance: 'bool',
      result: 'bool',
    },
    TransferConditionResult: {
      condition: 'TransferCondition',
      result: 'bool',
    },
    AGId: 'u32',
    AgentGroup: {
      _enum: {
        Full: '',
        Custom: 'AGId',
        ExceptMeta: '',
        PolymeshV1CAA: '',
        PolymeshV1PIA: '',
      },
    },
    Member: {
      id: 'IdentityId',
      expiryAt: 'Option<Moment>',
      inactiveFrom: 'Option<Moment>',
    },
    NFTId: 'u64',
    NFTs: {
      asset_id: 'AssetID',
      ids: 'Vec<NFTId>',
    },
    FungibleLeg: {
      sender: 'PortfolioId',
      receiver: 'PortfolioId',
      asset_id: 'AssetID',
      amount: 'Balance',
    },
    NonFungibleLeg: {
      sender: 'PortfolioId',
      receiver: 'PortfolioId',
      nfts: 'NFTs',
    },
    OffChainLeg: {
      sender_identity: 'IdentityId',
      receiver_identity: 'IdentityId',
      asset_id: 'AssetID',
      amount: 'Balance',
    },
    Leg: {
      _enum: {
        Fungible: 'FungibleLeg',
        NonFungible: 'NonFungibleLeg',
        OffChain: 'OffChainLeg',
      },
    },
    ExecuteInstructionInfo: {
      fungibleTokens: 'u32',
      nonFungibleTokens: 'u32',
      offChainAssets: 'u32',
      consumedWeight: 'Weight',
      error: 'Option<String>',
    },
    AssetCount: {
      fungible_tokens: 'u32',
      non_fungible_tokens: 'u32',
      off_chain_assets: 'u32',
    },
    AffirmationCount: {
      senderAssetCount: 'AssetCount',
      receiverAssetCount: 'AssetCount',
      offchainCount: 'u32',
    },
    ComplianceReport: {
      anyRequirementSatistifed: 'bool',
      pausedCompliance: 'bool',
      requirements: 'Vec<RequirementReport>',
    },
    RequirementReport: {
      requirementSatisfied: 'bool',
      id: 'u32',
      senderConditions: 'Vec<ConditionReport>',
      receiverConditions: 'Vec<ConditionReport>',
    },
    ConditionReport: {
      satisfied: 'bool',
      condition: 'Condition',
    },
  },
};
