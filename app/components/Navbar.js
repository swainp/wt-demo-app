import React from 'react';
import { Link } from 'react-router-dom';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        blockNumber: 0,
        networkType: ''
      }
    }

    async componentWillMount(){
      const networkType = await web3.eth.net.getNetworkType();
      this.setState({
        blockNumber: (await web3.eth.getBlock('latest')).number,
        networkType: networkType.charAt(0).toUpperCase()+networkType.slice(1)+' Network'
      });
    }

    render() {
      return(
        <nav class='navbar navbar-expand-md navbar-dark fixed-top bg-dark'>
          <Link class='navbar-brand' to='/'>WT</Link>
          <button class='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarCollapse' aria-controls='navbarCollapse' aria-expanded='false' aria-label='Toggle navigation'>
            <span class='navbar-toggler-icon'></span>
          </button>
          <div class='collapse navbar-collapse' id='navbarCollapse'>
            <ul class='navbar-nav mr-auto'>
              <li class={window.location.pathname == '/wallet' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/wallet'>Wallet</Link>
              </li>
              <li class={window.location.pathname == '/hotel' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/hotel'>Hotel Manager</Link>
              </li>
              <li class={window.location.pathname == '/explorer' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/explorer'>Explorer</Link>
              </li>
            </ul>
            <ul class="navbar-nav ml-auto">
              <li class='nav-item pull-right'>
                <a class="nav-link">Block #{this.state.blockNumber} - {this.state.networkType}</a>
              </li>
              <li class={window.location.pathname == '/config' ? 'nav-item pull-right active' : 'nav-item pull-right'}>
                <Link class='nav-link config-icon' to='/config'><span class="fa fa-cog"></span></Link>
              </li>
            </ul>
            <form class='form-inline mt-2 mt-md-0'>
              <input class='form-control mr-sm-2' placeholder='Hotel or Unit address' aria-label='Search' type='text'/>
              <button class='btn btn-outline-success my-2 my-sm-0' type='submit'>Search</button>
            </form>
          </div>
        </nav>
      );
    }

}
