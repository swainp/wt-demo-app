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
        <div class="row justify-content-center">
          <div class="col-sm-10">

            <div className="page-header">
                <h1>WindingTree Hotels Demo App</h1>
                <p class="lead">This is a demo app for the WT platform</p>
              </div>
              <hr/>

              <h2 >What you'll be able to do</h2>

              <ul class="list-wt">
                <li><p>Send and receive ETH and Lif tokens with the WT Wallet.</p></li>
                <li><p>Create your hotel, manage it and upload inventory with the WT Hotel Manager</p></li>
                <li><p>See all the hotel inventory using WT Explorer.</p></li>
                <li><p>Book hotel rooms you see available in the WT Explorer using Lif tokens.</p></li>
              </ul>
          </div>
        </div>
      )
    }

}
