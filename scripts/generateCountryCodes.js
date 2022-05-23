/*
 * Author: Jeremías Díaz (monitz87)
 *
 * This script generates the `CountryCode` enum and the related conversion utility functions
 *   (`countryCodeToMeshCountryCode` and `meshCountryCodeToCountryCode`) from the chain metadata.
 *
 * NOTE: it is assumed that the metadata has been previously fetched by the `fetchMetadata.js` script, and stored
 *   in `metadata.json`
 */

/* eslint-disable */
const { Metadata } = require('@polkadot/types');
const { TypeRegistry } = require('@polkadot/types/create');
const fs = require('fs');
const path = require('path');
const { upperFirst, toLower, capitalize } = require('lodash');

const metadataFile = fs.readFileSync('metadata.json').toString('utf8');

const registry = new TypeRegistry();

const metadata = new Metadata(registry, JSON.parse(metadataFile).result);
const lookup = metadata.asLatest.lookup;

const countryCodes = lookup.types.find(({ type: { path } }) => {
  const typeName = path[2];
  return typeName && typeName.toString() === 'CountryCode';
}).type.def.asVariant.variants;

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

typesFile = `${typesFile}${countryCodeEnum}\n`;
utilsFile = `${utilsFile}${countryCodeFunctions}\n`;

const generatedDir = path.resolve('src', 'generated');

fs.writeFileSync(path.resolve(generatedDir, 'types.ts'), typesFile);
fs.writeFileSync(path.resolve(generatedDir, 'utils.ts'), utilsFile);
