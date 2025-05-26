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
import { CountryCode } from '@polymeshassociation/polymesh-types/generated/types';
import fs from 'fs';
import path from 'path';

function assembleCountryCodes() {
  const countryCodes = Object.values(CountryCode);

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

    const returnStatement = `return CountryCode.${code}`;
    if (isLast) {
      countryCodeFunctions = `${countryCodeFunctions}\n  ${returnStatement};\n}`;
    } else {
      countryCodeFunctions = `${countryCodeFunctions}\n  if (meshCountryCode.is${code}) {\n    ${returnStatement};\n  }\n`;
    }
  });

  return {
    countryCodeFunctions,
  };
}

const { countryCodeFunctions } = assembleCountryCodes();

const istanbulIgnore = '/* istanbul ignore file */';

const utilsFile = `${istanbulIgnore}

import { PolymeshPrimitivesJurisdictionCountryCode } from '@polkadot/types/lookup';
import { CountryCode } from '@polymeshassociation/polymesh-types/generated/types';

import { Context } from '~/internal';

${countryCodeFunctions}`;

const generatedDir = path.resolve('src', 'generated');

fs.writeFileSync(path.resolve(generatedDir, 'utils.ts'), utilsFile);
