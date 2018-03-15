import React from 'react';

export default class CreateHotel extends React.Component {
  constructor (props) {
    super(props);
    this.state = { hotel: {} };
  }

  editHotelInfo (info) {
    this.setState({ hotel: Object.assign(this.state.hotel, info) });
  }

  render () {
    return (
      <form className="card" onSubmit={e => { e.preventDefault(); this.props.createHotel(this.state.hotel, this.state.password); }}>

        <div className="card-header">
          <div className="row align-items-center">
            <div className="col"><h3 className="mb-0">New Hotel</h3></div>
            <div className="col text-right">
              <button type="button" className="btn btn-link" onClick={this.props.onBack}>
                  Back to hotels
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <h4>Please provide the following information to create the hotel.</h4>
          <div className="row">
            <div className="col-sm-12 col-md-9 col-lg-6">
              <div className="form-group">
                <label><b>Hotel Name</b></label>
                <input
                  type="text"
                  autoFocus="true"
                  className="form-control"
                  value={this.state.hotel.name || ''}
                  onChange={e => this.editHotelInfo({ name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label><b>Hotel Description</b></label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.hotel.description}
                  onChange={e => this.editHotelInfo({ description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label><b>Your Wallet Password</b></label>
                <div className="input-group">
                  <input
                    type={this.state.showPassword ? 'text' : 'password'}
                    className="form-control"
                    defaultValue={this.state.password}
                    onChange={(event) => {
                      this.setState({ password: event.target.value, createHotelError: false });
                    }}
                  />
                  <span className="input-group-append input-group-text">
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
          <input type="submit" className="btn btn-primary" value="Add Hotel" />
          <input type="reset" className="btn btn-link" value="or Cancel" onClick={this.props.onBack} />

        </div>
      </form>
    );
  }
}
