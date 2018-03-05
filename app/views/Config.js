import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';

import config from '../services/config';

var wtIndexes = [];
const preconfiguredIndexes = config.get('WT_INDEXES');
for (var i = 0; i < preconfiguredIndexes.length; i++) {
  wtIndexes.push(preconfiguredIndexes[i]);
  wtIndexes[i].version = wtIndexes[i].version + ' - ' + wtIndexes[i].address;
  wtIndexes[i].value = wtIndexes[i].address;
}

export default class Config extends React.Component {
  constructor () {
    super();
    this.state = {
      web3Provider: window.localStorage.web3Provider || config.get('WEB3_PROVIDER'),
      wtIndexAddresses: window.localStorage.wtIndexAddress || wtIndexes[wtIndexes.length - 1].address,
      lifTokenAddress: window.localStorage.lifTokenAddress || config.get('LIFTOKEN_ADDRESS'),
    };
  }

  changeConfig () {
    window.localStorage.web3Provider = this.state.web3Provider;
    window.localStorage.wtIndexAddress = this.state.wtIndexAddress;
    window.localStorage.lifTokenAddress = this.state.lifTokenAddress;
    for (var i = 0; i < wtIndexes.length; i++) {
      if (this.state.wtIndexAddress === wtIndexes[i].address) {
        window.localStorage.wtIndexBlock = wtIndexes[wtIndexes.length - 1].block;
      }
    }
    toast.success('Configuration updated');
  }

  restoreDefault () {
    window.localStorage.web3Provider = config.get('WEB3_PROVIDER');
    window.localStorage.wtIndexAddress = wtIndexes[wtIndexes.length - 1].address;
    window.localStorage.wtIndexBlock = wtIndexes[wtIndexes.length - 1].block;
    window.localStorage.lifTokenAddress = config.get('LIFTOKEN_ADDRESS');
    this.setState({
      web3Provider: config.get('WEB3_PROVIDER'),
      wtIndexAddress: wtIndexes[wtIndexes.length - 1].address,
      lifTokenAddress: config.get('LIFTOKEN_ADDRESS'),
    });
    toast.success('Configuration restored to default');
  }

  render () {
    var self = this;

    return (
      <div className={self.state.loading ? 'loading' : ''}>
        <ToastContainer style={{ zIndex: 2000 }}/>
        <div className="row">
          <div className="col text-center">
            <h1 style={{ margin: 15 }}><small><b>App Settings</b></small></h1>
            <hr/>
          </div>
        </div>
        <div className="row justify-content-md-center">
          <div className="col-md-5">
            <div className="text-center">
              <form key="editConfig" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="form-group">
                  <label className="h5"><b>Web3 Provider</b></label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      autoFocus="true"
                      defaultValue={self.state.web3Provider}
                      onChange={(event) => self.setState({ web3Provider: event.target.value })}/>
                  </div>
                </div>

                <p className="h6"><b>Main Ethereum Network</b></p>
                <p>https://mainnet.infura.io/WKNyJ0kClh8Ao5LdmO7z</p>

                <p className="h6"><b>Test Ethereum Network (Ropsten)</b></p>
                <p>https://ropsten.infura.io/WKNyJ0kClh8Ao5LdmO7z</p>

                <hr/>

                <div className="form-group">
                  <label className="h5"><b>WT Index Address</b></label>
                  <Select
                    name="wtIndexes"
                    clearable={false}
                    options={wtIndexes}
                    onChange={ (val) => self.setState({ wtIndexAddress: val.value })}
                    value={self.state.wtIndexAddress || window.localStorage.wtIndexAddress}
                    labelKey="version"
                  />
                </div>
                <div className="form-group mb-xl">
                  <label className="h5"><b>LifToken Address</b></label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      autoFocus="true"
                      defaultValue={self.state.lifTokenAddress}
                      onChange={(event) => self.setState({ lifTokenAddress: event.target.value })}/>
                  </div>
                </div>
                <button className="btn btn-light" onClick={() => self.restoreDefault()}>
                    Restore Default
                </button>
                  &nbsp;&nbsp;
                <button className="btn btn-primary" onClick={() => self.changeConfig()}>
                    Change Config
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
