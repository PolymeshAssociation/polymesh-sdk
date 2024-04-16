/* eslint-disable */

const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const versionRegex = /This release is compatible with Polymesh v(.*)/;

const getSupportedNodeVersion = () => {
  const constantsFile = fs.readFileSync(path.resolve('src', 'utils', 'constants.ts'), {
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

const supportedNodeVersion = getSupportedNodeVersion();

const supportedNodeVersionString = supportedNodeVersion
  .split('||')
  .map(version => version.trim())
  .join(', v');

replace.sync({
  files: 'README.md',
  from: versionRegex,
  to: createReplacementVersion(supportedNodeVersionString),
});
