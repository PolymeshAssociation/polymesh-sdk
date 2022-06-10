/* eslint-disable @typescript-eslint/naming-convention */
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');
/* eslint-enable @typescript-eslint/naming-convention */

const replace = require('replace-in-file');
const { NODE_URL, WS_PORT } = require('./consts');

const versionRegex = /This release is compatible with Polymesh v(\d+\.\d+\.\d+)/;

/**
 * Replace the version number in the README
 */
const createReplacementVersion = newVersion => (text, prevVersion) => {
  return text.replace(prevVersion, newVersion);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const wsp = new WebSocketAsPromised(`ws://${NODE_URL}:${WS_PORT}`, {
    createWebSocket: url => new W3CWebSocket(url),
    packMessage: data => JSON.stringify(data),
    unpackMessage: data => JSON.parse(data.toString()),
    attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
    extractRequestId: data => data && data.id,
  });

  await wsp.open();

  const { result: version } = await wsp.sendRequest({
    jsonrpc: '2.0',
    method: 'system_version',
    params: [],
  });

  replace.sync({
    files: 'README.md',
    from: versionRegex,
    to: createReplacementVersion(version),
  });

  process.exit(0);
})();
