import Web3 from 'web3';

import config from './config';

// This is because main is set to node build
import web3providerFactory from '@windingtree/wt-js-libs/src/web3provider';

let web3Instance = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || config.get('WEB3_PROVIDER')));

export const web3provider = web3providerFactory.getInstance(web3Instance);
