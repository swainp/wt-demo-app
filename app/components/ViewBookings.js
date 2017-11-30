import React from 'react';

import Select from 'react-select';

import moment from 'moment';

export default class ViewBookings extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        hotel: Object.assign({}, props.hotel),
        selectedRequest: {}
      }
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.hotel !== nextProps.hotel) {
        this.setState({ hotel: Object.assign({}, nextProps.hotel)});
      }
    }

    render() {
      let hotel = this.state.hotel;
      let self = this;
      return(
        <div class="box">
          <h2>Hotel Bookings</h2>
          <div class="form-group">
            <label>Choose a hotel</label>
            <Select
              name="Hotels"
              clearable={false}
              options={this.props.hotelOptions}
              value={hotel.address}
              onChange={(e) => { this.props.onHotelChange(e.value) }}
            />
          </div>
          <hr></hr>
          {hotel &&
          <div>
          {this.props.bookings &&
          <div>
            <h3>Completed Bookings</h3>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Room Type</th>
                  <th>Room ID</th>
                  <th>From Day</th>
                  <th>To Day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {this.props.bookings.map(function(booking, i){
                  let unitBooked = hotel.units[booking.unit]
                  if(unitBooked) {
                    return (
                      <tr key={'booking'+i} class="pointer" onClick={() => this.setState({transaction: booking.transactionHash})}>
                        <td>{hotel.name}</td>
                        <td>{unitBooked.unitType}</td>
                        <td>{booking.unit.substring(2,6)}</td>
                          <td>{moment(booking.fromDate).format('YYYY MM DD')}</td>
                          <td>{moment(booking.fromDate).add(booking.daysAmount, 'days').format('YYYY MM DD')}</td>
                        <td>Accepted</td>
                      </tr>
                    );
                  } else {
                    return (<tr></tr>);
                  }

                })}
              </tbody>
            </table>
          </div>}
          {this.props.bookingRequests &&
            <div>
              <h3>Booking Requests</h3>
              <div class='list-group'>
              {this.props.bookingRequests.map(function(request, i){
                return <p
                  key={'request'+i}
                  class={request.transactionHash == self.state.selectedRequest.transactionHash ?
                    'list-group-item list-group-item-action active' :
                    'list-group-item list-group-item-action'
                  }
                  onClick={() => {
                    self.setState({selectedRequest: request})
                  }}
                >
                  {request.id}
                </p>
              })}
              </div>
              {self.state.selectedRequest &&
              <form onSubmit={(e) => {e.preventDefault(); self.props.confirmBooking(self.state.selectedRequest, self.state.password)}}>
              <div class="form-group">
                <label>Your Wallet Password</label>
                <div class="input-group">
                  <input
                    type={self.state.showPassword ? "text" : "password"}
                    class="form-control"
                    defaultValue={self.state.password}
                    onChange={(event) => {
                      self.setState({ password: event.target.value });
                    }}
                  />
                  <span class="input-group-addon">
                    {self.state.showPassword ?
                      <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                    :
                      <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                    }
                  </span>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Approve Request</button>
              </form>}
            </div>
          }</div>}
        </div>
      );
    }

}
