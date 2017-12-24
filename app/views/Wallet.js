import React from 'react';
import {Link} from 'react-router';
import ReactModal from 'react-modal';
import Address from '../components/Address';
import Tx from '../components/Tx';
import { ToastContainer, toast } from 'react-toastify';
import superagent from 'superagent';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

var BN = web3.utils.BN;

var LifABI = Utils.abis.LifToken;

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        lifTokenAddress: window.localStorage.lifTokenAddress || LIFTOKEN_ADDRESS,
        showPassword: false,
        walletKeystore: {},
        loading: false,
        walletSection: (window.localStorage.wallet && window.localStorage.wallet == '') ? 'create' : 'open',
        ethBalance: 0,
        lifBalance: 0,
        receiverAddress: '',
        sendAmount: 0,
        gasAmount: 21000,
        txData: '0x',
        currency: 'ETH',
        lifContract: {},
        networkId: 'ropsten'
      }
    }

    async componentWillMount() {

      // Add Lif Faucet method
      LifABI.push({
        "constant": false,
        "inputs": [],
        "name": "faucetLif",
        "outputs": [],
        "payable": false,
        "type": "function"
      });

      let lifContract = new web3.eth.Contract(LifABI, this.state.lifTokenAddress);
      if (window.localStorage.wallet && window.localStorage.wallet != '') {
        this.setState({
          walletKeystore: JSON.parse(window.localStorage.wallet),
          networkId: await web3.eth.net.getNetworkType(),
          lifContract: lifContract
        });
      } else {
        this.setState({
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
      self.setState({walletKeystore: wallet[0], loading: false});
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
          data: this.state.txData,
          nonce: await web3.eth.getTransactionCount(self.state.walletKeystore.address)
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
          data: callData,
          nonce: await web3.eth.getTransactionCount(self.state.walletKeystore.address)
        }
        let signedTx = await web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
          console.log('Send LIF tx receipt:', receipt);
          self.setState({loading: false});
          self.updateBalances();
        });
      }
    }

    async claimFaucet() {
      var self = this;
      self.setState({loading: true});
      let LifToken = new web3.eth.Contract(LifABI, self.state.lifTokenAddress);
      let method = LifToken.methods.faucetLif();
      let callData = method.encodeABI();
      let txObject = {
        to: self.state.lifTokenAddress,
        gas: 100000,
        data: callData,
        nonce: await web3.eth.getTransactionCount(self.state.walletKeystore.address)
      }
      let signedTx = await web3.eth.accounts.signTransaction(txObject, this.state.walletKeystore.privateKey);
      web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', (receipt) => {
        console.log('Claim Lif tx receipt:', receipt);
        self.setState({loading: false});
        self.updateBalances();
      });
    }

    requestEth(){
      var self = this;
      self.setState({loading: true});
      var data = this.state.walletKeystore.address
      superagent.post('https://faucet.metamask.io/')
      .type('application/rawdata')
      .send(data)
      .end((err, resp) => {
        self.setState({loading: false});
        if (err) {
          toast.error(err);
        } else {
          let responseWrapper =
          <div>Requested ETH! TX: <Tx hash={resp.text} web3={web3}/></div>
          toast.success(responseWrapper);
        }
      })
    }

    render() {
      var self = this;

      var wallet =
        <div>
          {(self.state.walletSection == 'create') ?
          <form key="createWalletForm" onSubmit={(e) => {e.preventDefault(); self.createWallet()}}>
            <h1>Create a new wallet</h1>
            <p className="lead">Don't have a wallet yet? Create one now.</p>
            <hr/>
            <div class="form-group">
              <label class="h4">Wallet password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  autoFocus="true"
                  defaultValue={self.state.password}
                  required
                  placeholder="Enter your password here"
                  onChange={(event) => self.setState({ password: event.target.value })}/>
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span onClick={() => self.setState({showPassword: false})}>
                      <span style={{paddingRight: 6}}>Show/Hide</span>
                      <span class="fa fa-eye"></span>
                    </span>
                  :
                    <span onClick={() => self.setState({showPassword: true})}>
                      <span style={{paddingRight: 6}}>Show/Hide</span>
                      <span class="fa fa-eye-slash"></span>
                    </span>
                  }
                </span>
              </div>
              <p class="text-muted"><small><em>— This password will be used to encrypt your new wallet. Use a strong one!</em></small></p>
            </div>
            {self.state.walletKeystore.address ?
              <a class="btn btn-primary pointer"
                href={"data:application/json;base64,"+window.btoa(window.localStorage.wallet)}
                download={self.state.walletKeystore.address+".json"}
              >
                Download Wallet <span class="fa fa-download"></span>
              </a>
            : <button type="submit" class="btn btn-primary pointer">Create my wallet</button>
            }
            <button class="btn btn-link" onClick={() => self.setState({walletSection: 'open'})}>Or open an existing wallet</button>
          </form>
          : (self.state.walletSection == 'open') ?
          <form key="OpenWalletForm" onSubmit={(e) => {e.preventDefault(); self.openWallet()}}>

            <h1>Open an existing wallet</h1>
            <p className="lead">Start by adding a wallet. You can use any wallets you have or create a new one.</p>
            <hr/>

            {(self.state.walletError) ?
              <div class="alert alert-danger" role="alert">
                There was an error trying to open the wallet, is that the correct password?
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"
                  onClick={()=> self.setState({walletError: false})}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
              </div>
              : null
            }

            <div class="form-group">
              <label class="h4">Encrypted wallet</label>
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
                <span class="input-group-addon pointer" onClick={() => {
                  document.getElementById('inputFile').click();
                }}> <span style={{paddingRight: 6}}>Select File</span> <span class="fa fa-upload"> </span>
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
              <p class="text-muted">
                <small>
                  <em>— This is the encrypted wallet as saved into the browser keystore. In the real system,
                    there will be different alternatives to help you manage your wallet</em>
                </small>
              </p>
            </div>

            <div class="form-group mb-xl">
              <label class="h4">Wallet password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={self.state.password}
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => {
                    self.setState({ password: event.target.value });
                  }}/>
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span onClick={() => self.setState({showPassword: false})} style={{cursor: 'pointer'}}>
                      <span style={{paddingRight: 6}}>Show/Hide</span>
                      <span class="fa fa-eye"></span>
                    </span>
                  :
                    <span onClick={() => self.setState({showPassword: true})} style={{cursor: 'pointer'}}>
                      <span style={{paddingRight: 6}}>Show/Hide</span>
                      <span class="fa fa-eye-slash"></span>
                    </span>
                  }
                </span>
              </div>
            </div>

            <input type="submit" class="btn btn-primary" value="Open wallet" />
            <button class="btn btn-link" onClick={() => self.setState({walletSection: 'create'})}>Or create a new wallet</button>


          </form>
          : (self.state.walletSection == 'show') ?
          <div>
            <div class="row justify-content-around address-row">
              <h2>Wallet <small><Address address={self.state.walletKeystore.address} web3={web3}/></small></h2>
            </div>
            <hr></hr>
            <div class="row justify-content-around">
              <h4>ETH Balance: {self.state.ethBalance}</h4>
              <h4>Lif Balance: {self.state.lifBalance}</h4>
              <button class="btn btn-info" onClick={() => self.updateBalances()}>Update Balances <span class="fa fa-refresh"></span></button>
              <button class="btn btn-primary" onClick={() => self.setState({walletSection: 'send'})}> Send <span class="fa fa-send"></span></button>
            </div>
            <br></br>
            <div class="row justify-content-around">
              <button class="btn btn-primary" onClick={() => self.requestEth()}>Claim ETH from Faucet</button>
            </div>
            <br></br>
            <span class="help-block">
              Once you have ETH we reccomend you to request tokens first, you can have up to 50 tokens and 0.1 ETH, if you have less
              than that you can request more to the token contract.
              In case you have 0 ETH you will need to request more to faucet@windingtree.com.
            </span>
            <br></br>
            <span class="help-block">
              <strong>The ETH and Lif tokens are for testing, they are issued over a testnet ethereum network.</strong>
            </span>
            <br></br>
            <span class="help-block">
              Make sure to always have ETH in your wallet because you will need it for everything, to transfer tokens, create hotels, edit them, make bookings, etc.
              This is because for every transaction that you want to execute you need to pay a small fee to the network that cant be charged in tokens, only in ETH, for now ;).
            </span>
          </div>
          :
          <div>
            <div class="row justify-content-around address-row">
              <h2>Wallet <small><Address address={self.state.walletKeystore.address} web3={web3}/></small></h2>
            </div>
            <hr></hr>
            <div class="row justify-content-around">
              <div class="col-md-6">
                <h3>Send ETH or LIF <button class="btn btn-primary pull-right" onClick={() => self.setState({walletSection: 'show'})}><span class="fa fa-arrow-left"></span> Back</button></h3>
                <form key="sendForm" onSubmit={(e) => {e.preventDefault(); self.sendTx()}}>
                  <div class="form-group">
                    <label><b>Currency:</b></label>
                    <div class="input-group">
                      <select class="form-control" defaultValue={self.state.currency} onChange={(event) => self.setState({ currency: event.target.value })}>
                        <option value="ETH">ETH</option>
                        <option value="LIF">LIF</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label><b>To:</b></label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        defaultValue={self.state.receiverAddress}
                        placeholder="Receiver Address"
                        onChange={(event) => self.setState({ receiverAddress: event.target.value })}/>
                    </div>
                  </div>
                  <div class="form-group">
                    <label><b>Amount:</b></label>
                    <div class="input-group">
                      <input
                        type="number"
                        step="any"
                        class="form-control"
                        defaultValue={self.state.sendAmount}
                        placeholder="Amount to send"
                        onChange={(event) => self.setState({ sendAmount: event.target.value })}/>
                      <span class="input-group-addon">{self.state.currency}</span>
                    </div>
                  </div>
                  {self.state.currency === 'ETH' &&
                  <div id="advanced">
                    <div class="form-group">
                      <label><b>Gas:</b></label>
                      <div class="input-group">
                        <input
                          type="number"
                          class="form-control"
                          defaultValue={self.state.gasAmount}
                          placeholder="Amount of gas"
                          min="21000"
                          onChange={(event) => self.setState({ gasAmount: event.target.value })}/>
                      </div>
                    </div>
                    <div class="form-group">
                      <label><b>Data:</b></label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          defaultValue={self.state.txData}
                          placeholder="Hex encoded data"
                          onChange={(event) => self.setState({ txData: event.target.value })}/>
                      </div>
                    </div>
                  </div>}
                  <div class="row justify-content-around">
                    <input type="submit" class="btn btn-primary" value="Send" />
                  </div>
                </form>
              </div>
            </div>
          </div>
          }
        </div>

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class="row justify-content-center">
            <div class="col-sm-10">
              <div>{wallet}</div>
            </div>
          </div>
        </div>
      )
    }

}
