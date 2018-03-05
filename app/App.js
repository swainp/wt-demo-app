import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

// Views
import Layout from './Layout';
import Home from './views/Home';
import Wallet from './views/Wallet';
import Explorer from './views/Explorer';
import Hotel from './views/Hotel';
import Config from './views/Config';
import Search from './views/Search';
import MyBookings from './views/MyBookings';

import Tx from './components/Tx';
import { web3provider } from './services/web3provider';
import config from './services/config';

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      pendingTxHashes: [],
      txReceipts: [],
      latestTxHash: null,
      wallet: window.localStorage.wallet ? JSON.parse(window.localStorage.wallet) : null,
    };
  }

  transactionHashCallback (action) {
    return (hash) => {
      console.log('got hash', hash);
      toast.info('Sent Tx to ' + action);
      toast.info(<Tx hash={hash} />);
      web3provider.data.decodeTxInput(hash, (window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address), this.state.wallet.address)
        .then(decodedTx => {
          console.log('App.addPendingTx decodedTx', decodedTx);
          this.setState({
            pendingTxHashes: this.state.pendingTxHashes.concat([decodedTx]),
            latestTxHash: hash,
          }, () => { window.localStorage.pendingTxHashes = this.state.pendingTxHashes; });
        }).catch((err) => {
          console.log('Failed decoding tx input of ', hash, err);
        });
    };
  }

  receiptCallback (action) {
    return (receipt) => {
      console.log('got receipt', receipt);
      toast.success('Mined TX to ' + action);
      toast.success(<Tx hash={receipt.transactionHash} />);
      this.setState({
        pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash !== receipt.transactionHash),
        txReceipts: this.state.txReceipts.concat([receipt]),
      }, () => {
        window.localStorage.pendingTxHashes = this.state.pendingTxHashes;
        window.localStorage.txReceipts = this.state.txReceipts;
      });
    };
  }

  errorCallback (action) {
    return async (error) => {
      // if it's a "not mined within 50 blocks" error, perform a check
      if (error.toString().includes('Transaction was not mined within 50 blocks')) {
        let receipt = await web3provider.web3.eth.getTransactionReceipt(this.state.latestTxHash);
        console.log('double checking receipt', receipt);
        // it was in fact mined!
        if (receipt && receipt.blockNumber) {
          toast.success('Mined TX to ' + action);
          this.setState({
            pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash !== receipt.transactionHash),
            txReceipts: this.state.txReceipts.concat([receipt]),
          }, () => {
            window.localStorage.pendingTxHashes = this.state.pendingTxHashes;
            window.localStorage.txReceipts = this.state.txReceipts;
          });
          return;
        }
      }
      toast.error('Error in TX to ' + action);
      toast.error(error.toString());
      this.setState({
        pendingTxHashes: this.state.pendingTxHashes.filter(e => e.hash !== this.state.latestTxHash),
      }, () => { window.localStorage.pendingTxHashes = this.state.pendingTxHashes; });
    };
  }

  getCallbacks (action) {
    let self = this;
    return {
      receipt: self.receiptCallback(action).bind(self),
      transactionHash: self.transactionHashCallback(action).bind(self),
      error: self.errorCallback(action).bind(self),
    };
  }

  render () {
    console.log('App this.state.pendingTxHashes', this.state.pendingTxHashes);
    return (
      <HashRouter>
        <Layout pendingTxHashes={this.state.pendingTxHashes}>
          <ToastContainer style={{ zIndex: 2000 }}/>
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route path="/wallet" component={Wallet}></Route>
            <Route path="/explorer" render={() => <Explorer getCallbacks={this.getCallbacks.bind(this)}/>}></Route>
            <Route path="/mybookings" component={MyBookings}></Route>
            <Route path="/hotel" render={() => <Hotel getCallbacks={this.getCallbacks.bind(this)}/>}></Route>
            <Route path="/config" component={Config}></Route>
            <Route path="/search" component={Search}></Route>
          </Switch>
        </Layout>
      </HashRouter>
    );
  }
}
