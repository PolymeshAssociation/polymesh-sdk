/*
 * This script generates the following :
 *   - the `TxTags`, `TxTag` and `ModuleName` consts
 *   - the `CountryCode` enum and the related conversion utility functions
 *     (`countryCodeToMeshCountryCode` and `meshCountryCodeToCountryCode`) from the chain metadata.
 *
 * NOTE: it is assumed that the metadata has been previously fetched by the `fetchMetadata.js` script, and stored
 *   in `metadata.json`
 */

/* eslint-disable */
const { Metadata } = require('@polkadot/types');
const { TypeRegistry } = require('@polkadot/types/create');
const { stringCamelCase, stringUpperFirst } = require('@polkadot/util');
const { capitalize, forEach } = require('lodash');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const metadataFile = fs.readFileSync('metadata.json').toString('utf8');

const registry = new TypeRegistry();
const metadata = new Metadata(registry, JSON.parse(metadataFile).result).asLatest;

const lookup = metadata.lookup;

const jsonPath = path.resolve('scripts', 'transactions.json');

const transactionData = JSON.parse(fs.readFileSync(jsonPath));

function assembleTxTags() {
  let namespaces = '';
  let moduleNameEnum = 'export enum ModuleName {';
  let modulePermissions = 'export type ModulePermissions =';
  let txTag = 'export type TxTag =';
  let txTags = 'export const TxTags = {\n';

  const modules = metadata.pallets;

  // add new calls to historic ones
  modules.forEach(({ name, calls }) => {
    const allCalls = calls.unwrapOr(null);
    const moduleName = name.toString();

    if (allCalls) {
      const moduleCalls = {};

      const items = lookup.getSiType(allCalls.type).def.asVariant.variants;

      // modules with no calls won't be included in transactions.json
      if (items.length) {
        items.forEach(({ name: cName }) => {
          const callName = cName.toString();
          moduleCalls[callName] = callName;
        });

        transactionData[moduleName] = { ...(transactionData[moduleName] || {}), ...moduleCalls };
      }
    }
  });

  forEach(transactionData, (calls, moduleName) => {
    const moduleNameCamelCase = stringCamelCase(moduleName);
    const moduleNamePascal = stringUpperFirst(moduleNameCamelCase);

    moduleNameEnum = moduleNameEnum.concat(`\n  ${moduleNamePascal} = '${moduleNameCamelCase}',`);
    modulePermissions = modulePermissions.concat(
      `\n  | { moduleName: ModuleName.${moduleNamePascal}; permissions: SectionPermissions<${moduleNamePascal}Tx> }`
    );
    txTag = txTag.concat(`\n  | ${moduleNamePascal}Tx`);
    txTags = txTags.concat(`  ${stringCamelCase(moduleName)}: ${moduleNamePascal}Tx,\n`);

    namespaces = namespaces.concat(`export enum ${moduleNamePascal}Tx {\n`);

    forEach(calls, callName => {
      const nameCamelCase = stringCamelCase(callName);
      const namePascal = stringUpperFirst(nameCamelCase);

      namespaces = namespaces.concat(
        `  ${namePascal} = '${moduleNameCamelCase}.${nameCamelCase}',\n`
      );
    });

    namespaces = namespaces.concat('}\n\n');
  });

  moduleNameEnum = moduleNameEnum.concat('\n}');
  modulePermissions = modulePermissions.concat(';');
  txTag = txTag.concat(';');
  txTags = txTags.concat('};');

  return namespaces.concat(`${moduleNameEnum}

${txTag}

// eslint-disable-next-line @typescript-eslint/naming-convention
${txTags}
`);
}

function assembleCountryCodes() {
  const countryCodes = lookup.types.find(({ type: { path } }) => {
    const typeName = path[2];
    return typeName && typeName.toString() === 'CountryCode';
  }).type.def.asVariant.variants;

  let countryCodeEnum = 'export enum CountryCode {';
  let countryCodeFunctions = `/**
  * @hidden
  */
  export function countryCodeToMeshCountryCode(countryCode: CountryCode, context: Context): PolymeshPrimitivesJurisdictionCountryCode {
    return context.createType('PolymeshPrimitivesJurisdictionCountryCode', countryCode);
  }

  /**
   * @hidden
   */
  export function meshCountryCodeToCountryCode(meshCountryCode: PolymeshPrimitivesJurisdictionCountryCode): CountryCode {`;

  countryCodes.forEach((code, index) => {
    const isLast = index === countryCodes.length - 1;
    const pascalCaseCode = capitalize(code.name.toString());

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

  return {
    countryCodeEnum,
    countryCodeFunctions,
  };
}

const { countryCodeEnum, countryCodeFunctions } = assembleCountryCodes(lookup);

const generatedTxTags = assembleTxTags(lookup, jsonPath);

const istanbulIgnore = '/* istanbul ignore file */';

const typesFile = `${istanbulIgnore}

${countryCodeEnum}

${generatedTxTags}`;

const utilsFile = `${istanbulIgnore}

import { PolymeshPrimitivesJurisdictionCountryCode } from '@polkadot/types/lookup';

import { Context } from '~/internal';
import { CountryCode } from '~/types';

${countryCodeFunctions}`;

const generatedDir = path.resolve('src', 'generated');

rimraf.sync(jsonPath);
fs.writeFileSync(jsonPath, `${JSON.stringify(transactionData, null, 2)}\n`);

fs.writeFileSync(path.resolve(generatedDir, 'types.ts'), typesFile);
fs.writeFileSync(path.resolve(generatedDir, 'utils.ts'), utilsFile);
