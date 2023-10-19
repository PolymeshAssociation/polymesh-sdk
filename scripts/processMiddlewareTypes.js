/* eslint-disable */
const path = require('path');
const replace = require('replace-in-file');

const typesFile = path.resolve('src', 'middleware', 'types.ts');

replace.sync({
  files: typesFile,
  from: /\\n/gs,
  to: ' \n* ',
});
