#!/bin/bash

DEV_ENV_DIR="/tmp/polymesh-dev-env"
INTEGRATION_DIR="$DEV_ENV_DIR/tests"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SDK_DIR="$SCRIPT_DIR/.."
COMPOSE_ENV="../envs/latest"

echo "cloning the repository"
git clone https://github.com/PolymeshAssociation/polymesh-dev-env.git "$DEV_ENV_DIR"

# register a cleanup function to keep the env clean
function cleanup() {
    echo "cleaning up test environment"

    cd "$INTEGRATION_DIR"
    yarn test:stop

    cd "$SDK_DIR/dist"
    rm -rf "$DEV_ENV_DIR"
}
trap cleanup EXIT

cd "$SDK_DIR"

# Install SDK packages and link it
yarn
yarn build:ts

cp package.json dist/package.json

# Link the built version
cd dist
yarn link

cd "$INTEGRATION_DIR"
git switch set-error # TODO remove

# Link the built SDK version
echo "Linking built SDK version"
yarn link "@polymeshassociation/polymesh-sdk"

# Install integration test packages
echo "Installing dependencies"
yarn install --force

# Run the tests and capture the exit code
echo "Running tests"
yarn test
