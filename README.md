# WT Demo App

## Install

```sh
git clone git@github.com:windingtree/wt-demo-app.git
cd wt-demo-app
npm install
```

## Run against an empty local testrpc

This is great for UI development, because everything runs locally.

1. `npm start` will fire up `testrpc`, run migration of required contracts and start `webpack-dev-server`
1. Access the application on `localhost:8080` in your browser, you will not see anything for now
1. Open up `localdevnet-wallet.json` on the wallet screen. Password is `windingtree`.
1. After submitting the password, you should see a wallet screen. Click on **Claim Lif from Faucet**.
1. You should gain 50 Lif and should be able to operate as a *Hotel Manager*.

**!!!DO NOT USE THIS WALLET ON ANY OTHER NETWORK!!!**

## Run against any other network

We provide a sample WT network instance on Ropsten network. For that to run, just type `npm run start-client`

1. Set env var `WEB3_PROVIDER` with the url of the ethereum network provider.
1. Set env var `LIFTOKEN_ADDRESS` with the address of your `LifToken` contract. Demo app uses a LifToken flavor with faucet.
1. Set env var `WT_INDEXES` with the configuration of available `WTIndex` contracts like `[{"version": "0.1.0","address":"deployAddress","block": "deployBlock"}]`
1. If you'd like to see what is necessary to deploy the whole network, check the `migrations` folder.
1. `npm start-client` and the app will start in port 8080.

## Run via Docker (optional)

If you run `docker-machine` and it runs on port `192.168.99.100` you don't have to change anything.

Just spin up the demo container by running:

```sh
docker-compose run --service-ports --entrypoint /bin/sh demo
```

There you can install all the dependencies:

```sh
apk add -t .gyp --no-cache git python g++ make bash
cd /app
npm install --production; npm link;
```

Compile solidity contracts and run the server:

```sh
truffle compile
npm start -- --host 0.0.0.0 --public $DOCKER_HOST:8080
```

If you run your docker host on a different IP, figure it and pass the proper env variables:

```sh
docker-compose run -e 'DOCKER_HOST=1.1.1.1' -e 'RPC_HOST=1.1.1.1' --entrypoint /bin/sh demo
```
