import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));

var wtIndexes = [];
for (var i = 0; i < WT_INDEXES.length; i++) {
  wtIndexes.push(WT_INDEXES[i]);
  wtIndexes[i].version = wtIndexes[i].version + " - " + wtIndexes[i].address;
  wtIndexes[i].value = wtIndexes[i].address;
}

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        web3Provider: window.localStorage.web3Provider || WEB3_PROVIDER,
        wtIndexAddresses: window.localStorage.wtIndexAddress || wtIndexes[wtIndexes.length-1].address,
        lifTokenAddress: window.localStorage.lifTokenAddress || LIFTOKEN_ADDRESS,
      }
    }

    changeConfig(){
      window.localStorage.web3Provider = this.state.web3Provider;
      window.localStorage.wtIndexAddress = this.state.wtIndexAddress;
      window.localStorage.lifTokenAddress = this.state.lifTokenAddress;
      for (var i = 0; i < wtIndexes.length; i++)
        if (this.state.wtIndexAddress == wtIndexes[i].address)
        window.localStorage.wtIndexBlock = wtIndexes[wtIndexes.length-1].block;
      toast.success('Configuration updated');
    }

    restoreDefault(){
      window.localStorage.web3Provider = WEB3_PROVIDER;
      window.localStorage.wtIndexAddress = wtIndexes[wtIndexes.length-1].address;
      window.localStorage.wtIndexBlock = wtIndexes[wtIndexes.length-1].block;
      window.localStorage.lifTokenAddress = LIFTOKEN_ADDRESS;
      this.setState({
        web3Provider: WEB3_PROVIDER,
        wtIndexAddress: wtIndexes[wtIndexes.length-1].address,
        lifTokenAddress: LIFTOKEN_ADDRESS,
      });
      toast.success('Configuration restored to default');
    }

    render() {
      var self = this;

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <ToastContainer style={{zIndex: 2000}}/>
          <div className="row">
            <div className="col text-center">
              <h1 style={{margin: 15}}><small><b>App Settings</b></small></h1>
              <hr/>
            </div>
          </div>
          <div class="row justify-content-md-center">
            <div class="col-md-5">
               <div class="text-center">
                <form key="editConfig" onSubmit={(e) => {e.preventDefault()}}>
                  <div class="form-group">
                    <label class="h5"><b>Web3 Provider</b></label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
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

                  <div class="form-group">
                    <label class="h5"><b>WT Index Address</b></label>
                    <Select
                      name="wtIndexes"
                      clearable={false}
                      options={wtIndexes}
                      onChange={ (val) =>  self.setState({ wtIndexAddress: val.value })}
                      value={self.state.wtIndexAddress}
                      labelKey="version"
                    />
                  </div>
                  <div class="form-group mb-xl">
                    <label class="h5"><b>LifToken Address</b></label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.lifTokenAddress}
                        onChange={(event) => self.setState({ lifTokenAddress: event.target.value })}/>
                    </div>
                  </div>
                  <button class="btn btn-light" onClick={() => self.restoreDefault()}>
                    Restore Default
                  </button>
                  &nbsp;&nbsp;
                  <button class="btn btn-primary" onClick={() => self.changeConfig()}>
                    Change Config
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
    }

}
