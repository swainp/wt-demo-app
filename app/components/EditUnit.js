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
        <form class="box" onSubmit={(e) => {e.preventDefault(); this.props.editHotelUnit(this.state.newUnit, this.state.password)}}>
          <h3>
            Edit Hotel Room
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={this.props.onBack}>Back to hotels</button>
            </div>
          </h3>
          <h4>{this.props.hotel.name} {this.props.unit.substring(2,6)}</h4>
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
          <hr></hr>
          {{
            setUnitActive: (
              <div class="form-group">
                <label>Active</label>
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
                <label>Currency Code</label>
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
                <label>Default Lif Price</label>
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
                <label>Default Price</label>
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
                  <label>Date Range</label>
                  <DateRangePicker
                    startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                    endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                    onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                    focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                    onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                  />
                </div>
                <div class="form-group">
                  <label>Lif Price</label>
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
                  <label>Date Range</label>
                  <DateRangePicker
                    startDate={this.state.newUnit.startDate} // momentPropTypes.momentObj or null,
                    endDate={this.state.newUnit.endDate} // momentPropTypes.momentObj or null,
                    onDatesChange={({ startDate, endDate }) => this.editUnitInfo({ startDate, endDate })} // PropTypes.func.isRequired,
                    focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                    onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
                  />
                </div>
                <div class="form-group">
                  <label>Price</label>
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
                <label>Enter your password below to remove this room.</label>
              </div>
            )
          }[this.props.editHotelUnitFunction]}
          <div class="form-group">
            <label>Your Wallet Password</label>
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
          <button type="submit" class="btn btn-primary btn-block">Update Hotel Room</button>
        </form>
      );
    }

}
