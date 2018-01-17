import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        blockNumber: 0,
        networkType: '',
        logoutModal: false,
        wallet: window.localStorage.wallet ? JSON.parse(window.localStorage.wallet) : null,
        dropdownOpen: false,
        navBarOpen: false
      }
    }

    async componentWillMount(){
      const networkType = await web3.eth.net.getNetworkType();
      this.setState({
        blockNumber: (await web3.eth.getBlock('latest')).number,
        networkType: networkType.charAt(0).toUpperCase()+networkType.slice(1)+' Network'
      });
    }

    logout(){
      window.localStorage.wallet = "";
      window.location.replace(window.location.origin+'/');
      window.location.reload();
    }

    toggle() {
      this.setState({
        dropdownOpen: !this.state.dropdownOpen
      });
    }

    render() {
      var self = this;
      var navBarOpen = self.state.navBarOpen;
      var pendingTxs = this.props.pendingTxHashes;

      return(
        <nav class='navbar navbar-light navbar-expand-md fixed-top navbar-main'>
          <Link class='navbar-brand' to='/'><strong>WT</strong></Link>

          <div id="app-nav">
            <ul class='navbar-nav mr-auto'>
              <li class={window.location.pathname == '/wallet' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/wallet'>
                  <i class="material-icons">account_balance_wallet</i><span>Wallet</span>
                </Link>
              </li>
              <li class={window.location.pathname == '/hotel' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/hotel'>
                  <i class="material-icons">business</i><span>Hotel Manager</span>
                </Link>
              </li>
              <li class={window.location.pathname == '/explorer' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/explorer'>
                  <i class="material-icons">search</i><span>Explorer</span>
                </Link>
              </li>
              <li class={window.location.pathname == '/mybookings' ? 'nav-item active' : 'nav-item'}>
                <Link class='nav-link' to='/mybookings'>
                  <i class="material-icons">hotel</i><span>My Bookings</span>
                </Link>
              </li>
            </ul>
          </div>

          <button
            type='button'
            class='navbar-toggler d-block d-lg-none'
            data-toggle='collapse'
            data-target='#navbarCollapse'
            aria-controls='navbarCollapse'
            aria-expanded='false'
            aria-label='Toggle navigation'
            onClick={()=> self.setState({navBarOpen: (!navBarOpen ? true : false)})}
          >
            <span class='navbar-toggler-icon'></span>
          </button>

          <div id="collapseWrapper" class={!navBarOpen ? 'd-none d-lg-flex' : 'd-block d-lg-flex'}>
            <div class={'d-block d-lg-flex navbar-collapse ' + (!navBarOpen ? 'collapse' : '')} id='navbarCollapse'>
              {/* Pending transactions */}
              <ul class="navbar-nav ml-auto">
                <li class="nav-item pull-right">
                  <ButtonDropdown style={{position: 'relative', top: 3, marginRight: 10}} isOpen={this.state.dropdownOpen} toggle={this.toggle.bind(this)}>
                    <DropdownToggle caret disabled={pendingTxs.length == 0}>
                      <span style={{fontSize: 15}}>Pending TXs: {pendingTxs.length}</span>
                    </DropdownToggle>
                    <DropdownMenu>
                    {pendingTxs.map(function(tx, i){
                        return <DropdownItem key={i}>{tx.method.name}</DropdownItem>;
                    })}
                    </DropdownMenu>
                  </ButtonDropdown>
                </li>
                <li class='nav-item pull-right'>
                  <span style={{fontSize: 18, lineHeight: '18px'}} class="nav-link text-success">Block #{self.state.blockNumber} <br/> <small style={{fontSize: 14}}>{self.state.networkType}</small></span>
                </li>
                <li class={window.location.pathname == '/config' ? 'nav-item pull-right active' : 'nav-item pull-right'}>
                  <Link class='nav-link config-icon' to='/config'>
                    <span class="fa fa-cog"></span>{' '}
                    <span className="d-inline d-lg-none"> Settings</span>
                  </Link>
                </li>
              </ul>

              {self.state.wallet &&
                <form class='form-inline mt-2 mt-md-0'>
                  <button class='logout-button btn btn-light my-2 my-sm-0' type='button'
                    onClick={() => self.setState({logoutModal:true})}
                  >Logout</button>
                </form>
              }

            </div>
          </div>

          {self.state.wallet &&
            <Modal
              isOpen={self.state.logoutModal}
              onRequestClose={() => self.setState({logoutModal:false})}
              contentLabel='Modal'
              style={{
                overlay : {
                  position          : 'fixed',
                  top               : 50,
                  left              : 0,
                  right             : 0,
                  bottom            : 0,
                  backgroundColor   : 'rgba(255, 255, 255, 0.75)'
                },
                content : {
                  maxWidth                   : '350px',
                  maxHeight                  : '300px',
                  margin                     : 'auto',
                  textAlign                  : 'center',
                  border                     : '1px solid #ccc',
                  background                 : '#fff',
                  overflow                   : 'auto',
                  WebkitOverflowScrolling    : 'touch',
                  borderRadius               : '4px',
                  outline                    : 'none',
                  padding                    : '20px'
                }
              }}
            >
              <h3>Are you sure?</h3>
              <small>Your account will be removed from the browser, be sure to have it in your device.</small>
              <a class="btn btn-primary pointer"
                href={"data:application/json;base64,"+window.btoa(JSON.stringify(self.state.wallet))}
                download={self.state.wallet.address+".json"}
              >
                Download Wallet <span class="fa fa-download"></span>
              </a>
              <br></br>
              <button class='btn btn-danger top-margin' onClick={() => self.logout()}>Close Wallet</button>
              <br></br>
              <button class='btn btn-info top-margin' onClick={() => self.setState({logoutModal:false})}>Cancel</button>
            </Modal>
          }
        </nav>
      );
    }

}
