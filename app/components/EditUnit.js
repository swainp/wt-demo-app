import React from 'react';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import Select from 'react-select';

export default class EditUnit extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      newUnit: Object.assign({}, props.hotel.units[props.unit]),
    };
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.unitInfo !== nextProps.unitInfo) {
      this.setState({ newUnit: Object.assign({}, nextProps.unitInfo) });
    }
  }

  editUnitInfo (info) {
    this.setState({ newUnit: Object.assign(this.state.newUnit, info) });
  }

  render () {
    return (
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="mb-0">{this.props.hotel.name}: edit room</h3>
            </div>
            <div className="col text-right">
              <button title="Cancel" type="button" className="btn btn-light" onClick={this.props.onBack}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); this.props.editHotelUnit(this.state.newUnit, this.state.password); }}>
            <label><b>{this.props.unit.substring(2, 6)}</b></label>
            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                <div className="form-group">
                  <Select
                    name="Edit Parameter"
                    clearable={false}
                    value={this.props.editHotelUnitFunction}
                    autoFocus="true"
                    options={this.props.editHotelUnitFunctions}
                    onChange={e => this.props.onFunctionChange(e.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                {{
                  setUnitActive: (
                    <div className="form-group">
                      <label><b>Active</b></label>
                      <input
                        type="checkbox"
                        className="form-control"
                        autoFocus="true"
                        checked={this.state.newUnit.active}
                        onChange={e => this.editUnitInfo({ active: e.target.checked })}
                      />
                    </div>
                  ),
                  setUnitSpecialLifPrice: (
                    <div>
                      <div className="form-group">
                        <label><b>Date Range</b></label>
                        <DateRangePicker
                          startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                          endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                          onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                          focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                          onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                        />
                      </div>
                      <div className="form-group">
                        <label><b>Lif Price</b></label>
                        <input
                          type="number"
                          className="form-control"
                          autoFocus="true"
                          value={this.state.newUnit.specialLifPrice || ''}
                          onChange={e => this.editUnitInfo({ specialLifPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  ),
                  setUnitSpecialPrice: (
                    <div>
                      <div className="form-group">
                        <label><b>Date Range</b></label>
                        <DateRangePicker
                          startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                          endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                          onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                          focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                          onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                        />
                      </div>
                      <div className="form-group">
                        <label><b>Price</b></label>
                        <input
                          type="number"
                          className="form-control"
                          autoFocus="true"
                          value={this.state.newUnit.specialPrice || ''}
                          onChange={e => this.editUnitInfo({ specialPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  ),
                  removeUnit: (
                    <div className="form-group">
                      <label><b>Enter your password below to remove this room.</b></label>
                    </div>
                  ),
                }[this.props.editHotelUnitFunction]}
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12 col-md-9 col-lg-6">
                <div className="form-group">
                  <label><b>Your Wallet Password</b></label>
                  <div className="input-group">
                    <input
                      type={this.state.showPassword ? 'text' : 'password'}
                      className="form-control"
                      required
                      defaultValue={this.state.password}
                      onChange={e => this.setState({ password: e.target.value })}
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
            <button type="submit" className="btn btn-primary">Update Hotel Room</button>

          </form>
        </div>
      </div>
    );
  }
}
