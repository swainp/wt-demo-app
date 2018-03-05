import React from 'react';

export default class Home extends React.Component {
  render () {
    return (
      <div className="row justify-content-center">
        <div className="col-sm-11">

          <div className="page-header">
            <h1><b className="main-header">Hotels App</b> <small className="text-muted">by WindingTree </small></h1>
            <p className="lead">This app is demo of our platform</p>
            <div className="alert alert-warning" role="alert">
                  This app is a <strong>proof of concept</strong> and still work in progress, it runs over a testnet network, all the ETH and Lif tokens are just for testing porpuses.
            </div>
          </div>
          <hr/>

          <h2 >What you'll be able to do</h2>

          <ul className="list-wt">
            <li><p>Send and receive ETH and Lif tokens with the WT Wallet.</p></li>
            <li><p>Create your hotel, manage it and upload inventory with the WT Hotel Manager</p></li>
            <li><p>See all the hotel inventory using WT Explorer.</p></li>
            <li><p>Book hotel rooms you see available in the WT Explorer using Lif tokens.</p></li>
          </ul>
        </div>
      </div>
    );
  }
}
