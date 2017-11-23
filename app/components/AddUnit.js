import React from 'react';

import Select from 'react-select';

export default class AddUnit extends React.Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    render() {
      return(
        <form class="box" onSubmit={(e) => {e.preventDefault(); this.props.addUnit(this.state.password)}}>
          <h3>
            Add Room
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={this.props.onBack}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{this.props.hotel.name}</h4>
          <hr></hr>
          <div class="form-group">
            <label>Room Type</label>
            <Select
              name="Room Types"
              clearable={false}
              value={this.props.unitType}
              autoFocus="true"
              placeholder="Double Room"
              options={this.props.unitTypeOptions}
              onChange={(e) => { this.props.onUnitTypeChange(e.value) }}
            />
            <button type="button" class="btn btn-link" onClick={this.props.onNewRoomType}>
              Or create a new room type
            </button>
          </div>
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={this.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={this.state.password}
                required
                onChange={(event) => {
                  this.setState({ password: event.target.value, addHotelUnitError: false });
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
          <button type="submit" class="btn btn-primary btn-block">Add Room</button>
        </form>
      );
    }

}
