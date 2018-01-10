import React from 'react';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import Select from 'react-select';

export default class BookUnit extends React.Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    render() {
      return(
        <form onSubmit={(e) => {e.preventDefault(); this.props.onSubmit(this.state.password)}}>
          <div class="form-group">
            <label><b>Dates to book: </b></label>
            <DateRangePicker
              startDate={this.props.startDate} // momentPropTypes.momentObj or null,
              endDate={this.props.endDate} // momentPropTypes.momentObj or null,
              onDatesChange={({ startDate, endDate }) => this.props.onDatesChange(startDate, endDate)} // PropTypes.func.isRequired,
              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })} // PropTypes.func.isRequired,
            />
          </div>
          {this.props.startDate && this.props.endDate && (this.props.available ?
            <div>
              <div class="form-group">
                <label><b>Book with:</b></label>
                <Select
                  name="Currency"
                  clearable={false}
                  options={this.props.currencyOptions}
                  value={this.props.currency}
                  onChange={ (val) => { this.props.onCurrencyChange(val.value); }}
                />
              </div>
              {this.props.currency &&
                <div>
                  {this.props.currency === 'lif' &&
                    <div class="form-group">
                      <label><b>Price in Lif: {this.props.bookLifPrice}</b></label>
                    </div>
                  }
                  {this.props.currency === 'fiat' &&
                    <div class="form-group">
                      <label><b>Price in Fiat: {this.props.bookPrice}</b></label>
                    </div>
                  }
                  <div class="form-group">
                    <label><b>Your Wallet Password</b></label>
                    <div class="input-group">
                      <input
                        type={this.state.showPassword ? "text" : "password"}
                        class="form-control"
                        defaultValue={this.state.password}
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
                  <button type="submit" class="btn btn-primary">{this.props.waitConfirmation ? 'Request Room' : 'Book Room'}</button>
                </div>
              }
            </div>
          :<div class="form-group">
            <label><b>Sorry, this room is not available for the selected dates.</b></label>
          </div>)}
        </form>
      );
    }

}
