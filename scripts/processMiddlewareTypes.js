/* eslint-disable */
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

const typesFile = path.resolve('src', 'middleware', 'types.ts');
const enumAliasFile = path.resolve('src', 'middleware', 'enums.ts');

let rawData = fs.readFileSync(typesFile).toString('utf8');

replace.sync({
  files: typesFile,
  from: /\\n/gs,
  to: ' \n* ',
});

const enumRegex = new RegExp(/@enumName (.*)(?:\\n.*) \*\/\nexport enum (.*) {/g);

const matches = rawData.matchAll(enumRegex);
let aliases = [];
let enumMappings = [];
for (const match of matches) {
  aliases.push(`${match[2]} as ${match[1]}`);
  enumMappings.push(`${match[1]}: '${match[2]}'`);
}

fs.writeFileSync(
  enumAliasFile,
  `/* istanbul ignore file */
export { 
  ${aliases.join(',\n  ')} 
} from '~/middleware/types';
  
export const middlewareEnumMap: Record<string, string> = {
  ${enumMappings.join(',\n  ')}
};
`
);
