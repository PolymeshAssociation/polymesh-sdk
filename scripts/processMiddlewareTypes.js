/* eslint-disable */
const fs = require('fs');
const path = require('path');

const typesV2File = path.resolve('src', 'middleware', 'typesV2.ts');
const enumAliasFile = path.resolve('src', 'middleware', 'enumsV2.ts');

let rawData = fs.readFileSync(typesV2File).toString('utf8');

const enumRegex = new RegExp(
  /\/\*\* @enum\\n@enumName (.*)Enum(?:\\n (?:.*))? \*\/\nexport enum (.*) {/g
);

const matches = rawData.matchAll(enumRegex);
let aliases = [];
let enumMappings = [];
for (const match of matches) {
  aliases.push(`${match[2]} as ${match[1]}Enum`);
  enumMappings.push(`${match[1]}Enum: '${match[2]}'`);
}

fs.writeFileSync(
  enumAliasFile,
  `export { 
  ${aliases.join(',\n  ')} 
} from '~/middleware/typesV2';
  
export const middlewareV2EnumMap: Record<string, string> = {
  ${enumMappings.join(',\n  ')}
};
`
);
