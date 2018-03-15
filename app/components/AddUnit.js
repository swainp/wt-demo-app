import React from 'react';

import Select from 'react-select';

export default class AddUnit extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="mb-0">{this.props.hotel.name}: Add room</h3>
            </div>
            <div className="col text-right">
              <button title="Cancel" type="button" className="btn btn-light" onClick={this.props.onBack}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); this.props.addUnit(this.state.password); }}>

            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                <div className="form-group">
                  <label>Room Type</label>
                  <Select
                    name="Room Types"
                    clearable={false}
                    value={this.props.unitType}
                    autoFocus="true"
                    placeholder="Double Room"
                    options={this.props.unitTypeOptions}
                    onChange={(e) => { this.props.onUnitTypeChange(e.value); }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                <div className="form-group">
                  <label>Your Wallet Password</label>
                  <div className="input-group">
                    <input
                      type={this.state.showPassword ? 'text' : 'password'}
                      className="form-control"
                      defaultValue={this.state.password}
                      required
                      onChange={(event) => {
                        this.setState({ password: event.target.value, addHotelUnitError: false });
                      }}
                    />
                    <span className="input-group-addon">
                      {this.state.showPassword
                        ? <span className="fa fa-eye" onClick={() => this.setState({ showPassword: false })}></span>
                        : <span className="fa fa-eye-slash" onClick={() => this.setState({ showPassword: true })}></span>
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <hr/>

            <button type="submit" className="btn btn-primary">Add Room</button>
            <button type="button" className="btn btn-link" onClick={this.props.onNewRoomType}>
                or Create a new room type
            </button>
          </form>
        </div>
      </div>
    );
  }
}
