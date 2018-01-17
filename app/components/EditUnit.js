import React from 'react';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import Select from 'react-select';
import currencyCodeData from 'currency-codes/data';
import currencyCodes from 'currency-codes';

export default class EditUnit extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        newUnit: Object.assign({}, props.hotel.units[props.unit])
      }
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.unitInfo !== nextProps.unitInfo) {
        this.setState({ newUnit: Object.assign({}, props.unitInfo)});
      }
    }

    editUnitInfo(info) {
      this.setState({ newUnit: Object.assign(this.state.newUnit, info) });
    }

    render() {
      let currencyCodeOptions = currencyCodeData.map(e => {return {value: e.code, label: e.code + ' (' + e.number + ')'}});
      let selectedCurrency = currencyCodeOptions.find(e => e.value == this.state.newUnit.currencyCode);
      if(selectedCurrency == undefined || selectedCurrency.value == undefined) selectedCurrency = null;

      return(
        <div className="card">
          <div class="card-header">
            <div className="row align-items-center">
              <div class="col">
                <h3 class="mb-0">{this.props.hotel.name}: edit room</h3>
              </div>
              <div className="col text-right">
                <button title="Cancel" type="button" class="btn btn-light" onClick={this.props.onBack}>
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => {e.preventDefault(); this.props.editHotelUnit(this.state.newUnit, this.state.password)}}>
              <label><b>{this.props.unit.substring(3,6)}</b></label>
              <div class="row">
                <div class="col-sm-12 col-md-9 col-lg-6">
                  <div class="form-group">
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

              <div class="row">
                <div class="col-sm-12 col-md-9 col-lg-6">
                  {{
                    setUnitActive: (
                      <div class="form-group">
                        <label><b>Active</b></label>
                        <input
                          type="checkbox"
                          class="form-control"
                          autoFocus="true"
                          checked={this.state.newUnit.active}
                          onChange={e => this.editUnitInfo({active: e.target.checked})}
                        />
                      </div>
                    ),
                    setCurrencyCode: (
                      <div class="form-group">
                        <label><b>Currency Code</b></label>
                        <Select
                					options={currencyCodeOptions}
                					name="selected-state"
                					value={selectedCurrency}
                					onChange={e => this.editUnitInfo({currencyCode: e.value})}
                					searchable
                				/>
                      </div>
                    ),
                    setDefaultLifPrice: (
                      <div class="form-group">
                        <label><b>Default Lif Price</b></label>
                        <input
                          type="number"
                          class="form-control"
                          autoFocus="true"
                          value={this.state.newUnit.defaultLifPrice || ''}
                          onChange={e => this.editUnitInfo({defaultLifPrice: Number(e.target.value)})}
                        />
                      </div>
                    ),
                    setDefaultPrice: (
                      <div class="form-group">
                        <label><b>Default Price</b></label>
                        <input
                          type="number"
                          class="form-control"
                          autoFocus="true"
                          value={this.state.newUnit.defaultPrice || ''}
                          onChange={e => this.editUnitInfo({defaultPrice: Number(e.target.value)})}
                        />
                      </div>
                    ),
                    setUnitSpecialLifPrice: (
                      <div>
                        <div class="form-group">
                          <label><b>Date Range</b></label>
                          <DateRangePicker
                            startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                            endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                            onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                            focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                            onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                          />
                        </div>
                        <div class="form-group">
                          <label><b>Lif Price</b></label>
                          <input
                            type="number"
                            class="form-control"
                            autoFocus="true"
                            value={this.state.newUnit.specialLifPrice || ''}
                            onChange={e => this.editUnitInfo({specialLifPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    ),
                    setUnitSpecialPrice: (
                      <div>
                        <div class="form-group">
                          <label><b>Date Range</b></label>
                          <DateRangePicker
                            startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                            endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                            onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                            focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                            onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                          />
                        </div>
                        <div class="form-group">
                          <label><b>Price</b></label>
                          <input
                            type="number"
                            class="form-control"
                            autoFocus="true"
                            value={this.state.newUnit.specialPrice || ''}
                            onChange={e => this.editUnitInfo({specialPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    ),
                    removeUnit: (
                      <div class="form-group">
                        <label><b>Enter your password below to remove this room.</b></label>
                      </div>
                    )
                  }[this.props.editHotelUnitFunction]}
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12 col-md-9 col-lg-6">
                  <div class="form-group">
                  <label><b>Your Wallet Password</b></label>
                  <div class="input-group">
                    <input
                      type={this.state.showPassword ? "text" : "password"}
                      class="form-control"
                      required
                      defaultValue={this.state.password}
                      onChange={e => this.setState({ password: e.target.value})}
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
              <button type="submit" class="btn btn-primary">Update Hotel Room</button>

          </form>
          </div>
        </div>
      );
    }

}
