import React from 'react';
import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      tokenAddress: '0x0000000000000000000000000000000000000000',
      showPassword: false,
      walleyKeystore: {},
      authSection: 'open',
      ethBalance: 0,
      lifBalance: 0,
    };
  }

  // Create a wallet without extra entropy and encrypt it with the password
  async createWallet () {
    var self = this;
    self.setState({ loading: true });
    web3.eth.accounts.wallet.create(1);
    let wallet = web3.eth.accounts.wallet.encrypt(self.state.password)[0];
    self.setState({ authSection: 'show', walleyKeystore: wallet, loading: false });
  }

  // Open an encrypted wallet and saved the encrypted wallet in state
  async openWallet () {
    var self = this;
    self.setState({ loading: true, walletError: false });
    try {
      web3.eth.accounts.wallet.decrypt([self.state.walleyKeystore], self.state.password);
      self.setState({ authSection: 'show', walleyKeystore: self.state.walleyKeystore, loading: false });
      self.updateBalances();
    } catch (e) {
      console.log(e);
      self.setState({ loading: false, walletError: true });
    }
  }

  async updateBalances () {
    var self = this;
    self.setState({
      ethBalance: web3.utils.fromWei(
        await web3.eth.getBalance(self.state.walleyKeystore.address),
        'ether'
      ),
    });
  }

  render () {
    var self = this;
    return (
      <div className="jumbotron">
        {(self.state.authSection === 'create')
          ? <form key="createWalletForm" onSubmit={(e) => { e.preventDefault(); self.createWallet(); }}>
            <h3>Create a new wallet</h3>
            <div className="form-group">
              <label>Wallet password</label>
              <div className="input-group">
                <input
                  type={self.state.showPassword ? 'text' : 'password'}
                  className="form-control"
                  autoFocus="true"
                  defaultValue={self.state.password}
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => self.setState({ password: event.target.value })}/>
                <span className="input-group-addon">
                  {self.state.showPassword
                    ? <span className="fa fa-eye" onClick={() => self.setState({ showPassword: false })}></span>
                    : <span className="fa fa-eye-slash" onClick={() => self.setState({ showPassword: true })}></span>
                  }
                </span>
              </div>

            </div>
            <input type="submit" className="btn btn-primary" value="Create my wallet" />
            <button className="btn btn-link" onClick={() => self.setState({ authSection: 'open' })}>Or open an existing wallet</button>
          </form>
          : <form key="OpenWalletForm" onSubmit={(e) => { e.preventDefault(); self.openWallet(); }}>
            <h3>Open an existing wallet</h3>
            <div className="form-group">
              <label>Encrypted wallet</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={JSON.stringify(self.state.walleyKeystore)}
                  defaultValue={JSON.stringify(self.state.walleyKeystore)}
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => {
                    self.setState({ walleyKeystore: event.target.value, walletError: false });
                  }}/>
                <span className="input-group-addon">
                  <a className="fa fa-download" style={{ color: '#555' }} href={'data:application/json;base64,' + window.btoa(JSON.stringify(self.state.walleyKeystore))} download="WT Keystore.json"></a>
                </span>
                <span className="input-group-addon" onClick={() => {
                  document.getElementById('inputFile').click();
                }}>
                  <span className="fa fa-upload"></span>
                  <input id="inputFile" className="file-upload" accept=".json" type="file" onChange={(event) => {
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                      return function (e) {
                        var base64 = reader.result;
                        var fileData = window.atob(base64.split(';base64,')[1]);
                        self.setState({
                          walleyKeystore: JSON.parse(fileData),
                        });
                      };
                    })(event.target.files[0]);
                    if (event.target.files && event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); }
                  }} />
                </span>
              </div>
              <span className="help-block">
                This is the encrypted wallet as saved into the browser keystore. In the real system, there will be different alternatives to help you manage your wallet
              </span>
            </div>
            <div className="form-group">
              <label>Wallet password</label>
              <div className="input-group">
                <input
                  type={self.state.showPassword ? 'text' : 'password'}
                  className="form-control"
                  defaultValue={self.state.password}
                  autoFocus="true"
                  placeholder="This password will be used to encrypt your new wallet. Use a strong one!"
                  onChange={(event) => {
                    self.setState({ password: event.target.value });
                  }}/>
                <span className="input-group-addon">
                  {self.state.showPassword
                    ? <span className="fa fa-eye" onClick={() => self.setState({ showPassword: false })}></span>
                    : <span className="fa fa-eye-slash" onClick={() => self.setState({ showPassword: true })}></span>
                  }
                </span>
              </div>
            </div>
            <input type="submit" className="btn btn-primary" value="Open wallet" />
            <button className="btn btn-link" onClick={() => self.setState({ authSection: 'create' })}>Or create a new wallet</button>
            {(self.state.walletError)
              ? <p className="bg-danger" style={{ padding: '10px', marginTop: '5px' }}>There was an error trying to open the wallet, is that the correct password?</p>
              : <div></div>}
          </form>
        }
      </div>
    );
  }
}
