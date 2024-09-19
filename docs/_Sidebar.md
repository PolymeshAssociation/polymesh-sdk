## @polymeshassociation/polymesh-sdk

- [Home](../wiki/Home)

### Modules
<details>
  <summary>
    <b>Client</b>
  </summary>

  - [Account Management](../wiki/api.client.AccountManagement)
  - [Assets](../wiki/api.client.Assets)
  - [Claims](../wiki/api.client.Claims)
  - [Identities](../wiki/api.client.Identities)
  - [Network](../wiki/api.client.Network)
  - [Polymesh](../wiki/api.client.Polymesh)
  - [Settlements](../wiki/api.client.Settlements)
  - [Types](../wiki/api.client.types)

</details><details>
  <summary>
    <b>Entities</b>
  </summary>

  - [Account](../wiki/api.entities.Account)
    - [Multi Sig](../wiki/api.entities.Account.MultiSig)
      - [Types](../wiki/api.entities.Account.MultiSig.types)
    - [Helpers](../wiki/api.entities.Account.helpers)
    - [Types](../wiki/api.entities.Account.types)
  - [Asset](../wiki/api.entities.Asset)
    - [Base](../wiki/api.entities.Asset.Base)
      - [Base Asset](../wiki/api.entities.Asset.Base.BaseAsset)
      - [Compliance](../wiki/api.entities.Asset.Base.Compliance)
        - [Requirements](../wiki/api.entities.Asset.Base.Compliance.Requirements)
        - [Trusted Claim Issuers](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers)
      - [Documents](../wiki/api.entities.Asset.Base.Documents)
      - [Metadata](../wiki/api.entities.Asset.Base.Metadata)
      - [Permissions](../wiki/api.entities.Asset.Base.Permissions)
      - [Settlements](../wiki/api.entities.Asset.Base.Settlements)
    - [Fungible](../wiki/api.entities.Asset.Fungible)
      - [Asset Holders](../wiki/api.entities.Asset.Fungible.AssetHolders)
      - [Checkpoints](../wiki/api.entities.Asset.Fungible.Checkpoints)
        - [Schedules](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules)
        - [Types](../wiki/api.entities.Asset.Fungible.Checkpoints.types)
      - [Corporate Actions](../wiki/api.entities.Asset.Fungible.CorporateActions)
        - [Distributions](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions)
        - [Types](../wiki/api.entities.Asset.Fungible.CorporateActions.types)
      - [Issuance](../wiki/api.entities.Asset.Fungible.Issuance)
      - [Offerings](../wiki/api.entities.Asset.Fungible.Offerings)
      - [Transfer Restrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions)
        - [Claim Count](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount)
        - [Claim Percentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage)
        - [Count](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count)
        - [Percentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage)
        - [Transfer Restriction Base](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase)
    - [Non Fungible](../wiki/api.entities.Asset.NonFungible)
      - [Asset Holders](../wiki/api.entities.Asset.NonFungible.AssetHolders)
      - [Nft](../wiki/api.entities.Asset.NonFungible.Nft)
      - [Nft Collection](../wiki/api.entities.Asset.NonFungible.NftCollection)
    - [Types](../wiki/api.entities.Asset.types)
  - [Authorization Request](../wiki/api.entities.AuthorizationRequest)
  - [Checkpoint](../wiki/api.entities.Checkpoint)
  - [Checkpoint Schedule](../wiki/api.entities.CheckpointSchedule)
    - [Types](../wiki/api.entities.CheckpointSchedule.types)
  - [Corporate Action](../wiki/api.entities.CorporateAction)
  - [Corporate Action Base](../wiki/api.entities.CorporateActionBase)
    - [Types](../wiki/api.entities.CorporateActionBase.types)
  - [Custom Permission Group](../wiki/api.entities.CustomPermissionGroup)
  - [Default Portfolio](../wiki/api.entities.DefaultPortfolio)
  - [Default Trusted Claim Issuer](../wiki/api.entities.DefaultTrustedClaimIssuer)
  - [Dividend Distribution](../wiki/api.entities.DividendDistribution)
    - [Types](../wiki/api.entities.DividendDistribution.types)
  - [Entity](../wiki/api.entities.Entity)
  - [Identity](../wiki/api.entities.Identity)
    - [Asset Permissions](../wiki/api.entities.Identity.AssetPermissions)
    - [Child Identity](../wiki/api.entities.Identity.ChildIdentity)
    - [Identity Authorizations](../wiki/api.entities.Identity.IdentityAuthorizations)
    - [Portfolios](../wiki/api.entities.Identity.Portfolios)
  - [Instruction](../wiki/api.entities.Instruction)
    - [Types](../wiki/api.entities.Instruction.types)
  - [Known Permission Group](../wiki/api.entities.KnownPermissionGroup)
  - [Metadata Entry](../wiki/api.entities.MetadataEntry)
    - [Types](../wiki/api.entities.MetadataEntry.types)
  - [Multi Sig Proposal](../wiki/api.entities.MultiSigProposal)
    - [Types](../wiki/api.entities.MultiSigProposal.types)
  - [Numbered Portfolio](../wiki/api.entities.NumberedPortfolio)
  - [Offering](../wiki/api.entities.Offering)
    - [Types](../wiki/api.entities.Offering.types)
  - [Permission Group](../wiki/api.entities.PermissionGroup)
  - [Portfolio](../wiki/api.entities.Portfolio)
    - [Types](../wiki/api.entities.Portfolio.types)
  - [Subsidies](../wiki/api.entities.Subsidies)
  - [Subsidy](../wiki/api.entities.Subsidy)
    - [Types](../wiki/api.entities.Subsidy.types)
  - [Ticker Reservation](../wiki/api.entities.TickerReservation)
    - [Types](../wiki/api.entities.TickerReservation.types)
  - [Venue](../wiki/api.entities.Venue)
    - [Types](../wiki/api.entities.Venue.types)
  - [Authorizations](../wiki/api.entities.common.namespaces.Authorizations)
  - [Types](../wiki/api.entities.types)

</details><details>
  <summary>
    <b>Procedures</b>
  </summary>

  - [Types](../wiki/api.procedures.types)

</details><details>
  <summary>
    <b>Base</b>
  </summary>

  - [Polymesh Error](../wiki/base.PolymeshError)
  - [Polymesh Transaction](../wiki/base.PolymeshTransaction)
  - [Polymesh Transaction Base](../wiki/base.PolymeshTransactionBase)
  - [Polymesh Transaction Batch](../wiki/base.PolymeshTransactionBatch)
  - [Types](../wiki/base.types)
  - [Utils](../wiki/base.utils)

</details><details>
  <summary>
    <b>Generated</b>
  </summary>

  - [Types](../wiki/generated.types)

</details><details>
  <summary>
    <b>Types</b>
  </summary>

  - [Types](../wiki/types)
    - [Utils](../wiki/types.utils)

</details>
