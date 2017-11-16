import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

var BN = web3.utils.BN;

const LifABI = Utils.abis.LifToken;

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        lifTokenAddress: window.localStorage.lifTokenAddress || '0x0000000000000000000000000000000000000000',
        showPassword: false,
        walletKeystore: {},
        loading: false,
        walletSection: 'open',
        ethBalance: 0,
        lifBalance: 0,
        receiverAddress: '',
        sendAmount: 0,
        gasAmount: 21000,
        txData: '0x',
        currency: 'ETH',
        lifContract: {},
        networkId: 'kovan'
      }

    }

    async componentWillMount() {
      let lifContract = new web3.eth.Contract(LifABI, this.state.lifTokenAddress);
      if(web3.eth.accounts.wallet[0]) {
        this.setState({
          walletSection: 'show',
          walletKeystore: web3.eth.accounts.wallet[0],
          loading: false,
          networkId: await web3.eth.net.getNetworkType(),
          lifContract: lifContract
        }, () => { this.updateBalances()});
      } else if(window.localStorage.wallet) {
        this.setState({
          walletKeystore: JSON.parse(window.localStorage.wallet),
          networkId: await web3.eth.net.getNetworkType(),
          lifContract: lifContract
        });
      } else {
        this.setState({
          walletSection: 'create',
          networkId: await web3.eth.net.getNetworkType(),
          lifContract: lifContract
        });
      }
    }

    // Create a wallet without extra entropy and encrypt it with the password
    async createWallet(){
      var self = this;
      self.setState({loading: true});
      web3.eth.accounts.wallet.create(1);
      let wallet = web3.eth.accounts.wallet.encrypt(self.state.password)[0];
      window.localStorage.wallet = JSON.stringify(wallet);
      wallet = web3.eth.accounts.wallet.decrypt([wallet], self.state.password);
      self.setState({walletSection: 'show', walletKeystore: wallet[0], loading: false});
    }

    // Open an encrypted wallet and saved the encrypted wallet in state
    async openWallet(){
      var self = this;
      self.setState({loading: true, walletError: false});
      try {
        let wallet = web3.eth.accounts.wallet.decrypt([self.state.walletKeystore], self.state.password)
        this.setState({walletSection: 'show', walletKeystore: wallet[0], loading: false}, () => { self.updateBalances()});
      } catch(e) {
        console.log(e);
        self.setState({loading: false, walletError: true});
      }
    }

    // Update the ETH and Lif balances
    async updateBalances() {
      var self = this;
      self.setState({ethBalance: '...', lifBalance: '...', loading: true});

      self.setState({
        ethBalance: web3.utils.fromWei(
          await web3.eth.getBalance(self.state.walletKeystore.address),
          'ether'
        ),
        lifBalance: await this.getLifBalance(self.state.walletKeystore.address),
        loading: false
      })
    }

    async getLifBalance(addr) {
      var self = this;
      var balanceBN = new BN(web3.utils.toBN(
        await web3.eth.call({
          to: self.state.lifTokenAddress, // contract address
          data: self.state.lifContract.methods.balanceOf(self.state.walletKeystore.address).encodeABI()
        })
      ));
      return web3.utils.fromWei(balanceBN, 'ether').toString();
    }

    async sendTx() {
      var self = this;
      self.setState({loading: true});
      if(this.state.currency === 'ETH') {
        let txObject = {
          to: this.state.receiverAddress,
          value: web3.utils.toWei(this.state.sendAmount, 'ether'),
          gas: this.state.gasAmount,
          data: this.state.txData
        };
        let signedTx = await web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
          console.log('Send ETH tx receipt:', receipt);
          self.setState({loading: false});
          self.updateBalances();
        });
      } else if (this.state.currency === 'LIF') {
        let LifToken = new web3.eth.Contract(LifABI, this.state.lifTokenAddress);
        const lifWei = web3.utils.toWei(this.state.sendAmount, 'ether');
        let method = LifToken.methods.transfer(this.state.receiverAddress, lifWei);
        let callData = method.encodeABI();

        let txObject = {
          to: this.state.lifTokenAddress,
          gas: 52000,
          data: callData
        }
        let signedTx = await web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
          console.log('Send LIF tx receipt:', receipt);
          self.setState({loading: false});
          self.updateBalances();
        });
      }

    }

    render() {
      var self = this;

      var wallet =
        <div class="jumbotron">
          {(self.state.walletSection == 'create') ?
          <form key="createWalletForm" onSubmit={(e) => {e.preventDefault(); self.createWallet()}}>
            <h3>Create a new wallet</h3>
            <div class="form-group">
              <label>Wallet password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  autoFocus="true"
                  defaultValue={self.state.password}
                  required
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => self.setState({ password: event.target.value })}/>
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                  }
                </span>
              </div>

            </div>
            <input type="submit" class="btn btn-primary" value="Create my wallet" />
            <button class="btn btn-link" onClick={() => self.setState({walletSection: 'open'})}>Or open an existing wallet</button>
          </form>
          : (self.state.walletSection == 'open') ?
          <form key="OpenWalletForm" onSubmit={(e) => {e.preventDefault(); self.openWallet()}}>
            <h3>Open an existing wallet</h3>
            <div class="form-group">
              <label>Encrypted wallet</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  value={JSON.stringify(self.state.walletKeystore)}
                  defaultValue={JSON.stringify(self.state.walletKeystore)}
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => {
                    self.setState({ walletKeystore: event.target.value, walletError: false });
                  }}/>
                <span class="input-group-addon">
                  <a class="fa fa-download" style={{color:'#555'}} href={"data:application/json;base64,"+window.btoa(JSON.stringify(self.state.walletKeystore))} download="WT Keystore.json"></a>
                </span>
                <span class="input-group-addon" onClick={() => {
                  document.getElementById('inputFile').click();
                }}>
                  <span class="fa fa-upload"></span>
                  <input id="inputFile" class="file-upload" accept=".json" type="file" onChange={(event) => {
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                      return function(e) {
                        var base64 = reader.result;
                        var fileData = window.atob(base64.split(';base64,')[1]);
                        self.setState({
                          walletKeystore: JSON.parse(fileData)
                        });
                        window.localStorage.wallet = fileData;
                      };
                    })(event.target.files[0]);
                    if (event.target.files && event.target.files[0])
                      reader.readAsDataURL(event.target.files[0]);
                  }} />
                </span>
              </div>
              <span class="help-block">
                This is the encrypted wallet as saved into the browser keystore. In the real system, there will be different alternatives to help you manage your wallet
              </span>
            </div>
            <div class="form-group">
              <label>Wallet password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={self.state.password}
                  autoFocus="true"
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => {
                    self.setState({ password: event.target.value });
                  }}/>
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                  }
                </span>
              </div>
            </div>
            <input type="submit" class="btn btn-primary" value="Open wallet" />
            <button class="btn btn-link" onClick={() => self.setState({walletSection: 'create'})}>Or create a new wallet</button>
            {(self.state.walletError)
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error trying to open the wallet, is that the correct password?</p>
              : <div></div>}
          </form>
          :
          <div>
            <div class="row justify-content-around">
              <h2>Wallet <small><a href={"https://"+self.state.networkId+".etherscan.io/address/"+self.state.walletKeystore.address}>{self.state.walletKeystore.address}</a></small></h2>
            </div>
            <hr></hr>
            <div class="row justify-content-around">
              <h4>ETH Balance: {self.state.ethBalance}</h4>
              <h4>Lif Balance: {self.state.lifBalance}</h4>
              <button class="btn btn-primary" onClick={() => self.updateBalances()}>Update Balances <span class="fa fa-refresh"></span></button>
            </div>
            <hr></hr>
            <div class="row justify-content-around">
              <div class="col-md-6">
                <h3>Send ETH or LIF</h3>
                <form key="sendForm" onSubmit={(e) => {e.preventDefault(); self.sendTx()}}>
                  <div class="form-group">
                    <label>Currency:</label>
                    <div class="input-group">
                      <select class="form-control" defaultValue={self.state.currency} onChange={(event) => self.setState({ currency: event.target.value })}>
                        <option value="ETH">ETH</option>
                        <option value="LIF">LIF</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>To:</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.receiverAddress}
                        placeholder="Receiver Address"
                        onChange={(event) => self.setState({ receiverAddress: event.target.value })}/>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Amount:</label>
                    <div class="input-group">
                      <input
                        type="number"
                        step="any"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.sendAmount}
                        placeholder="Amount to send"
                        onChange={(event) => self.setState({ sendAmount: event.target.value })}/>
                      <span class="input-group-addon">{self.state.currency}</span>
                    </div>
                  </div>
                  {self.state.currency === 'ETH' &&
                  <div id="advanced">
                    <div class="form-group">
                      <label>Gas:</label>
                      <div class="input-group">
                        <input
                          type="number"
                          class="form-control"
                          autoFocus="true"
                          defaultValue={self.state.gasAmount}
                          placeholder="Amount of gas"
                          min="21000"
                          onChange={(event) => self.setState({ gasAmount: event.target.value })}/>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Data:</label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          autoFocus="true"
                          defaultValue={self.state.txData}
                          placeholder="Hex encoded data"
                          onChange={(event) => self.setState({ txData: event.target.value })}/>
                      </div>
                    </div>
                  </div>}
                  <input type="submit" class="btn btn-primary" value="Send" />
                </form>
              </div>
            </div>
          </div>
          }
        </div>

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div>{wallet}</div>
            </div>
          </div>
        </div>
      )
    }

}
