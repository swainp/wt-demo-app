# WT Demo App

## Install

```sh
git clone git@github.com:windingtree/wt-demo-app.git
cd wt-demo-app
npm install
```

## Run

In the terminal:

1. `npm run testrpc` or set env var `WEB3_PROVIDER` with the url of the ethereum network provider.
2. `npm start` and the app will start in port 8080.

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
