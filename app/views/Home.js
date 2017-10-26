import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

export default class App extends React.Component {

    constructor() {
      super();
    }

    render() {
      var self = this;

      return(
        <div class="row justify-content-md-center">
          <div class="col-md-10">
            <div class="jumbotron">
              <h3>WindingTree Hotels Demo App</h3>
              <p class="lead">
                This is a demo app for the WT platform where you can:
              </p>
              <ul>
                <li>Send and receive ETH and Lif tokens with the WT Wallet.</li>
                <li>Create your hotel, manage it and upload inventory with the WT Hotel Manager</li>
                <li>See all the hotel inventory using WT Explorer.</li>
                <li>Book hotel rooms you see available in the WT Explorer using Lif tokens.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

}
