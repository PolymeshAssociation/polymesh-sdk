const path = require('path');
const replace = require('replace-in-file');
const definitionsDir = path.resolve('src', 'polkadot');

// Add in import for modified schema
replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-rpc.ts'),
  from: ['\nimport'],
  to: [
    "\nimport { PolymeshPrimitivesAuthorization, PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';\nimport",
  ],
});

// Add in import for modified schema
replace.sync({
  files: path.resolve(definitionsDir, 'polymesh/types.ts'),
  from: ['\nimport'],
  to: [
    "\nimport { PolymeshPrimitivesConditionTrustedIssuer } from '@polkadot/types/lookup';\nimport",
  ],
});

// TODO: This adds in 5.4 types for the dual version. It should be removed when mainnet reaches 6.0
replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-tx.ts'),
  from: [
    '      executeManualInstruction: AugmentedSubmittable<(id: u64 | AnyNumber | Uint8Array, portfolio: Option<PolymeshPrimitivesIdentityIdPortfolioId> | null | Uint8Array | PolymeshPrimitivesIdentityIdPortfolioId | { did?: any; kind?: any } | string, fungibleTransfers: u32 | AnyNumber | Uint8Array, nftsTransfers: u32 | AnyNumber | Uint8Array, offchainTransfers: u32 | AnyNumber | Uint8Array, weightLimit: Option<SpWeightsWeightV2Weight> | null | Uint8Array | SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string) => SubmittableExtrinsic<ApiType>, [u64, Option<PolymeshPrimitivesIdentityIdPortfolioId>, u32, u32, u32, Option<SpWeightsWeightV2Weight>]>;',
  ],
  to: [
    'executeManualInstruction: AugmentedSubmittable<(id: u64 | AnyNumber | Uint8Array, legsCount: u32 | AnyNumber | Uint8Array, portfolio: Option<PolymeshPrimitivesIdentityIdPortfolioId> | null | Uint8Array | PolymeshPrimitivesIdentityIdPortfolioId | { did?: any; kind?: any } | string) => SubmittableExtrinsic<ApiType>, [u64, u32, Option<PolymeshPrimitivesIdentityIdPortfolioId>]>;\n//Removed in 6.0\nrescheduleInstruction: AugmentedSubmittable< (id: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>, [u64] >;\n',
  ],
});

// TODO: This adds in 5.4 types for the dual version. It should be removed when mainnet reaches 6.0
replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-query.ts'),
  from: [
    'totalSupply: AugmentedQuery<ApiType, (arg1: PolymeshPrimitivesTicker | string | Uint8Array, arg2: u64 | AnyNumber | Uint8Array) => Observable<u128>, [PolymeshPrimitivesTicker, u64]>;',
  ],
  to: [
    'totalSupply: AugmentedQuery<ApiType, (arg1: PolymeshPrimitivesTicker | string | Uint8Array, arg2: u64 | AnyNumber | Uint8Array) => Observable<u128>, [PolymeshPrimitivesTicker, u64]>;\n//removed in v6\nschedules: AugmentedQuery< ApiType, ( arg: PolymeshPrimitivesTicker | string | Uint8Array) => Observable<Vec<any>>, [PolymeshPrimitivesTicker] >;',
  ],
});
