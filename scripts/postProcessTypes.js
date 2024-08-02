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
    "\nimport { \n  PolymeshPrimitivesConditionConditionType,\n  PolymeshPrimitivesConditionTrustedIssuer \n} from '@polkadot/types/lookup';\nimport",
  ],
});

// TODO: This adds in 6.x support for the dual version. It should be removed when mainnet reaches 7.0
replace.sync({
  files: path.resolve(definitionsDir, 'types-lookup.ts'),
  from: [
    'readonly asAsset: PolymeshPrimitivesAssetAssetID;',
    "readonly type: 'Identity' | 'Asset' | 'Custom'",
  ],
  to: [
    'readonly asAsset: PolymeshPrimitivesAssetAssetID;\n  readonly isTicker: boolean;\n  readonly asTicker: PolymeshPrimitivesTicker;',
    "readonly type: 'Identity' | 'Asset' | 'Ticker' | 'Custom'",
  ],
});
