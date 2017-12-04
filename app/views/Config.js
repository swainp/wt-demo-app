import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

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
    }

    render() {
      var self = this;

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <div class="row justify-content-md-center">
            <div class="col-md-5">
               <div class="jumbotron text-center">
                <form key="editConfig" onSubmit={(e) => {e.preventDefault(); self.changeConfig()}}>
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
                  <input type="submit" class="btn btn-primary" value="Change Config" />
                </form>
              </div>
            </div>
          </div>
        </div>
      )
    }

}
