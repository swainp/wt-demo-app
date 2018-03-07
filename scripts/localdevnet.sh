#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
  # Kill the npm instance that we started (if we started one and if it's still running).
  if [ -n "$npm_pid" ] && ps -p $npm_pid > /dev/null; then
    kill -9 $npm_pid
  fi  
}

testrpc_port=8545
testrpc_running() {
  nc -z localhost "$testrpc_port"
}

start_testrpc() {
  # We define owner of the network and hotel manager wallet account
  local accounts=(
    --account="0xe8280389ca1303a2712a874707fdd5d8ae0437fab9918f845d26fd9919af5a92,10000000000000000000000000000000000000000000000000000000000000000000000000000000"
    --account="0x4259ac86777aa87b3e24006fe6bc98a9c726c3618b18541716a8acc1a7161fa2,10000000000000000000000000000000000000000000000000000000000000000000000000000000"
  )

  node_modules/.bin/testrpc  --gasLimit 0xfffffffffff "${accounts[@]}" &
  testrpc_pid=$!
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting our own testrpc instance"
  start_testrpc
fi

# Migrate
./node_modules/.bin/truffle migrate --network development
# Fire up the application
npm run start-client &
npm_pid=$!
# And let testrpc running
wait $testrpc_id