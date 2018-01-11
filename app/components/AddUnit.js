import React from 'react';

import Select from 'react-select';

export default class AddUnit extends React.Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    render() {
      return(
        <div className="card">
          <div class="card-header">
            <div className="row align-items-center">
              <div class="col">
                <h3 class="mb-0">{this.props.hotel.name}: Add room</h3>
              </div>
              <div className="col text-right">
                <button title="Cancel" type="button" class="btn btn-light" onClick={this.props.onBack}>
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => {e.preventDefault(); this.props.addUnit(this.state.password)}}>

              <div class="row">
                <div class="col-sm-6">
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
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-6">
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
                </div>
              </div>

              <hr/>

              <button type="submit" class="btn btn-primary">Add Room</button>
              <button type="button" class="btn btn-link" onClick={this.props.onNewRoomType}>
                or Create a new room type
              </button>
            </form>
          </div>
        </div>
      );
    }

}
