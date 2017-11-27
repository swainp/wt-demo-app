import React from 'react';

import Select from 'react-select';

import moment from 'moment';

export default class ViewBookings extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        hotel: Object.assign({}, props.hotel)
      }
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.hotel !== nextProps.hotel) {
        this.setState({ hotel: Object.assign({}, nextProps.hotel), image: {} });
      }
    }

    render() {
      let hotel = this.state.hotel;
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
          {this.props.bookings && hotel &&
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Hotel Name</th>
                <th>Room Type</th>
                <th>Room Name</th>
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
          </table>}
        </div>
      );
    }

}
