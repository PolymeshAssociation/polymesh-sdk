const path = require('path');
const replace = require('replace-in-file');
const definitionsDir = path.resolve('src', 'polkadot');

replace.sync({
  files: path.resolve(definitionsDir, 'augment-api-query.ts'),
  from: [/agIdSequence/g, /caIdSequence/g, /caDocLink/g],
  to: ['aGIdSequence', 'cAIdSequence', 'cADocLink'],
});
