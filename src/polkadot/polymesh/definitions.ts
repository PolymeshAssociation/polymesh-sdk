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
    Address: 'MultiAddress',
    LookupSource: 'MultiAddress',
    AccountInfo: 'AccountInfoWithDualRefCount',
    IdentityId: '[u8; 32]',
    EventDid: 'IdentityId',
    EventCounts: 'Vec<u32>',
    ErrorAt: '(u32, DispatchError)',
    Ticker: '[u8; 12]',
    CddId: '[u8; 32]',
    PosRatio: '(u32, u32)',
    DocumentId: 'u32',
    DocumentName: 'Text',
    DocumentUri: 'Text',
    DocumentHash: {
      _enum: {
        None: '',
        H512: '[u8; 64]',
        H384: '[u8; 48]',
        H320: '[u8; 40]',
        H256: '[u8; 32]',
        H224: '[u8; 28]',
        H192: '[u8; 24]',
        H160: '[u8; 20]',
        H128: '[u8; 16]',
      },
    },
    DocumentType: 'Text',
    Document: {
      uri: 'DocumentUri',
      contentHash: 'DocumentHash',
      name: 'DocumentName',
      docType: 'Option<DocumentType>',
      filingDate: 'Option<Moment>',
    },
    Version: 'u8',
    CustomAssetTypeId: 'u32',
    AssetType: {
      _enum: {
        EquityCommon: '',
        EquityPreferred: '',
        Commodity: '',
        FixedIncome: '',
        REIT: '',
        Fund: '',
        RevenueShareAgreement: '',
        StructuredProduct: '',
        Derivative: '',
        Custom: 'CustomAssetTypeId',
        StableCoin: '',
        NonFungible: 'NonFungibleType',
      },
    },
    AssetIdentifier: {
      _enum: {
        CUSIP: '[u8; 9]',
        CINS: '[u8; 9]',
        ISIN: '[u8; 12]',
        LEI: '[u8; 20]',
        FIGI: '[u8; 12]',
      },
    },
    AssetOwnershipRelation: {
      _enum: {
        NotOwned: '',
        TickerOwned: '',
        AssetOwned: '',
      },
    },
    AssetName: 'Text',
    FundingRoundName: 'Text',
    VenueDetails: 'Text',
    SecurityToken: {
      totalSupply: 'Balance',
      ownerDid: 'IdentityId',
      divisible: 'bool',
      assetType: 'AssetType',
    },
    AssetMetadataName: 'Text',
    AssetMetadataValue: 'Vec<u8>',
    AssetMetadataLocalKey: 'u64',
    AssetMetadataGlobalKey: 'u64',
    AssetMetadataKey: {
      _enum: {
        Global: 'u64',
        Local: 'u64',
      },
    },
    AssetMetadataLockStatus: {
      _enum: {
        Unlocked: '',
        Locked: '',
        LockedUntil: 'Moment',
      },
    },
    AssetMetadataValueDetail: {
      expire: 'Option<Moment>',
      lockStatus: 'AssetMetadataLockStatus',
    },
    AssetMetadataDescription: 'Text',
    AssetMetadataSpec: {
      url: 'Option<Url>',
      description: 'Option<AssetMetadataDescription>',
      typeDef: 'Option<Vec<u8>>',
    },
    PalletName: 'Text',
    DispatchableName: 'Text',
    AssetPermissions: {
      _enum: {
        Whole: '',
        These: 'Vec<Ticker>',
        Except: 'Vec<Ticker>',
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
    SecondaryKeyWithAuth: {
      secondaryKey: 'SecondaryKey',
      authSignature: 'H512',
    },
    Subsidy: {
      payingKey: 'AccountId',
      remaining: 'Balance',
    },
    IdentityRole: {
      _enum: [
        'Issuer',
        'SimpleTokenIssuer',
        'Validator',
        'ClaimIssuer',
        'Investor',
        'NodeRunner',
        'PM',
        'CDDAMLClaimIssuer',
        'AccreditedInvestorClaimIssuer',
        'VerifiedIdentityClaimIssuer',
      ],
    },
    PreAuthorizedKeyInfo: {
      targetId: 'IdentityId',
      secondaryKey: 'SecondaryKey',
    },
    DidRecord: {
      primaryKey: 'Option<AccountId>',
    },
    KeyRecord: {
      _enum: {
        PrimaryKey: 'IdentityId',
        SecondaryKey: '(IdentityId, Permissions)',
        MultiSigSignerKey: 'AccountId',
      },
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
    ComplianceRequirement: {
      senderConditions: 'Vec<Condition>',
      receiverConditions: 'Vec<Condition>',
      id: 'u32',
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
      conditionType: 'ConditionType',
      issuers: 'Vec<PolymeshPrimitivesConditionTrustedIssuer>',
    },
    ConditionResult: {
      condition: 'Condition',
      result: 'bool',
    },
    TargetIdAuthorization: {
      targetId: 'IdentityId',
      nonce: 'u64',
      expiresAt: 'Moment',
    },
    TickerRegistration: {
      owner: 'IdentityId',
      expiry: 'Option<Moment>',
    },
    TickerRegistrationConfig: {
      maxTickerLength: 'u8',
      registrationLength: 'Option<Moment>',
    },
    EthereumAddress: '[u8; 20]',
    EcdsaSignature: '[u8; 65]',
    MotionTitle: 'Text',
    MotionInfoLink: 'Text',
    ChoiceTitle: 'Text',
    Motion: {
      title: 'MotionTitle',
      infoLink: 'MotionInfoLink',
      choices: 'Vec<ChoiceTitle>',
    },
    BallotTitle: 'Text',
    BallotMeta: {
      title: 'BallotTitle',
      motions: 'Vec<Motion>',
    },
    BallotTimeRange: {
      start: 'Moment',
      end: 'Moment',
    },
    BallotVote: {
      power: 'Balance',
      fallback: 'Option<u16>',
    },
    MaybeBlock: {
      _enum: {
        Some: 'BlockNumber',
        None: '',
      },
    },
    Url: 'Text',
    PipDescription: 'Text',
    PipsMetadata: {
      id: 'PipId',
      url: 'Option<Url>',
      description: 'Option<PipDescription>',
      createdAt: 'BlockNumber',
      transactionVersion: 'u32',
      expiry: 'MaybeBlock',
    },
    Proposer: {
      _enum: {
        Community: 'AccountId',
        Committee: 'Committee',
      },
    },
    Committee: {
      _enum: {
        Technical: '',
        Upgrade: '',
      },
    },
    SkippedCount: 'u8',
    SnapshottedPip: {
      id: 'PipId',
      weight: '(bool, Balance)',
    },
    SnapshotId: 'u32',
    SnapshotMetadata: {
      createdAt: 'BlockNumber',
      madeBy: 'AccountId',
      id: 'SnapshotId',
    },
    SnapshotResult: {
      _enum: {
        Approve: '',
        Reject: '',
        Skip: '',
      },
    },
    Beneficiary: {
      id: 'IdentityId',
      amount: 'Balance',
    },
    DepositInfo: {
      owner: 'AccountId',
      amount: 'Balance',
    },
    PolymeshVotes: {
      index: 'u32',
      ayes: 'Vec<IdentityId>',
      nays: 'Vec<IdentityId>',
      expiry: 'MaybeBlock',
    },
    PipId: 'u32',
    ProposalState: {
      _enum: ['Pending', 'Rejected', 'Scheduled', 'Failed', 'Executed', 'Expired'],
    },
    Pip: {
      id: 'PipId',
      proposal: 'Call',
      proposer: 'Proposer',
    },
    ProposalData: {
      _enum: {
        Hash: 'Hash',
        Proposal: 'Vec<u8>',
      },
    },
    OffChainSignature: 'MultiSignature',
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
        TransferAssetOwnership: 'Ticker',
        JoinIdentity: 'Permissions',
        PortfolioCustody: 'PortfolioId',
        BecomeAgent: '(Ticker, AgentGroup)',
        AddRelayerPayingKey: '(AccountId, AccountId, Balance)',
        RotatePrimaryKeyToSecondary: 'Permissions',
      },
    },
    AuthorizationNonce: 'u64',
    Percentage: 'Permill',
    RestrictionResult: {
      _enum: ['Valid', 'Invalid', 'ForceValid'],
    },
    Memo: '[u8; 32]',
    BridgeTx: {
      nonce: 'u32',
      recipient: 'AccountId',
      amount: 'Balance',
      txHash: 'H256',
    },
    AssetScope: {
      _enum: {
        Ticker: 'Ticker',
      },
    },
    StatOpType: {
      _enum: ['Count', 'Balance'],
    },
    StatType: {
      op: 'StatOpType',
      claimIssuer: 'Option<(ClaimType, IdentityId)>',
    },
    StatClaim: {
      _enum: {
        Accredited: 'bool',
        Affiliate: 'bool',
        Jurisdiction: 'Option<CountryCode>',
      },
    },
    Stat1stKey: {
      asset: 'AssetScope',
      statType: 'StatType',
    },
    Stat2ndKey: {
      _enum: {
        NoClaimStat: '',
        Claim: 'StatClaim',
      },
    },
    StatUpdate: {
      key2: 'Stat2ndKey',
      value: 'Option<u128>',
    },
    TransferCondition: {
      _enum: {
        MaxInvestorCount: 'u64',
        MaxInvestorOwnership: 'Percentage',
        ClaimCount: '(StatClaim, IdentityId, u64, Option<u64>)',
        ClaimOwnership: '(StatClaim, IdentityId, Percentage, Percentage)',
      },
    },
    AssetTransferCompliance: {
      paused: 'bool',
      requirements: 'Vec<TransferCondition>',
    },
    TransferConditionExemptKey: {
      asset: 'AssetScope',
      op: 'StatOpType',
      claimType: 'Option<ClaimType>',
    },
    AssetCompliance: {
      paused: 'bool',
      requirements: 'Vec<ComplianceRequirement>',
    },
    AssetComplianceResult: {
      paused: 'bool',
      requirements: 'Vec<ComplianceRequirementResult>',
      result: 'bool',
    },
    Claim1stKey: {
      target: 'IdentityId',
      claimType: 'ClaimType',
    },
    Claim2ndKey: {
      issuer: 'IdentityId',
      scope: 'Option<Scope>',
    },
    InactiveMember: {
      id: 'IdentityId',
      deactivatedAt: 'Moment',
      expiry: 'Option<Moment>',
    },
    VotingResult: {
      ayesCount: 'u32',
      ayesStake: 'Balance',
      naysCount: 'u32',
      naysStake: 'Balance',
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
    Vote: '(bool, Balance)',
    VoteByPip: {
      pip: 'PipId',
      vote: 'Vote',
    },
    BridgeTxDetail: {
      amount: 'Balance',
      status: 'BridgeTxStatus',
      executionBlock: 'BlockNumber',
      txHash: 'H256',
    },
    BridgeTxStatus: {
      _enum: {
        Absent: '',
        Pending: 'u8',
        Frozen: '',
        Timelocked: '',
        Handled: '',
      },
    },
    HandledTxStatus: {
      _enum: {
        Success: '',
        Error: 'Text',
      },
    },
    CappedFee: 'u64',
    CanTransferResult: {
      _enum: {
        Ok: 'u8',
        Err: 'Vec<u8>',
      },
    },
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
    ProposalDetails: {
      approvals: 'u64',
      rejections: 'u64',
      status: 'ProposalStatus',
      expiry: 'Option<Moment>',
      autoClose: 'bool',
    },
    ProposalStatus: {
      _enum: {
        Invalid: '',
        ActiveOrExpired: '',
        ExecutionSuccessful: '',
        ExecutionFailed: '',
        Rejected: '',
      },
    },
    DidStatus: {
      _enum: {
        Unknown: '',
        Exists: '',
        CddVerified: '',
      },
    },
    PortfolioName: 'Text',
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
    CalendarUnit: {
      _enum: ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'],
    },
    CalendarPeriod: {
      unit: 'CalendarUnit',
      amount: 'u64',
    },
    CheckpointSchedule: {
      start: 'Moment',
      period: 'CalendarPeriod',
    },
    CheckpointId: 'u64',
    ScheduleId: 'u64',
    StoredSchedule: {
      schedule: 'CheckpointSchedule',
      id: 'ScheduleId',
      at: 'Moment',
      remaining: 'u32',
    },
    ScheduleSpec: {
      start: 'Option<Moment>',
      period: 'CalendarPeriod',
      remaining: 'u32',
    },
    InstructionStatus: {
      _enum: {
        Unknown: '',
        Pending: '',
        Failed: '',
      },
    },
    LegStatus: {
      _enum: {
        PendingTokenLock: '',
        ExecutionPending: '',
        ExecutionToBeSkipped: '(AccountId, u64)',
      },
    },
    AffirmationStatus: {
      _enum: {
        Unknown: '',
        Pending: '',
        Affirmed: '',
      },
    },
    SettlementType: {
      _enum: {
        SettleOnAffirmation: '',
        SettleOnBlock: 'BlockNumber',
        SettleManual: 'BlockNumber',
      },
    },
    LegId: 'u64',
    InstructionId: 'u64',
    Instruction: {
      instructionId: 'InstructionId',
      venueId: 'VenueId',
      status: 'InstructionStatus',
      settlementType: 'SettlementType',
      createdAt: 'Option<Moment>',
      tradeDate: 'Option<Moment>',
      valueDate: 'Option<Moment>',
    },
    Venue: {
      creator: 'IdentityId',
      venueType: 'VenueType',
    },
    Receipt: {
      receiptUid: 'u64',
      from: 'PortfolioId',
      to: 'PortfolioId',
      asset: 'Ticker',
      amount: 'Balance',
    },
    ReceiptMetadata: 'Text',
    ReceiptDetails: {
      receiptUid: 'u64',
      legId: 'LegId',
      signer: 'AccountId',
      signature: 'OffChainSignature',
      metadata: 'ReceiptMetadata',
    },
    UniqueCall: {
      nonce: 'u64',
      call: 'Call',
    },
    MovePortfolioItem: {
      ticker: 'Ticker',
      amount: 'Balance',
      memo: 'Option<Memo>',
    },
    WeightToFeeCoefficient: {
      coeffInteger: 'Balance',
      coeffFrac: 'Perbill',
      negative: 'bool',
      degree: 'u8',
    },
    WeightPerClass: {
      baseExtrinsic: 'Weight',
      maxExtrinsic: 'Option<Weight>',
      maxTotal: 'Option<Weight>',
      reserved: 'Option<Weight>',
    },
    TargetIdentity: {
      _enum: {
        ExternalAgent: '',
        Specific: 'IdentityId',
      },
    },
    FundraiserId: 'u64',
    FundraiserName: 'Text',
    FundraiserStatus: {
      _enum: ['Live', 'Frozen', 'Closed', 'ClosedEarly'],
    },
    FundraiserTier: {
      total: 'Balance',
      price: 'Balance',
      remaining: 'Balance',
    },
    Fundraiser: {
      creator: 'IdentityId',
      offeringPortfolio: 'PortfolioId',
      offeringAsset: 'Ticker',
      raisingPortfolio: 'PortfolioId',
      raisingAsset: 'Ticker',
      tiers: 'Vec<FundraiserTier>',
      venueId: 'VenueId',
      start: 'Moment',
      end: 'Option<Moment>',
      status: 'FundraiserStatus',
      minimumInvestment: 'Balance',
    },
    VenueId: 'u64',
    VenueType: {
      _enum: ['Other', 'Distribution', 'Sto', 'Exchange'],
    },
    Tax: 'Permill',
    TargetIdentities: {
      identities: 'Vec<IdentityId>',
      treatment: 'TargetTreatment',
    },
    TargetTreatment: {
      _enum: ['Include', 'Exclude'],
    },
    CAKind: {
      _enum: [
        'PredictableBenefit',
        'UnpredictableBenefit',
        'IssuerNotice',
        'Reorganization',
        'Other',
      ],
    },
    CADetails: 'Text',
    CACheckpoint: {
      _enum: {
        Scheduled: '(ScheduleId, u64)',
        Existing: 'CheckpointId',
      },
    },
    RecordDate: {
      date: 'Moment',
      checkpoint: 'CACheckpoint',
    },
    RecordDateSpec: {
      _enum: {
        Scheduled: 'Moment',
        ExistingSchedule: 'ScheduleId',
        Existing: 'CheckpointId',
      },
    },
    CorporateAction: {
      kind: 'CAKind',
      declDate: 'Moment',
      recordDate: 'Option<RecordDate>',
      targets: 'TargetIdentities',
      defaultWithholdingTax: 'Tax',
      withholdingTax: 'Vec<(IdentityId, Tax)>',
    },
    InitiateCorporateActionArgs: {
      ticker: 'Ticker',
      kind: 'CAKind',
      declDate: 'Moment',
      recordDate: 'Option<RecordDateSpec>',
      details: 'CADetails',
      targets: 'Option<TargetIdentities>',
      defaultWithholdingTax: 'Option<Tax>',
      withholdingTax: 'Option<Vec<(IdentityId, Tax)>>',
    },
    LocalCAId: 'u32',
    CAId: {
      ticker: 'Ticker',
      localId: 'LocalCAId',
    },
    Distribution: {
      from: 'PortfolioId',
      currency: 'Ticker',
      perShare: 'Balance',
      amount: 'Balance',
      remaining: 'Balance',
      reclaimed: 'bool',
      paymentAt: 'Moment',
      expiresAt: 'Option<Moment>',
    },
    SlashingSwitch: {
      _enum: ['Validator', 'ValidatorAndNominator', 'None'],
    },
    PriceTier: {
      total: 'Balance',
      price: 'Balance',
    },
    PermissionedIdentityPrefs: {
      intendedCount: 'u32',
      runningCount: 'u32',
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
    ItnRewardStatus: {
      _enum: {
        Unclaimed: 'Balance',
        Claimed: '',
      },
    },
    NFTId: 'u64',
    NFTs: {
      ticker: 'Ticker',
      ids: 'Vec<NFTId>',
    },
    FungibleToken: {
      ticker: 'Ticker',
      amount: 'Balance',
    },
    OffChainAsset: {
      ticker: 'Ticker',
      amount: 'Balance',
    },
    FungibleLeg: {
      sender: 'PortfolioId',
      receiver: 'PortfolioId',
      ticker: 'Ticker',
      amount: 'Balance',
    },
    NonFungibleLeg: {
      sender: 'PortfolioId',
      receiver: 'PortfolioId',
      nfts: 'NFTs',
    },
    OffChainLeg: {
      senderIdentity: 'IdentityId',
      receiverIdentity: 'IdentityId',
      ticker: 'Ticker',
      amount: 'Balance',
    },
    Leg: {
      _enum: {
        Fungible: 'FungibleLeg',
        NonFungible: 'NonFungibleLeg',
        OffChain: 'OffChainLeg',
      },
    },
    FundDescription: {
      _enum: {
        Fungible: 'FungibleToken',
        NonFungible: 'NFTs',
      },
    },
    Fund: {
      description: 'FundDescription',
      memo: 'Option<Memo>',
    },
    NonFungibleType: {
      _enum: {
        Derivative: '',
        FixedIncome: '',
        Invoice: '',
        Custom: 'CustomAssetTypeId',
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
      fungibleTokens: 'u32',
      nonFungibleTokens: 'u32',
      offChainAssets: 'u32',
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
