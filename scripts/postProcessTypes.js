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
