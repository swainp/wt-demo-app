import React from 'react';

import Select from 'react-select';
import PlacesAutocomplete from 'react-places-autocomplete';
import { formatResult } from '../helpers/geocodeFormatter';
import googleMaps from '@google/maps';

export default class EditHotel extends React.Component {
  constructor (props) {
    super(props);
    let googleMapsClient = googleMaps.createClient({
      key: MAPS_API_KEY,
      Promise: Promise,
    });
    this.state = {
      hotel: Object.assign({}, props.hotel),
      image: {},
      googleMapsClient: googleMapsClient,
    };
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.hotel !== nextProps.hotel) {
      let address;
      this.setState({ hotel: Object.assign({}, nextProps.hotel), image: {}, address: address });
    }
  }

  editHotelInfo (info) {
    this.setState({ hotel: Object.assign(this.state.hotel, info) });
  }

  onPlacesChange (address) {
    this.setState({ address: address });
  }

  onlyDefined (val, append = '') { return (val ? val + append : ''); }

  async handlePlacesSelect (address, placeId) {
    this.setState({ address: address });
    // Get the geocode and format it
    let geoCode = await this.state.googleMapsClient.geocode({ address: address }).asPromise();
    geoCode = formatResult(geoCode.json.results[0]);
    // Get the timezone from coordinates
    let location = { latitude: geoCode.latitude, longitude: geoCode.longitude };
    let timezone = await this.state.googleMapsClient.timezone({ location: location }).asPromise();
    // Filter out undefined values
    let hotelLocation = {
      lineOne: this.onlyDefined(geoCode.streetNumber, ', ') + this.onlyDefined(geoCode.streetName),
      lineTwo: this.onlyDefined(geoCode.streetNumber, ', ') + this.onlyDefined(geoCode.streetName, ', ') + geoCode.administrativeLevels.join(', '),
      zip: this.onlyDefined(geoCode.zipcode),
      country: this.onlyDefined(geoCode.countryCode),
      latitude: geoCode.latitude,
      longitude: geoCode.longitude,
      timezone: timezone.json.timeZoneId,
    };
    this.setState({
      hotel: Object.assign(this.state.hotel, hotelLocation),
    });
  }

  render () {
    const placesInputProps = {
      value: this.state.address,
      onChange: (address) => { this.onPlacesChange(address); },
    };
    const cssClasses = {
      input: 'form-control',
    };
    return (
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="mb-0">{this.props.hotel.name}: update basic info</h3>
            </div>
            <div className="col text-right">
              <button title="Cancel" type="button" className="btn btn-light" onClick={this.props.onBack}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); this.props.editHotel(this.state.hotel, this.state.image, this.state.password); }}>

            {
              // <div class="form-group">
              //   <label><b>Choose a hotel</b></label>
              //   <Select
              //     name="Hotels"
              //     clearable={false}
              //     options={this.props.hotelOptions}
              //     value={this.state.hotel.address}
              //     onChange={(e) => { this.props.onHotelChange(e.value) }}
              //   />
              // </div>
              // <hr/>
            }

            {(this.state.hotel.address !== '')
              ? <div>

                <div className="row">
                  <div className="col-sm-12 col-md-5 col-lg-3">
                    <div className="nav flex-column nav-pills mb-4" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                      <a onClick={() => this.props.onFunctionChange('changeHotelInfo')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'changeHotelInfo' ? 'active bg-light text-dark' : '')}>Basic information</a>
                      <a onClick={() => this.props.onFunctionChange('changeHotelAddress')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'changeHotelAddress' ? 'active bg-light text-dark' : '')}>Address</a>
                      <a onClick={() => this.props.onFunctionChange('setRequireConfirmation')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'setRequireConfirmation' ? 'active bg-light text-dark' : '')}>Confirmation required</a>
                      <a onClick={() => this.props.onFunctionChange('addImageHotel')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'addImageHotel' ? 'active bg-light text-dark' : '')}>Add image</a>
                      <a onClick={() => this.props.onFunctionChange('removeImageHotel')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'removeImageHotel' ? 'active bg-light text-dark' : '')}>Remove image</a>
                      <a onClick={() => this.props.onFunctionChange('removeHotel')} className={'nav-link text-muted ' + (this.props.editHotelFunction === 'removeHotel' ? 'active bg-light text-dark' : '')}>Remove hotel</a>
                    </div>
                    <hr className="d-block d-md-none"/>
                  </div>
                  <div className="col-sm-12 col-md-9 col-lg-6">
                    <div className="tab-content" id="v-pills-tabContent">

                      {{
                        changeHotelAddress: (
                          <div>
                            <div className="form-group">
                              <label><b>Search for Address</b></label>
                              <PlacesAutocomplete
                                inputProps={placesInputProps}
                                classNames={cssClasses}
                                onSelect={(address, placeId) => this.handlePlacesSelect(address, placeId)}
                              />
                            </div>
                            <div className="form-group">
                              <label><b>Address One</b></label>
                              <input
                                type="text"
                                className="form-control"
                                value={this.state.hotel.lineOne || ''}
                                onChange={e => this.editHotelInfo({ lineOne: e.target.value })}
                              />
                            </div>
                            <div className="form-group">
                              <label><b>Address Two</b></label>
                              <input
                                type="text"
                                className="form-control"
                                value={this.state.hotel.lineTwo || ''}
                                onChange={e => this.editHotelInfo({ lineTwo: e.target.value })}
                              />
                            </div>
                            <div className="row">
                              <div className="col-4">
                                <div className="form-group">
                                  <label><b>Zip Code</b></label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.hotel.zip || ''}
                                    onChange={e => this.editHotelInfo({ zip: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="form-group">
                                  <label><b>Country</b></label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.hotel.country || ''}
                                    onChange={e => this.editHotelInfo({ country: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="form-group">
                                  <label><b>Timezone</b></label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.hotel.timezone || ''}
                                    onChange={e => this.editHotelInfo({ timezone: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="row justify-content-start">
                              <div className="col-4">
                                <div className="form-group">
                                  <label><b>Latitude</b></label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.hotel.latitude || ''}
                                    onChange={e => this.editHotelInfo({ latitude: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="form-group">
                                  <label><b>Longitude</b></label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.hotel.longitude || ''}
                                    onChange={e => this.editHotelInfo({ longitude: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>

                          </div>
                        ),
                        changeHotelInfo: (
                          <div>
                            <div className="form-group">
                              <label><b>Name</b></label>
                              <input
                                type="text"
                                autoFocus="true"
                                className="form-control"
                                value={this.state.hotel.name || ''}
                                onChange={e => this.editHotelInfo({ name: e.target.value })}
                              />
                            </div>
                            <div className="form-group">
                              <label><b>Description</b></label>
                              <input
                                type="text"
                                className="form-control"
                                value={this.state.hotel.description || ''}
                                onChange={e => this.editHotelInfo({ description: e.target.value })}
                              />
                            </div>
                          </div>
                        ),
                        setRequireConfirmation: (
                          <div className="form-group">

                            <div className="form-check">
                              <input
                                style={{ marginLeft: 2, marginRight: -9 }}
                                id="confirmReq"
                                type="checkbox"
                                className="form-check-input"
                                checked={this.state.hotel.waitConfirmation}
                                onChange={e => this.editHotelInfo({ waitConfirmation: e.target.checked })}
                              />
                              <label className="form-check-label" htmlFor="confirmReq">
                                <b>Confirmation Required</b>
                              </label>
                            </div>

                          </div>
                        ),
                        addImageHotel: (
                          <div>
                            <div className="form-group">
                              <label><b>Image URL</b></label>
                              <input
                                type="url"
                                className="form-control"
                                value={this.state.image.imageUrl || ''}
                                onChange={e => this.setState({ image: { imageUrl: e.target.value } })}
                              />
                            </div>
                            <div className="form-group">
                              <h6><b>Preview</b></h6>
                              <img className="img-fluid" src={this.state.image.imageUrl} />
                            </div>
                          </div>
                        ),
                        removeImageHotel: (
                          <div>
                            <div className="form-group">
                              <label><b>Image to Remove</b></label>
                              <Select
                                name="Image"
                                clearable={false}
                                value={this.state.image.imageUrl || ''}
                                autoFocus="true"
                                options={this.state.hotel.images.map((url, i) => { return { value: i, label: url }; })}
                                onChange={e => this.setState({ image: { imageUrl: e.label, imageIndex: e.value } })}
                              />
                            </div>
                            <div className="form-group">
                              <label><b>Preview</b></label>
                              <img className="img-fluid" src={this.state.image.imageUrl} />
                            </div>
                          </div>
                        ),
                        removeHotel: (
                          <div className="form-group">
                            <label><b>Enter your password below to remove this hotel</b></label>
                          </div>
                        ),
                      }[this.props.editHotelFunction]}

                      <div className="row">
                        <div className="col-sm-12 col-md-8 col-lg-6">
                          <div className="form-group">
                            <label><b>Your Wallet Password</b></label>
                            <div className="input-group">
                              <input
                                type={this.state.showPassword ? 'text' : 'password'}
                                className="form-control"
                                defaultValue={this.state.password}
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

                    </div>
                  </div>
                </div>

                {
                  // <div class="form-group">
                  //   <Select
                  //     name="Edit Parameter"
                  //     clearable={false}
                  //     value={this.props.editHotelFunction}
                  //     autoFocus="true"
                  //     options={this.props.editHotelFunctions}
                  //     onChange={e => this.props.onFunctionChange(e.value)}
                  //   />
                  // </div>
                }

                <hr className="mb-md"/>

                <button type="submit" className="btn btn-primary">Update basic info</button>
                <button type="button" className="btn btn-link" onClick={this.props.onBack}>or Discard changes</button>
              </div>
              : null}
          </form>
        </div>
      </div>
    );
  }
}
