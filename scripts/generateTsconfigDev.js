/* eslint-disable */
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const configFile = path.resolve(__dirname, '../tsconfig.json');
const configDevFile = path.resolve(__dirname, '../tsconfig.dev.json');

rimraf.sync(configDevFile);

let rawdata = fs.readFileSync(configFile);
let tsConfigJson = JSON.parse(rawdata);

tsConfigJson.compilerOptions.rootDir = '.';

let tsConfigDev = JSON.stringify({
  compilerOptions: tsConfigJson.compilerOptions,
});

fs.writeFileSync(configDevFile, tsConfigDev);
