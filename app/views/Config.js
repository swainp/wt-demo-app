import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";
import { ToastContainer, toast } from 'react-toastify';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        web3Provider: window.localStorage.web3Provider || WEB3_PROVIDER,
        wtIndexAddress: window.localStorage.wtIndexAddress || WTINDEX_ADDRESS,
        lifTokenAddress: window.localStorage.lifTokenAddress || LIFTOKEN_ADDRESS,
      }
    }

    changeConfig(){
      window.localStorage.web3Provider = this.state.web3Provider;
      window.localStorage.wtIndexAddress = this.state.wtIndexAddress;
      window.localStorage.lifTokenAddress = this.state.lifTokenAddress;
      toast.success('Configuration updated');
    }

    restoreDefault(){
      window.localStorage.web3Provider = WEB3_PROVIDER;
      window.localStorage.wtIndexAddress = WTINDEX_ADDRESS;
      window.localStorage.lifTokenAddress = LIFTOKEN_ADDRESS;
      this.setState({
        web3Provider: WEB3_PROVIDER,
        wtIndexAddress: WTINDEX_ADDRESS,
        lifTokenAddress: LIFTOKEN_ADDRESS,
      });
      toast.success('Configuration restored to default');
    }

    render() {
      var self = this;

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class="row justify-content-md-center">
            <div class="col-md-5">
               <div class="jumbotron text-center">
                <form key="editConfig" onSubmit={(e) => {e.preventDefault()}}>
                  <div class="form-group">
                    <label>Web3 Provider</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.web3Provider}
                        onChange={(event) => self.setState({ web3Provider: event.target.value })}/>
                    </div>
                  </div>
                  <p>
                  Main Ethereum Network<br></br>
                  <small>https://mainnet.infura.io/WKNyJ0kClh8Ao5LdmO7z</small>
                  <br></br>
                  Test Ethereum Network (Ropsten)<br></br>
                  <small>https://ropsten.infura.io/WKNyJ0kClh8Ao5LdmO7z</small>
                  </p>
                  <div class="form-group">
                    <label>WT Index Address</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.wtIndexAddress}
                        onChange={(event) => self.setState({ wtIndexAddress: event.target.value })}/>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>LifToken Address</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        autoFocus="true"
                        defaultValue={self.state.lifTokenAddress}
                        onChange={(event) => self.setState({ lifTokenAddress: event.target.value })}/>
                    </div>
                  </div>
                  <button class="btn btn-primary" onClick={() => self.changeConfig()}>
                    Change Config
                  </button>
                  <br></br><br></br>
                  <button class="btn btn-info" onClick={() => self.restoreDefault()}>
                    Restore Default
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
    }

}
