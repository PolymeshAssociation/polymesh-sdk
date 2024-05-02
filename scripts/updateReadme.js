/* eslint-disable */

const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const versionRegex = /This release is compatible with Polymesh v(.*) and Polymesh Private .*/;
const ppVersionRegex = /This release is compatible with Polymesh v.* and Polymesh Private v(.*)/;

const getSupportedNodeVersion = path => {
  const constantsFile = fs.readFileSync(path, {
    encoding: 'utf8',
  });

  const regex = /export const SUPPORTED_NODE_VERSION_RANGE = '([^']+)';/g;

  const match = regex.exec(constantsFile);

  return match[1];
};

/**
 * Replace the version number in the README
 */
const createReplacementVersion = newVersion => (text, prevVersion) => {
  return text.replace(prevVersion, newVersion);
};

const supportedNodeVersionString = supportedNodeVersion =>
  supportedNodeVersion
    .split('||')
    .map(version => version.trim())
    .join(', v');

const {
  SUPPORTED_NODE_VERSION_RANGE: supportedNodeVersionForPolymesh,
} = require('@polymeshassociation/polymesh-sdk/utils/constants');

replace.sync({
  files: 'README.md',
  from: versionRegex,
  to: createReplacementVersion(supportedNodeVersionString(supportedNodeVersionForPolymesh)),
});

const supportedNodeVersionForPolymeshPrivate = getSupportedNodeVersion(
  path.resolve('src', 'utils', 'constants.ts')
);

replace.sync({
  files: 'README.md',
  from: ppVersionRegex,
  to: createReplacementVersion(supportedNodeVersionString(supportedNodeVersionForPolymeshPrivate)),
});
