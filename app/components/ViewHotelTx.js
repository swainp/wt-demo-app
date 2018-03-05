import React from 'react';
import moment from 'moment';

export default class ViewHotelTx extends React.Component {
  constructor (props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount () {
    console.log('[ViewHotelTx] componentWillMount');
    this.props.loadTxs();
  }

  render () {
    let self = this;
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">Hotel Transactions</h3>
        </div>

        <div className="card-body">
          {self.props.hotelTxs &&
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
                  {self.props.hotelTxs.map(function (tx, i) {
                    let hotel = self.props.hotelOptions.find(hotel => hotel.value == tx.hotel);
                    return (
                      <tr key={'tx' + i} className="pointer">
                        <td>{hotel ? hotel.label : ''}</td>
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
