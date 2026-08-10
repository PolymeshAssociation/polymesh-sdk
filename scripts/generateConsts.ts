/*
 * This script generates the `CountryCode` enum's conversion utility functions
 *   (`countryCodeToMeshCountryCode` and `meshCountryCodeToCountryCode`).
 *
 * NOTE: `CountryCode`, along with `TxTags`, `TxTag` and `ModuleName`, is consumed from
 *   `@polymeshassociation/polymesh-types`, which is generated from the chain metadata. Nothing here
 *   reads a local metadata file.
 */

/* eslint-disable */
import { CountryCode } from '@polymeshassociation/polymesh-types/generated/types';
import fs from 'fs';
import path from 'path';

function assembleCountryCodes() {
  const countryCodes = Object.values(CountryCode);

  let countryCodeFunctions = `/**
 * @hidden
 */
export function countryCodeToMeshCountryCode(
  countryCode: CountryCode,
  context: Context
): PolymeshPrimitivesJurisdictionCountryCode {
  return context.createType('PolymeshPrimitivesJurisdictionCountryCode', countryCode);
}

/**
 * @hidden
 */
// the generated body is one branch per CountryCode, which trips \`max-lines-per-function\` and
// \`complexity\`. There is nothing to refactor - it is a flat lookup - so disable the rules here
// eslint-disable-next-line
export function meshCountryCodeToCountryCode(
  meshCountryCode: PolymeshPrimitivesJurisdictionCountryCode
): CountryCode {`;

  countryCodes.forEach((code, index) => {
    const isLast = index === countryCodes.length - 1;

    const returnStatement = `return CountryCode.${code}`;
    if (isLast) {
      countryCodeFunctions = `${countryCodeFunctions}\n  ${returnStatement};\n}`;
    } else {
      countryCodeFunctions = `${countryCodeFunctions}\n  if (meshCountryCode.is${code}) {\n    ${returnStatement};\n  }\n`;
    }
  });

  countryCodeFunctions = `${countryCodeFunctions}\n`;

  return {
    countryCodeFunctions,
  };
}

const { countryCodeFunctions } = assembleCountryCodes();

const istanbulIgnore = '/* istanbul ignore file */';

const utilsFile = `${istanbulIgnore}

import { PolymeshPrimitivesJurisdictionCountryCode } from '@polkadot/types/lookup';

import { Context } from '~/internal';
import { CountryCode } from '~/types';

${countryCodeFunctions}`;

const generatedDir = path.resolve('src', 'generated');

fs.writeFileSync(path.resolve(generatedDir, 'utils.ts'), utilsFile);
