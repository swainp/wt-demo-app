import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import { web3provider, HotelManager, BookingData, User } from '../services/web3provider';
import config from '../services/config';

export default class MyBookings extends React.Component {
  constructor () {
    super();
    let keyStore = '';
    if (window.localStorage.wallet) {
      keyStore = JSON.parse(window.localStorage.wallet);
    }
    this.state = {
      indexAddress: '0x0000000000000000000000000000000000000000',
      hotels: [],
      hotelNames: [],
      bookingTxs: [],
      transaction: {},
      importKeystore: keyStore,
      section: 'hotels',
      hotelSection: 'list',
      hotelManager: {},
      loading: false,
    };
  }

  async componentWillMount () {
    if (this.state.importKeystore) {
      let address = (this.state.importKeystore ? this.state.importKeystore.address : '0x0000000000000000000000000000000000000000');
      let hotelManager = new HotelManager({
        indexAddress: window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address,
        owner: address,
        web3provider: web3provider,
        gasMargin: config.get('GAS_MARGIN'),
      });
      let bookingData = new BookingData({ web3provider: web3provider });
      let user = new User({
        account: address, // Client's account address
        gasMargin: config.get('GAS_MARGIN'),
        tokenAddress: window.localStorage.lifTokenAddress || config.get('LIFTOKEN_ADDRESS'), // LifToken contract address
        web3provider: web3provider,
      });
      await this.setState({ hotelManager: hotelManager, bookingData: bookingData, user: user });
      await this.loadTxs();
    }
  }

  async loadTxs () {
    var self = this;
    let network = await web3provider.web3.eth.net.getNetworkType();
    self.setState({ loading: true });
    let txs = await web3provider.data.getBookingTransactions(
      '0x' + self.state.importKeystore.address,
      (window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address),
      (window.localStorage.wtIndexBlock || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].block),
      network);
    console.log('got TXs');
    console.log(txs);
    self.setState({ bookingTxs: txs, loading: false });
  }

  render () {
    var self = this;

    return (
      <div className={'row justify-content-center ' + (self.state.loading ? 'loading' : '')}>
        <ToastContainer style={{ zIndex: 2000 }}/>
        <div className='col-sm-11'>
          <div className="row">
            <div className="col">
              <h1>My Bookings</h1>
              <p className="lead">View your booking history</p>
              <hr/>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Booking Transactions</h3>
            </div>
            <div className="card-body">
              {self.state.bookingTxs &&
                <div>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Hotel Name</th>
                        <th>Action</th>
                        <th>Unit</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {self.state.bookingTxs.map(function (tx, i) {
                        return (
                          <tr key={'tx' + i} className="pointer">
                            <td>{tx.hotelName}</td>
                            <td>{tx.method.name}</td>
                            <td>{tx.unitType + ' ' + tx.method.params.find(param => param.name === 'unitAddress').value.substring(2, 6)}</td>
                            <td>{moment(tx.fromDate).format('MMMM Do YYYY')}</td>
                            <td>{moment(tx.toDate).format('MMMM Do YYYY')}</td>
                            <td>{tx.status ? 'Approved' : 'Pending'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
            </div>
          </div>
        </div>
        <Modal
          isOpen={(self.state.importKeystore === '')}
          contentLabel='Modal'
          style={{
            overlay: {
              position: 'fixed',
              top: 50,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
            },
            content: {
              maxWidth: '350px',
              maxHeight: '200px',
              margin: 'auto',
              textAlign: 'center',
              border: '1px solid #ccc',
              background: '#fff',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '4px',
              outline: 'none',
              padding: '20px',
            },
          }}
        >
          <h3>You need to open a wallet to view bookings</h3>
          <Link class='btn btn-primary' to='/wallet'>Go to Wallet</Link>
        </Modal>
      </div>
    );
  }
}
