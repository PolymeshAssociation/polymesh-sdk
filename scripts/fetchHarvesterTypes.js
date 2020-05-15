/* eslint-disable */
const git = require('nodegit');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs');

const BRANCH = process.argv[2];
const GITHUB_PROJECT = 'git@github.com:PolymathNetwork/tooling-gql.git';
const TOOLING_FOLDER = 'tooling-gql';
const OUTPUT_TYPES = path.resolve(__dirname, '../src/harvester/types.ts');

const tooling = path.resolve(__dirname, TOOLING_FOLDER);
rimraf.sync(tooling);

git
  .Clone(GITHUB_PROJECT, tooling, {
    fetchOpts: {
      callbacks: {
        certificateCheck: () => 1,
        credentials: function(_, username) {
          return git.Cred.sshKeyFromAgent(username);
        },
      },
    },
  })
  .then(async repository => {
    if (BRANCH) {
      const reference = await repository.getBranch(`refs/remotes/origin/${BRANCH}`);
      await repository.checkoutRef(reference);
    }

    fs.copyFile(
      path.resolve(__dirname, `../scripts/${TOOLING_FOLDER}/src/generated/graphqlTypes.ts`),
      OUTPUT_TYPES
    );

    rimraf.sync(tooling);
  });
