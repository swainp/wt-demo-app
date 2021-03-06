import React from 'react';
import Address from '../components/Address';
import Tx from '../components/Tx';
import WalletTx from '../components/WalletTx';
import { ToastContainer, toast } from 'react-toastify';
import superagent from 'superagent';

import { web3provider } from '../services/web3provider';
import config from '../services/config';
var LifABI = web3provider.contracts.abis.LifToken;

export default class Wallet extends React.Component {
  constructor () {
    super();
    this.state = {
      lifTokenAddress: window.localStorage.lifTokenAddress || config.get('LIFTOKEN_ADDRESS'),
      showPassword: false,
      walletKeystore: {},
      loading: false,
      walletSection: (window.localStorage.wallet && window.localStorage.wallet === '') ? 'create' : 'open',
      ethBalance: 0,
      lifBalance: 0,
      receiverAddress: '',
      sendAmount: 0,
      gasAmount: 21000,
      txData: '0x',
      currency: 'LIF',
      lifContract: {},
      networkId: 'ropsten',
    };
  }

  async componentWillMount () {
    // Add Lif Faucet method
    LifABI.push({
      'constant': false,
      'inputs': [],
      'name': 'faucetLif',
      'outputs': [],
      'payable': false,
      'type': 'function',
    });

    let lifContract = new web3provider.web3.eth.Contract(LifABI, this.state.lifTokenAddress);
    if (window.localStorage.wallet && window.localStorage.wallet !== '') {
      this.setState({
        walletKeystore: JSON.parse(window.localStorage.wallet),
        networkId: await web3provider.web3.eth.net.getNetworkType(),
        lifContract: lifContract,
      });
    } else {
      this.setState({
        networkId: await web3provider.web3.eth.net.getNetworkType(),
        lifContract: lifContract,
      });
    }
  }

  // Create a wallet without extra entropy and encrypt it with the password
  async createWallet () {
    var self = this;
    self.setState({ loading: true });
    web3provider.web3.eth.accounts.wallet.create(1);
    let wallet = web3provider.web3.eth.accounts.wallet.encrypt(self.state.password)[0];
    window.localStorage.wallet = JSON.stringify(wallet);
    window.localStorage.pendingTX = [];
    wallet = web3provider.web3.eth.accounts.wallet.decrypt([wallet], self.state.password);
    self.setState({ walletKeystore: wallet[0], loading: false });
  }

  // Open an encrypted wallet and saved the encrypted wallet in state
  async openWallet () {
    var self = this;
    self.setState({ loading: true, walletError: false });
    try {
      let wallet = web3provider.web3.eth.accounts.wallet.decrypt([self.state.walletKeystore], self.state.password);
      this.setState({ walletSection: 'show', walletKeystore: wallet[0], loading: false }, () => { self.updateBalances(); });
    } catch (e) {
      console.log(e);
      self.setState({ loading: false, walletError: true });
    }
  }

  async loadTxs () {
    var self = this;
    let network = await web3provider.web3.eth.net.getNetworkType();
    self.setState({ loading: true });
    let txs = await web3provider.data.getDecodedTransactions(
      self.state.walletKeystore.address,
      (window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address),
      (window.localStorage.wtIndexBlock || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].block),
      network);
    console.log('got TXs');
    console.log(txs);
    self.setState({ walletTxs: txs, loading: false });
  }

  // Update the ETH and Lif balances
  async updateBalances () {
    var self = this;
    self.setState({ ethBalance: '...', lifBalance: '...', loading: true });
    self.setState({
      ethBalance: web3provider.web3.utils.fromWei(
        await web3provider.web3.eth.getBalance(self.state.walletKeystore.address),
        'ether'
      ),
      lifBalance: await this.getLifBalance(self.state.walletKeystore.address),
      loading: false,
    });
  }

  async getLifBalance (addr) {
    var self = this;
    var rawBalance = await web3provider.web3.eth.call({
      to: self.state.lifTokenAddress, // contract address
      data: self.state.lifContract.methods.balanceOf(self.state.walletKeystore.address).encodeABI(),
    });
    return web3provider.web3.utils.fromWei(rawBalance, 'ether').toString();
  }

  async sendTx () {
    var self = this;
    self.setState({ loading: true });
    if (this.state.currency === 'ETH') {
      let txObject = {
        to: this.state.receiverAddress,
        value: web3provider.web3.utils.toWei(this.state.sendAmount, 'ether'),
        gas: this.state.gasAmount,
        data: this.state.txData,
        nonce: await web3provider.web3.eth.getTransactionCount(self.state.walletKeystore.address),
      };
      let signedTx = await web3provider.web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
      web3provider.web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
        console.log('Send ETH tx receipt:', receipt);
        self.setState({ loading: false });
        self.updateBalances();
      });
    } else if (this.state.currency === 'LIF') {
      let LifToken = new web3provider.web3.eth.Contract(LifABI, this.state.lifTokenAddress);
      const lifWei = web3provider.web3.utils.toWei(this.state.sendAmount, 'ether');
      let method = LifToken.methods.transfer(this.state.receiverAddress, lifWei);
      let callData = method.encodeABI();

      let txObject = {
        to: this.state.lifTokenAddress,
        gas: 52000,
        data: callData,
        nonce: await web3provider.web3.eth.getTransactionCount(self.state.walletKeystore.address),
      };
      let signedTx = await web3provider.web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
      web3provider.web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
        console.log('Send LIF tx receipt:', receipt);
        self.setState({ loading: false });
        self.updateBalances();
      });
    }
  }

  async claimFaucet () {
    var self = this;
    self.setState({ loading: true });
    let LifToken = new web3provider.web3.eth.Contract(LifABI, self.state.lifTokenAddress);
    let method = LifToken.methods.faucetLif();
    let callData = method.encodeABI();
    let txObject = {
      to: self.state.lifTokenAddress,
      gas: 100000,
      data: callData,
      nonce: await web3provider.web3.eth.getTransactionCount(self.state.walletKeystore.address),
    };
    let signedTx = await web3provider.web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
    web3provider.web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
      console.log('Claim Lif tx receipt:', receipt);
      self.setState({ loading: false });
      self.updateBalances();
    });
  }

  requestEth () {
    var self = this;
    self.setState({ loading: true });
    var data = this.state.walletKeystore.address;
    superagent.post('https://faucet.metamask.io/')
      .type('application/rawdata')
      .send(data)
      .end((err, resp) => {
        self.setState({ loading: false });
        if (err) {
          toast.error(err);
        } else {
          let responseWrapper =
          <div>Requested ETH! TX: <Tx hash={resp.text} web3={web3provider.web3}/></div>;
          toast.success(responseWrapper);
        }
      });
  }

  render () {
    var self = this;

    var wallet =
        <div>
          {(self.state.walletSection === 'create')
            ? <form key="createWalletForm" onSubmit={(e) => { e.preventDefault(); self.createWallet(); }}>
              <h1>Create a new wallet</h1>
              <p className="lead">Don't have a wallet? Create one now.</p>
              <hr/>
              <h4 className="mb-xl">
              In order to create a wallet you'll need to choose a password.
              </h4>
              <div className="form-group">
                <label><b>Wallet password</b></label>

                <div className="row">
                  <div className="col-lg-6">
                    <div className="input-group">
                      <input
                        autoComplete="off"
                        type={self.state.showPassword ? 'text' : 'password'}
                        className="form-control"
                        defaultValue={self.state.password}
                        required
                        placeholder="Enter your password here"
                        onChange={(event) => self.setState({ password: event.target.value })}/>
                      <span className="input-group-append input-group-text">
                        {self.state.showPassword
                          ? <span onClick={() => self.setState({ showPassword: false })}>
                            <span style={{ paddingRight: 6 }}>Show/Hide</span>
                            <span className="fa fa-eye"></span>
                          </span>
                          : <span onClick={() => self.setState({ showPassword: true })}>
                            <span style={{ paddingRight: 6 }}>Show/Hide</span>
                            <span className="fa fa-eye-slash"></span>
                          </span>
                        }
                      </span>
                    </div>

                    <p className="text-muted">
                      <small>The password will be used to encrypt and protect the data, use a strong one!</small>
                    </p>

                  </div>
                </div>
              </div>
              {self.state.walletKeystore.address
                ? <a className="btn btn-primary pointer"
                  href={'data:application/json;base64,' + window.btoa(window.localStorage.wallet)}
                  download={self.state.walletKeystore.address + '.json'}
                >
                Download Wallet <span className="fa fa-download"></span>
                </a>
                : <button type="submit" className="btn btn-primary pointer">Create my wallet</button>
              }
              <button className="btn btn-link" onClick={() => self.setState({ walletSection: 'open' })}>Or open an existing wallet</button>
            </form>
            : (self.state.walletSection === 'open')
              ? <form key="OpenWalletForm" onSubmit={(e) => { e.preventDefault(); self.openWallet(); }}>

                <h1>Open an existing wallet</h1>
                <p className="lead">Start by opening a wallet, you can use any wallets you have or create a new one.</p>
                <hr/>

                {/* <h4 className="mb-xl"> Please, enter the information to open you wallet. </h4> */}

                <div className="row">
                  <div className="col-lg-6">

                    {(self.state.walletError)
                      ? <div className="alert alert-danger" role="alert">
                    There was an error trying to open the wallet, is that the correct password?
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close"
                          onClick={() => self.setState({ walletError: false })}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      : null
                    }

                    <div className="form-group">
                      <label><b>Encrypted wallet</b></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={JSON.stringify(self.state.walletKeystore)}
                          defaultValue={JSON.stringify(self.state.walletKeystore)}
                          placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                          onChange={(event) => {
                            self.setState({ walletKeystore: event.target.value, walletError: false });
                          }}/>
                        <span className="input-group-append input-group-text pointer" onClick={() => {
                          document.getElementById('inputFile').click();
                        }}> <span style={{ paddingRight: 6 }}>Select File</span> <span className="fa fa-upload"> </span>
                          <input id="inputFile" className="file-upload" accept=".json" type="file" onChange={(event) => {
                            var reader = new FileReader();
                            reader.onload = (function (theFile) {
                              return function (e) {
                                var base64 = reader.result;
                                var fileData = window.atob(base64.split(';base64,')[1]);
                                self.setState({
                                  walletKeystore: JSON.parse(fileData),
                                });
                                window.localStorage.wallet = fileData;
                              };
                            })(event.target.files[0]);
                            if (event.target.files && event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); }
                          }} />
                        </span>
                      </div>
                      <p className="text-muted mb-lg" style={{ lineHeight: 1.2, paddingTop: 4 }}>
                        <small>
                          <em>This is the encrypted wallet as saved into the browser keystore. In the real system,
                        there will be different alternatives to help you manage your wallet</em>
                        </small>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group mb-xl">
                      <label><b>Wallet password</b></label>
                      <div className="input-group">
                        <input
                          autoComplete="off"
                          type={self.state.showPassword ? 'text' : 'password'}
                          className="form-control"
                          defaultValue={self.state.password}
                          onChange={(event) => {
                            self.setState({ password: event.target.value });
                          }}/>
                        <span className="input-group-append input-group-text">
                          {self.state.showPassword
                            ? <span onClick={() => self.setState({ showPassword: false })} style={{ cursor: 'pointer' }}>
                              <span style={{ paddingRight: 6 }}>Show/Hide</span>
                              <span className="fa fa-eye"></span>
                            </span>
                            : <span onClick={() => self.setState({ showPassword: true })} style={{ cursor: 'pointer' }}>
                              <span style={{ paddingRight: 6 }}>Show/Hide</span>
                              <span className="fa fa-eye-slash"></span>
                            </span>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <input type="submit" className="btn btn-primary" value="Open wallet" />
                <button className="btn btn-link" onClick={() => self.setState({ walletSection: 'create' })}>Or create a new wallet</button>

              </form>
              : (self.state.walletSection === 'show')
                ? <div>
                  <h1>Active Wallet</h1>
                  <p className="lead break-word">Address: <Address address={self.state.walletKeystore.address} web3={web3provider.web3}/></p>

                  <hr/>

                  <h2>Current Balances</h2>

                  <div className="row">
                    <div className="col">
                      <div className="card mb-sm">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-sm-12 col-md-9">
                              <div className="row">
                                <div className="col-sm-12 col-md-9 col-lg-6">
                                  <p className="mb-sm-3 mb-md-0 h5"><span className="d-block d-xl-inline">ETH Balance:</span> {self.state.ethBalance}</p>
                                </div>
                                <div className="col-sm-12 col-md-9 col-lg-6">
                                  <p className="mb-sm-3 mb-md-0 h5"><span className="d-block d-xl-inline">Lif Balance:</span> {self.state.lifBalance}</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3">
                              <button className="btn btn-primary btn-block" onClick={() => self.setState({ walletSection: 'send' })}><span className="fa fa-send"></span> Send</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-xl">
                    <div className="col">
                      <p>
                        <small>
                          <a tabIndex='4' onClick={() => self.requestEth()}>Claim ETH from Faucet</a>
                          <span className="text-muted">&nbsp; | &nbsp;</span>
                          <a tabIndex='5' onClick={() => self.claimFaucet(true)}>Claim Lif from Faucet</a>
                          <span className="text-muted">&nbsp; | &nbsp;</span>
                          <a tabIndex='5' onClick={() => self.updateBalances()}>Update Balances</a>
                        </small>
                      </p>
                    </div>
                  </div>

                  <div className="help-block text-muted mb-lg">
                    <p>
                Once you have ETH we reccomend you to request tokens first, you can have up to 50 tokens and 0.1 ETH, if you have less
                than that you can request more to the token contract.
                In case you have 0 ETH you will need to request more to faucet@windingtree.com.
                    </p>
                    <p>
                      <strong>The ETH and Lif tokens are for testing, they are issued over a testnet ethereum network.</strong>
                    </p>
                    <p>
                Make sure to always have ETH in your wallet because you will need it for everything, to transfer tokens, create hotels, edit them, make bookings, etc.
                This is because for every transaction that you want to execute you need to pay a small fee to the network that cant be charged in tokens, only in ETH, for now ;).
                    </p>
                  </div>

                  <br/>

                  {self.state.walletKeystore.address &&
              <p className="mb-xl">
                <a className="btn btn-light mb-lg"
                  href={'data:application/json;base64,' + window.btoa(window.localStorage.wallet)}
                  download={self.state.walletKeystore.address + '.json'}
                >
                  <span className="fa fa-download"></span> Download Wallet
                </a>
              </p>
                  }

                  <WalletTx
                    loadTxs={self.loadTxs.bind(self)}
                    walletTxs={self.state.walletTxs}
                    web3={web3provider.web3}
                  />

                </div>
                : <div>
                  <h1 style={{ paddingRight: 60 }}>Send ETH or LIF</h1>
                  <p className="lead break-word">Wallet Address: <Address address={self.state.walletKeystore.address} web3={web3provider.web3}/></p>

                  <button className="wt-btnClose" onClick={() => self.setState({ walletSection: 'show' })}>Back</button>

                  <hr/>

                  <h2 className="h3 mb-lg">
              Please fill out the form in order to make the transfer.
                  </h2>

                  <form key="sendForm" onSubmit={(e) => { e.preventDefault(); self.sendTx(); }}>

                    <div className="row">
                      <div className="col-lg-8">

                        <div className="form-group">
                          <label><b>Receiver Address:</b></label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={self.state.receiverAddress}
                              placeholder="0x..."
                              onChange={(event) => self.setState({ receiverAddress: event.target.value })}/>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label><b>Currency:</b></label>
                              <div className="input-group">
                                <select className="form-control" defaultValue={self.state.currency} onChange={(event) => self.setState({ currency: event.target.value })}>
                                  <option value="LIF">LIF</option>
                                  <option value="ETH">ETH</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="form-group">
                              <label><b>Amount:</b></label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  step="any"
                                  className="form-control"
                                  defaultValue={self.state.sendAmount}
                                  placeholder="Amount to send"
                                  onChange={(event) => self.setState({ sendAmount: event.target.value })}/>
                                <span className="input-group-append">{self.state.currency}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {self.state.currency === 'ETH' &&
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label><b>Gas:</b></label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              defaultValue={self.state.gasAmount}
                              placeholder="Amount of gas"
                              min="21000"
                              onChange={(event) => self.setState({ gasAmount: event.target.value })}/>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label><b>Data:</b></label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={self.state.txData}
                              placeholder="Hex encoded data"
                              onChange={(event) => self.setState({ txData: event.target.value })}/>
                          </div>
                        </div>
                      </div>
                    </div>
                        }

                        <br/>

                        <input type="submit" className="btn btn-primary" value="Make transfer" />
                        <button type="button" className="btn btn-link"
                          onClick={() => self.setState({ walletSection: 'show' })}
                        >or Cancel</button>

                      </div>
                    </div>

                  </form>
                </div>
          }
        </div>;

    return (
      <div className={self.state.loading ? 'loading' : ''}>
        <ToastContainer style={{ zIndex: 2000 }}/>
        <div className="row justify-content-center">
          <div className="col-sm-11">
            <div>{wallet}</div>
          </div>
        </div>
      </div>
    );
  }
}
