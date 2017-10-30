import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

const LifABI = [{"constant": true, "inputs": [], "name": "mintingFinished", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"} ], "name": "approve", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"} ], "name": "transferFrom", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "DECIMALS", "outputs": [{"name": "", "type": "uint256"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_to", "type": "address"}, {"name": "_amount", "type": "uint256"} ], "name": "mint", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_value", "type": "uint256"} ], "name": "burn", "outputs": [], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "paused", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_subtractedValue", "type": "uint256"} ], "name": "decreaseApproval", "outputs": [{"name": "success", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "spender", "type": "address"}, {"name": "value", "type": "uint256"}, {"name": "data", "type": "bytes"} ], "name": "approveData", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": true, "inputs": [{"name": "_owner", "type": "address"} ], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [], "name": "finishMinting", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "owner", "outputs": [{"name": "", "type": "address"} ], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "NAME", "outputs": [{"name": "", "type": "string"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"} ], "name": "transfer", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "to", "type": "address"}, {"name": "value", "type": "uint256"}, {"name": "data", "type": "bytes"} ], "name": "transferData", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_addedValue", "type": "uint256"} ], "name": "increaseApproval", "outputs": [{"name": "success", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": true, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"} ], "name": "allowance", "outputs": [{"name": "remaining", "type": "uint256"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "value", "type": "uint256"}, {"name": "data", "type": "bytes"} ], "name": "transferDataFrom", "outputs": [{"name": "", "type": "bool"} ], "payable": false, "type": "function"}, {"constant": false, "inputs": [{"name": "newOwner", "type": "address"} ], "name": "transferOwnership", "outputs": [], "payable": false, "type": "function"}, {"constant": true, "inputs": [], "name": "SYMBOL", "outputs": [{"name": "", "type": "string"} ], "payable": false, "type": "function"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "burner", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"} ], "name": "Burn", "type": "event"}, {"anonymous": false, "inputs": [], "name": "Pause", "type": "event"}, {"anonymous": false, "inputs": [], "name": "Unpause", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "to", "type": "address"}, {"indexed": false, "name": "amount", "type": "uint256"} ], "name": "Mint", "type": "event"}, {"anonymous": false, "inputs": [], "name": "MintFinished", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "previousOwner", "type": "address"}, {"indexed": true, "name": "newOwner", "type": "address"} ], "name": "OwnershipTransferred", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {"indexed": true, "name": "spender", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"} ], "name": "Approval", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "from", "type": "address"}, {"indexed": true, "name": "to", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"} ], "name": "Transfer", "type": "event"} ];
export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        lifTokenAddress: window.localStorage.lifTokenAddress || '0x0000000000000000000000000000000000000000',
        showPassword: false,
        walletKeystore: JSON.parse(window.localStorage.wallet) || {},
        loading: false,
        walletSection: 'open',
        ethBalance: 0,
        lifBalance: 0,
        receiverAddress: '',
        sendAmount: 0,
        gasAmount: 21000,
        txData: '0x',
        currency: 'ETH'
      }

    }

    // Create a wallet without extra entropy and encrypt it with the password
    async createWallet(){
      var self = this;
      self.setState({loading: true});
      web3.eth.accounts.wallet.create(1);
      let wallet = web3.eth.accounts.wallet.encrypt(self.state.password)[0];
      window.localStorage.wallet = JSON.stringify(wallet);
      self.setState({walletSection: 'show', walletKeystore: wallet, loading: false});
    }

    // Open an encrypted wallet and saved the encrypted wallet in state
    async openWallet(){
      var self = this;
      self.setState({loading: true, walletError: false});
      try {
        let wallet = web3.eth.accounts.wallet.decrypt([self.state.walletKeystore], self.state.password)
        console.log('openWallet wallet:');
        console.log(wallet);
        self.setState({walletSection: 'show', walletKeystore: self.state.walletKeystore, loading: false});
        self.updateBalances();
      } catch(e) {
        console.log(e);
        self.setState({loading: false, walletError: true});
      }
    }

    // Update the ETH and Lif balances
    async updateBalances() {
      var self = this;

      let lifContract = new web3.eth.Contract(LifABI, self.state.lifTokenAddress);

      self.setState({
        ethBalance: web3.utils.fromWei(
          await web3.eth.getBalance(self.state.walletKeystore.address),
          'ether'
        ),
        lifBalance: web3.utils.hexToNumber(
          await web3.eth.call({
            to: self.state.lifTokenAddress, // contract address
            data: lifContract.methods.balanceOf(self.state.walletKeystore.address).encodeABI()
          })
        )
      })
    }

    async sendTx() {
      console.log('called sendEth');
      if(this.state.currency === 'ETH') {
        let txObject = {
          to: this.state.receiverAddress,
          value: web3.utils.toWei(this.state.sendAmount, 'ether'),
          gas: this.state.gasAmount,
          data: this.state.txData
        };
        let signedTx = await web3.eth.accounts.signTransaction(txObject, web3.eth.accounts.wallet.decrypt([this.state.walletKeystore], this.state.password)[0].privateKey);
        console.log(signedTx);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', console.log);
      } else if (this.state.currency === 'LIF') {
        let LifToken = new web3.eth.Contract(LifABI, this.state.lifTokenAddress);
        let method = LifToken.methods.transfer(this.state.receiverAddress, this.state.sendAmount);
        let callData = method.encodeABI();

        let txObject = {
          to: this.state.lifTokenAddress,
          gas: 52000,
          data: callData
        }
        let signedTx = await web3.eth.accounts.signTransaction(txObject, web3.eth.accounts.wallet.decrypt([this.state.walletKeystore], this.state.password)[0].privateKey);
        console.log(signedTx);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', console.log);
      }

    }

    async sendLif() {
      console.log('called sendLif');
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
              <h2>Wallet <small>0x{self.state.walletKeystore.address}</small></h2>
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
