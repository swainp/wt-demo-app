import React from 'react';
import moment from 'moment';

import { web3provider } from '../services/web3provider';

export default class WalletTx extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hotelNames: {},
    };
  }

  componentWillMount () {
    this.props.loadTxs();
  }

  async getHotelInfo (hotelAddr) {
    var self = this;
    var hotelInstance = web3provider.contracts.getHotelInstance(hotelAddr);
    let hotelNames = self.state.hotelNames;
    hotelNames[hotelAddr] = await hotelInstance.methods.name().call();
    self.setState({ hotelNames: hotelNames });
  }

  render () {
    let self = this;
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">Transactions</h3>
        </div>
        <div className="card-body">
          {self.props.walletTxs &&
            <div>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>Action</th>
                    <th>Lif Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {self.props.walletTxs.map(function (tx, i) {
                    if (tx.hotel && !self.state.hotelNames[tx.hotel]) { self.getHotelInfo(tx.hotel); }
                    return (
                      <tr key={'tx' + i} className="pointer">
                        <td>{tx.hotel ? self.state.hotelNames[tx.hotel] : ''}</td>
                        <td>{tx.method.name}</td>
                        <td>{tx.lifAmount ? self.props.web3.utils.fromWei(tx.lifAmount, 'ether').toString() : ''}</td>
                        <td>{moment.unix(Number(tx.timeStamp)).format('YYYY MM DD h:mm A')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>}
        </div>
      </div>
    );
  }
}
