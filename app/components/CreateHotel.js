import React from 'react';

export default class CreateHotel extends React.Component {

    constructor(props) {
      super(props);
      this.state = { hotel: {} }
    }

    editHotelInfo(info) {
      this.setState({ hotel: Object.assign(this.state.hotel, info) });
    }

    render() {
      return(
        <form class="box" onSubmit={e => {e.preventDefault(); this.props.createHotel(this.state.hotel, this.state.password)}}>
          <h3>
            New Hotel
            <div class="pull-right">
              <input type="button" class="btn btn-link" onClick={this.props.onBack} value="Back to hotels" />
            </div>
          </h3>
          <div class="form-group">
            <label>Hotel Name</label>
            <input
              type="text"
              autoFocus="true"
              class="form-control"
              value={this.state.hotel.name || ''}
              onChange={e => this.editHotelInfo({name: e.target.value})}
            />
          </div>
          <div class="form-group">
            <label>Hotel Description</label>
            <input
              type="text"
              class="form-control"
              value={this.state.hotel.description}
              onChange={e => this.editHotelInfo({description: e.target.value})}
            />
          </div>
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={this.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={this.state.password}
                onChange={(event) => {
                  this.setState({ password: event.target.value, createHotelError: false });
                }}
              />
              <span class="input-group-addon">
                {this.state.showPassword ?
                  <span class="fa fa-eye" onClick={() => this.setState({showPassword: false})}></span>
                :
                  <span class="fa fa-eye-slash" onClick={() => this.setState({showPassword: true})}></span>
                }
              </span>
            </div>
          </div>
          <input type="submit" class="btn btn-primary btn-block" value="Create hotel" />
        </form>
      );
    }

}
