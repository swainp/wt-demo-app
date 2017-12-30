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
        <form class="card" onSubmit={e => {e.preventDefault(); this.props.createHotel(this.state.hotel, this.state.password)}}>

          <div class="card-header">
            <div className="row align-items-center">
              <div className="col"><h3 class="mb-0">New Hotel</h3></div>
              <div className="col text-right">
                <button type="button" class="btn btn-link" onClick={this.props.onBack}>
                  Back to hotels
                </button>
              </div>
            </div>
          </div>

          <div class="card-body">
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
            <input type="submit" class="btn btn-primary" value="Add Hotel" />
            <input type="reset" class="btn btn-link" value="or Cancel" onClick={this.props.onBack} />

          </div>
        </form>
      );
    }

}
