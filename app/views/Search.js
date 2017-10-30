import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3PROVIDER));

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        walletKeystore: JSON.parse(window.localStorage.wallet) || '',
        loading: false
      }
    }
    render() {
      var self = this;

      return(
        <div class="row justify-content-md-center">
          <div class="col-md-10">
            <div class="jumbotron">
              <h2>Search Results</h2>
            </div>
          </div>
        </div>
      )
    }

}
