const path = require('path');
const replace = require('replace-in-file');
const definitionsDir = path.resolve('src', 'polkadot');

replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-query.ts'),
  from: [/agIdSequence/g, /caIdSequence/g, /caDocLink/g],
  to: ['aGIdSequence', 'cAIdSequence', 'cADocLink'],
});

const replaceTargets = ['Authorization', 'IdentityId'];
const usageMatcher = replaceTargets.map(i => new RegExp(`\\b${i}\\b`, 'g'));
replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-rpc.ts'),
  from: [
    // // cleanup the original import statement
    ...replaceTargets.map(p => `${p}, `),
    // replace all occurrences with the long version of the name
    ...usageMatcher,
    // add in the import statement
    /\n\n/,
  ],
  to: [
    ...replaceTargets.map(_ => ''),
    ...replaceTargets.map(p => `PolymeshPrimitives${p}`),
    `\n\nimport { ${replaceTargets
      .map(p => 'PolymeshPrimitives' + p)
      .join(', ')} } from '@polkadot/types/lookup';\n`,
  ],
});
