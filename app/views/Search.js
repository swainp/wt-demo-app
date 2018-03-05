import React, { Component } from 'react';

export default class Search extends Component {
  constructor () {
    super();
    this.state = {
      indexAddress: '0x0000000000000000000000000000000000000000',
      walletKeystore: JSON.parse(window.localStorage.wallet) || '',
      loading: false,
    };
  }
  render () {
    return (
      <div className="row justify-content-md-center">
        <div className="col-md-10">
          <div className="jumbotron">
            <h2>Search Results</h2>
          </div>
        </div>
      </div>
    );
  }
}
