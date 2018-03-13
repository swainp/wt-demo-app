import React from 'react';

export default class AddUnitType extends React.Component {
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
              <h3 className="mb-0">{this.props.hotel.name}: Add room type</h3>
            </div>
            <div className="col text-right">
              <button title="Cancel" type="button" className="btn btn-light" onClick={this.props.onBack}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); this.props.addUnitType(this.state.newUnitType, this.state.password); }}>

            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                <div className="form-group">
                  <label>New Room Type</label>
                  <input
                    type="text"
                    autoFocus="true"
                    className="form-control"
                    value={this.state.newUnitType}
                    onChange={event => this.setState({ newUnitType: event.target.value })}
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
                        this.setState({ password: event.target.value });
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

            <hr className="mb-md"/>
            <button type="submit" className="btn btn-primary">Add Room Type</button>
            {this.props.unitTypeOptions[0] &&
              <button type="button" className="btn btn-link" onClick={this.props.onEditUnitType}>
                or Edit an existing room type
              </button>}
          </form>
        </div>
      </div>
    );
  }
}
