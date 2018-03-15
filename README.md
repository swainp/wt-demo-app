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
