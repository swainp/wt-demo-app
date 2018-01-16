import React from 'react';

import Select from 'react-select';

export default class AddUnitType extends React.Component {

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
                <h3 class="mb-0">{this.props.hotel.name}: Add room type</h3>
              </div>
              <div className="col text-right">
                <button title="Cancel" type="button" class="btn btn-light" onClick={this.props.onBack}>
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => {e.preventDefault(); this.props.addUnitType(this.state.newUnitType, this.state.password)}}>

              <div className="row">
                <div className="col-sm-12 col-md-9 col-lg-6">
                  <div class="form-group">
                    <label>New Room Type</label>
                    <input
                      type="text"
                      autoFocus="true"
                      class="form-control"
                      value={this.state.newUnitType}
                      onChange={event => this.setState({ newUnitType: event.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-12 col-md-9 col-lg-6">
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
                </div>
              </div>

              <hr class="mb-md"/>
              <button type="submit" class="btn btn-primary">Add Room Type</button>
              {this.props.unitTypeOptions[0] &&
              <button type="button" class="btn btn-link" onClick={this.props.onEditUnitType}>
                or Edit an existing room type
              </button>}
            </form>
          </div>
        </div>
      );
    }

}
