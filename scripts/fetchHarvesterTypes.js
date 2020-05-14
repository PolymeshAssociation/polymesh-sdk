/* eslint-disable */
const git = require('nodegit');
const path = require('path');
const rimraf = require('rimraf');
const { exec } = require('child_process');

const BRANCH = process.env.BRANCH;
const GITHUB_PROYECT = 'git@github.com:PolymathNetwork/tooling-gql.git';
const TOOLING_FOLDER = 'tooling-gql';
const OUTPUT_TYPES = path.resolve(__dirname, '../src/polkadot/harvester-types.ts');

const tooling = path.resolve(__dirname, TOOLING_FOLDER);
rimraf.sync(tooling);

git
  .Clone(GITHUB_PROYECT, tooling, {
    fetchOpts: {
      callbacks: {
        certificateCheck: () => 1,
        credentials: function(_, username) {
          return git.Cred.sshKeyFromAgent(username);
        },
      },
    },
  })
  .then(function() {
    if (BRANCH) {
      exec(`cd scripts/${TOOLING_FOLDER} && git checkout ${BRANCH}`);
    }
    exec(`cp scripts/${TOOLING_FOLDER}/src/generated/graphqlTypes.ts ${OUTPUT_TYPES}`);
    rimraf.sync(tooling);
  });
