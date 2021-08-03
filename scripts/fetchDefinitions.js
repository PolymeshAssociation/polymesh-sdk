/* eslint-disable */
const https = require('https');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');
const { upperFirst, toLower, forEach } = require('lodash');

const definitionsDir = path.resolve('src', 'polkadot');
const typesDir = path.resolve(definitionsDir, 'polymesh');
const generatedDir = path.resolve('src', 'generated');

const urlPath = 'https://pmf.polymath.network/code';

rimraf.sync(typesDir);
fs.mkdirSync(typesDir);

rimraf.sync(generatedDir);
fs.mkdirSync(generatedDir);

function writeDefinitions(schemaObj) {
  const { types, rpc: rpcModules } = schemaObj;

  fs.writeFileSync(
    path.resolve(typesDir, 'definitions.ts'),
    `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
      { rpc: {}, types },
      {
        compact: false,
        depth: null,
        maxArrayLength: null,
      }
    )}`
  );

  fs.writeFileSync(
    path.resolve(definitionsDir, 'schema.ts'),
    `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
      schemaObj,
      {
        compact: false,
        depth: null,
        maxArrayLength: null,
      }
    )}`
  );

  let defExports = "export { default as polymesh } from './polymesh/definitions'\n";

  forEach(rpcModules, (rpc, moduleName) => {
    const moduleDir = path.resolve(definitionsDir, moduleName);

    rimraf.sync(moduleDir);
    fs.mkdirSync(moduleDir);

    fs.writeFileSync(
      path.resolve(moduleDir, 'definitions.ts'),
      `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
        { rpc, types: {} },
        {
          compact: false,
          depth: null,
          maxArrayLength: null,
        }
      )}`
    );

    defExports = `${defExports}export { default as ${moduleName} } from './${moduleName}/definitions'\n`;
  });

  fs.writeFileSync(path.resolve(definitionsDir, 'definitions.ts'), defExports);
}

/**
 * Autogenerate types and conversion utils which are too large to write manually
 */
function writeGenerated({ types }) {
  const instanbulIgnore = '/* istanbul ignore file */';
  let typesFile = `${instanbulIgnore}

`;
  let utilsFile = `${instanbulIgnore}

import { CountryCode as MeshCountryCode } from 'polymesh-types/types';

import { Context } from '~/internal';
import { CountryCode } from '~/types';

`;

  let countryCodeEnum = 'export enum CountryCode {';
  let countryCodeFunctions = `/**
 * @hidden
 */
export function countryCodeToMeshCountryCode(countryCode: CountryCode, context: Context): MeshCountryCode {
  return context.polymeshApi.createType('CountryCode', countryCode);
}

/**
 * @hidden
 */
export function meshCountryCodeToCountryCode(meshCountryCode: MeshCountryCode): CountryCode {`;

  const countryCodes = types.CountryCode._enum;
  countryCodes.forEach((code, index) => {
    const isLast = index === countryCodes.length - 1;
    const pascalCaseCode = upperFirst(toLower(code));

    countryCodeEnum = `${countryCodeEnum}\n  ${pascalCaseCode} = '${pascalCaseCode}',${
      isLast ? '\n}' : ''
    }`;

    const returnStatement = `return CountryCode.${pascalCaseCode}`;
    if (isLast) {
      countryCodeFunctions = `${countryCodeFunctions}\n  ${returnStatement};\n}`;
    } else {
      countryCodeFunctions = `${countryCodeFunctions}\n  if (meshCountryCode.is${pascalCaseCode}) {\n    ${returnStatement};\n  }\n`;
    }
  });

  typesFile = `${typesFile}${countryCodeEnum}\n`;
  utilsFile = `${utilsFile}${countryCodeFunctions}\n`;

  fs.writeFileSync(path.resolve(generatedDir, 'types.ts'), typesFile);
  fs.writeFileSync(path.resolve(generatedDir, 'utils.ts'), utilsFile);
}

https.get(`${urlPath}/polymesh_schema.json`, res => {
  const chunks = [];
  res.on('data', chunk => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const schema = Buffer.concat(chunks);
    const schemaObj = JSON.parse(schema);

    writeDefinitions(schemaObj);
    writeGenerated(schemaObj);
  });
});
