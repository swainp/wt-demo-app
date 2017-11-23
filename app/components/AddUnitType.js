import React from 'react';

import Select from 'react-select';

export default class AddUnitType extends React.Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    render() {
      return(
        <form class="box" onSubmit={(e) => {e.preventDefault(); this.props.addUnitType(this.state.newUnitType, this.state.password)}}>
          <h3>
            Add Room Type
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={this.props.onBack}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{this.props.hotel.name}</h4>
          <hr></hr>
          <div class="form-group">
            <label>New Room Type</label>
            <input
              type="text"
              autoFocus="true"
              class="form-control"
              value={this.state.newUnitType}
              onChange={event => this.setState({ newUnitType: event.target.value })}
            />
            {this.props.unitTypeOptions[0] &&
            <button type="button" class="btn btn-link" onClick={this.props.onEditUnitType}>
              Or edit an existing room type
            </button>}
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
                  this.setState({ password: event.target.value });
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
          <button type="submit" class="btn btn-primary btn-block">Add Room Type</button>
        </form>
      );
    }

}
