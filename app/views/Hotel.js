import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Select from 'react-select';

import { ToastContainer, toast } from 'react-toastify';
import currencyCodes from 'currency-codes';

import CreateHotel from '../components/CreateHotel';
import EditHotel from '../components/EditHotel';
import AddUnit from '../components/AddUnit';
import EditUnit from '../components/EditUnit';
import AddUnitType from '../components/AddUnitType';
import EditUnitType from '../components/EditUnitType';
import ViewBookings from '../components/ViewBookings';
import ViewHotelTx from '../components/ViewHotelTx';

import { web3provider } from '../services/web3provider';
import BookingData from '@windingtree/wt-js-libs/src/BookingData';
import HotelManager from '@windingtree/wt-js-libs/src/HotelManager';

import config from '../services/config';

export default class Hotel extends React.Component {
  constructor () {
    super();
    let wallet = '';
    if (window.localStorage.wallet) { wallet = JSON.parse(window.localStorage.wallet); }
    this.state = {
      indexAddress: '0x0000000000000000000000000000000000000000',
      hotels: [],
      hotelOptions: [],
      hotel: {
        name: '',
        address: '',
        units: [],
      },
      newUnitType: {},
      newUnit: {},
      editUnit: {},
      editHotelUnitFunction: 'setActive',
      editHotelFunction: 'changeHotelInfo',
      editHotelUnitTypeFunction: 'editUnitType',
      createNewUnitType: false,
      showPassword: false,
      hotelSelected: '',
      txs: [],
      bookings: [],
      transaction: {},
      importKeystore: wallet,
      loading: false,
      section: 'hotels',
      userType: 'unknown',
      hotelSection: 'list',
      hotelSubcat: 'overview',
      hotelManager: {},
      specialLifPrice: '',
      specialPrice: '',
    };
  }

  componentWillMount () {
    if (
    // window.localStorage.wtIndexAddress
    // && window.localStorage.wtIndexAddress.length > 0
    // && web3provider.web3.eth.getCode(window.localStorage.wtIndexAddress) != '0x0'
      this.state.importKeystore
    ) {
      let hotelManager = new HotelManager({
        indexAddress: window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address,
        owner: this.state.importKeystore.address,
        web3provider: web3provider,
        gasMargin: config.get('GAS_MARGIN'),
      });
      const bookingData = new BookingData({ web3provider: web3provider });
      this.setState({ hotelManager: hotelManager, bookingData: bookingData }, () => { this.getHotels(); });
    }
  }

  async createHotel (hotel, password) {
    var self = this;
    self.setState({ loading: true });
    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      self.state.hotelManager.createHotel(hotel.name, hotel.description, self.props.getCallbacks('register hotel ' + hotel.name));
      self.setState({ loading: false, hotelSection: 'list' });
    } catch (e) {
      console.log('Error creating the hotel', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  async addUnit (password) {
    var self = this;
    self.setState({ loading: true });
    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      self.state.hotelManager.addUnit(self.state.hotel.address, self.state.unitType, self.props.getCallbacks('add a new ' + self.state.unitType));
      self.setState({ section: 'hotels', hotelSection: 'list', loading: false });
    } catch (e) {
      console.log('Error adding hotel room', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  async addUnitType (newUnitType, password) {
    var self = this;
    self.setState({ loading: true });

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      self.state.hotelManager.addUnitType(self.state.hotel.address, newUnitType, self.props.getCallbacks('add room type ' + newUnitType));
      self.setState({ section: 'hotels', hotelSection: 'list', loading: false });
    } catch (e) {
      console.log('Error adding room type', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  async editUnitType (newUnitType, image, password) {
    var self = this;
    self.setState({ loading: true });

    let args = [
      self.state.hotel.address,
      self.state.unitType,
    ];

    // async setDefaultLifPrice(hotelAddress: Address, unitType: String, price: String | Number | BN)
    // async setDefaultPrice(hotelAddress: Address, unitType: String, price: Number)
    // async setCurrencyCode(hotelAddress: Address, unitType: String, code: Number, converter: Function, convertStart: Date, convertEnd: Date)
    // async addAmenity(hotelAddress: Address, unitType: String, amenity: Number): Promievent
    // async removeAmenity(hotelAddress: Address, unitType: String, amenity: Number): Promievent
    // async editUnitType(hotelAddress: Address, unitType: String, description: String, minGuests: Number, maxGuests: Number): Promievent
    // async addImageUnitType(hotelAddress: Address, unitType: String, url: String): Promievent
    // async removeImageUnitType(hotelAddress: Address, unitType: String, imageIndex: Number): Promievent
    // async removeUnitType(hotelAddress: Address, unitType: String): Promievent
    switch (self.state.editHotelUnitTypeFunction) {
    case 'addAmenity':
    case 'removeAmenity':
      args.push(self.state.amenityCode);
      break;
    case 'editUnitType':
      args.push((newUnitType.description || self.state.unitTypeInfo.description));
      args.push((newUnitType.minGuests || self.state.unitTypeInfo.minGuests));
      args.push((newUnitType.maxGuests || self.state.unitTypeInfo.maxGuests));
      break;
    case 'addImageUnitType':
      args.push(image.imageUrl);
      break;
    case 'removeImageUnitType':
      args.push(image.imageIndex);
      break;
    case 'setDefaultPrice':
      args.push(newUnitType.defaultPrice);
      break;
    case 'setDefaultLifPrice':
      args.push(newUnitType.defaultLifPrice);
      break;
    case 'setCurrencyCode':
      args.push(Number(currencyCodes.code(newUnitType.currencyCode).number));
      break;
    case 'removeUnitType':
      break;
    }

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      args.push(self.props.getCallbacks('edit room type ' + self.state.unitType));
      self.state.hotelManager[self.state.editHotelUnitTypeFunction](...args);
      self.setState({ section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {} });
    } catch (e) {
      console.log('Error editing unit type', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  async editHotel (hotel, image, password) {
    var self = this;
    self.setState({ loading: true });
    let action;

    let args = [
      self.state.hotel.address,
    ];
    // async changeHotelInfo(hotelAddress: Address, name: String, description: String)
    // async changeHotelLocation(hotelAddress: Address, lineOne: String, lineTwo: String, zipCode: String, country: String, timezone: Number, latitude: Number, longitude: Number)
    // async setRequireConfirmation(hotelAddress: Address, value: Boolean)
    // async addImageHotel(hotelAddress: Address, url: String): Promievent
    // async removeImageHotel(hotelAddress: Address, imageIndex: Number): Promievent
    // async removeHotel(address: Address): Promievent
    switch (self.state.editHotelFunction) {
    case 'changeHotelInfo':
      args.push(hotel.name);
      args.push(hotel.description);
      action = 'change name and description of ' + self.state.hotel.name;
      break;
    case 'changeHotelLocation':
      args.push(hotel.lineOne);
      args.push(hotel.lineTwo);
      args.push(hotel.zip);
      args.push(hotel.country);
      args.push(hotel.timezone);
      args.push(hotel.latitude);
      args.push(hotel.longitude);
      action = 'change location of ' + self.state.hotel.name;
      break;
    case 'setRequireConfirmation':
      args.push(hotel.waitConfirmation);
      action = 'require confirmation before booking for ' + self.state.hotel.name;
      break;
    case 'addImageHotel':
      args.push(image.imageUrl);
      action = 'add an image to ' + self.state.hotel.name;
      break;
    case 'removeImageHotel':
      args.push(image.imageIndex);
      action = 'remove an image from ' + self.state.hotel.name;
      break;
    case 'removeHotel':
      break;
    }

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      args.push(self.props.getCallbacks(action));
      self.state.hotelManager[self.state.editHotelFunction](...args);
      self.setState({ loading: false });
    } catch (e) {
      console.log('Error editing hotel room', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  async editHotelUnit (newUnit, password) {
    var self = this;
    self.setState({ loading: true, addHotelUnitError: false });

    let args = [
      self.state.hotel.address,
      self.state.unit,
    ];

    // async setUnitActive(hotelAddress: Address, unitAddress: Address, active: Boolean)
    // async setUnitSpecialLifPrice(hotelAddress: Address, unitAddress: Address, price: String | Number | BN, fromDate: Date, amountDays: Number)
    // async setUnitSpecialPrice(hotelAddress: Address, unitAddress: Addres, price: Number, fromDate: Date, amountDays: Number)
    // async removeUnit(hotelAddress: Address, unitAddress: Address): Promievent
    switch (self.state.editHotelUnitFunction) {
    case 'setUnitActive':
      args.push(newUnit.active);
      break;
    case 'setUnitSpecialLifPrice':
      args.push(newUnit.specialLifPrice);
      args.push(newUnit.startDate.toDate());
      args.push(newUnit.endDate.diff(newUnit.startDate, 'days'));
      break;
    case 'setUnitSpecialPrice':
      args.push(newUnit.specialPrice);
      args.push(newUnit.startDate.toDate());
      args.push(newUnit.endDate.diff(newUnit.startDate, 'days'));
      break;
    case 'removeUnit':
      break;
    }

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      args.push(self.props.getCallbacks('edit ' + self.state.unitType + ' ' + self.state.unit.substring(2, 6)));
      await self.state.hotelManager[self.state.editHotelUnitFunction](...args);
      self.setState({ section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {} });
    } catch (e) {
      console.log('Error adding hotel room', e);
      self.setState({ loading: false, addHotelUnitError: true });
      toast.error(e.toString());
    }
  }

  async selectHotel (address) {
    var self = this;
    var selectedHotel = await self.state.hotelManager.getHotel(address);
    selectedHotel.address = address;
    let unitTypeOptions = [];
    Object.entries(selectedHotel.unitTypes).forEach(([key, value]) => {
      unitTypeOptions.push({ value: key, label: key });
    });

    var unitTypeInfo = unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].info : {};
    unitTypeInfo.currencyCode = unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].currencyCode : '';
    unitTypeInfo.defaultLifPrice = unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].defaultLifPrice : '';

    self.setState({
      hotel: selectedHotel,
      createNewUnitType: selectedHotel.unitTypeNames.length === 0,
      unitType: unitTypeOptions[0] ? unitTypeOptions[0].value : '',
      unitTypeInfo: unitTypeInfo,
      amenities: unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].amenities : '',
      unitTypeOptions: unitTypeOptions,
    });
  }

  async loadHotel (address) {
    let self = this;
    self.setState({ loading: true });
    await self.selectHotel(address);
    self.setState({ loading: false });
  }

  async getHotels () {
    var self = this;
    self.setState({ loading: true });
    let hotelsAddrs = await self.state.hotelManager.getIndexInstance().methods.getHotelsByManager('0x' + self.state.hotelManager.owner).call();
    hotelsAddrs = hotelsAddrs.filter(addr => addr !== '0x0000000000000000000000000000000000000000');

    let hotels = [];
    for (let hotelAddr of hotelsAddrs) { hotels.push(await self.getHotelInfo(hotelAddr)); }

    // let hotels = await this.state.hotelManager.getHotels();
    let hotelOptions = [];
    if (hotels) {
      Object.entries(hotels).forEach(([key, value]) => {
        hotelOptions.push({ value: value.instance._address, label: value.name });
      });
    }
    this.setState({ hotels: hotels, hotelOptions: hotelOptions, loading: false });
  }

  async getHotelInfo (hotelAddr) {
    var hotelInstance = web3provider.contracts.getHotelInstance(hotelAddr);
    return {
      instance: hotelInstance,
      name: await hotelInstance.methods.name().call(),
    };
  }

  async loadBookings (hotel) {
    var self = this;
    self.setState({ loading: true });
    await self.selectHotel(hotel);
    let bookings = await self.state.bookingData.getBookings(hotel);
    let bookingRequests = await self.state.bookingData.getBookingRequests(hotel);
    self.setState({
      bookings: bookings,
      bookingRequests: bookingRequests,
      loading: false,
      section: 'hotelBookings',
    });
  }

  async loadTxs () {
    var self = this;
    let network = await web3provider.web3.eth.net.getNetworkType();
    self.setState({ loading: true });
    let txs = await web3provider.data.getDecodedTransactions(
      '0x' + self.state.importKeystore.address,
      (window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address),
      (window.localStorage.wtIndexBlock || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].block),
      network);
    self.setState({ hotelTxs: txs, loading: false });
  }

  async confirmBooking (request, password) {
    var self = this;
    self.setState({ loading: true });

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
      self.state.hotelManager.confirmBooking(self.state.hotel.address, request.dataHash, self.props.getCallbacks('approve booking'));
      self.setState({ loading: false });
    } catch (e) {
      console.log('Error confirming booking', e);
      self.setState({ loading: false });
      toast.error(e.toString());
    }
  }

  render () {
    var self = this;

    var actions =
      <div className="nav flex-column nav-pills mb-3" id="actions" role="tablist" aria-orientation="vertical">
        <a className={'nav-link ' + (self.state.section === 'hotels' ? 'active bg-secondary' : '')}
          onClick={() => self.setState({ section: 'hotels' })}>Home</a>
        <a className={'nav-link ' + (self.state.section === 'hotelBookings' ? 'active bg-secondary' : '')}
          onClick={() => self.setState({ section: 'hotelBookings' })}>Bookings</a>
        <a className={'nav-link ' + (self.state.section === 'hotelTxs' ? 'active bg-secondary' : '')}
          onClick={() => self.setState({ section: 'hotelTxs' })}>Transactions</a>
      </div>;

    var createHotel =
        <CreateHotel
          createHotel={self.createHotel.bind(self)}
          onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
        />;

    let editHotelFunctions = [
      { value: 'changeHotelInfo', label: 'Main Info' },
      { value: 'changeHotelLocation', label: 'Location' },
      { value: 'setRequireConfirmation', label: 'Confirmation Required' },
      { value: 'addImageHotel', label: 'Add Image' },
      { value: 'removeImageHotel', label: 'Remove Image' },
      { value: 'removeHotel', label: 'Remove this hotel' },
    ];

    var editHotel =
        <EditHotel
          editHotel={self.editHotel.bind(self)}
          onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
          hotel={self.state.hotel}
          hotelOptions={self.state.hotelOptions}
          onHotelChange={self.loadHotel.bind(self)}
          editHotelFunction={self.state.editHotelFunction}
          editHotelFunctions={editHotelFunctions}
          onFunctionChange={(func) => { self.setState({ editHotelFunction: func }); }}
          editHotelInfo={(info) => { self.setState({ hotel: Object.assign(self.state.hotel, info) }); }}
        />;

    var addHotelUnit =
        <AddUnit
          addUnit={self.addUnit.bind(self)}
          onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
          hotel={self.state.hotel}
          unitType={self.state.unitType}
          unitTypeOptions={self.state.unitTypeOptions}
          onUnitTypeChange={(unitType) => {
            self.setState({ unitType: unitType, unitTypeInfo: self.state.hotel.unitTypes[unitType].info });
          }}
          onNewRoomType={() => self.setState({ createNewUnitType: true })}
        />;

    let editHotelUnitTypeFunctions = [
      { value: 'editUnitType', label: 'Main Info' },
      { value: 'setCurrencyCode', label: 'Currency Code' },
      { value: 'setDefaultLifPrice', label: 'Default Lif Price' },
      { value: 'setDefaultPrice', label: 'Default Price' },
      { value: 'addAmenity', label: 'Add Amenity' },
      { value: 'removeAmenity', label: 'Remove Amenity' },
      { value: 'addImageUnitType', label: 'Add Image' },
      { value: 'removeImageUnitType', label: 'Remove Image' },
      { value: 'removeUnitType', label: 'Remove this room type' },
    ];

    var addHotelUnitType =
        <AddUnitType
          addUnitType={self.addUnitType.bind(self)}
          onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
          hotel={self.state.hotel}
          unitTypeOptions={self.state.unitTypeOptions}
          onEditUnitType={() => self.setState({ section: 'editHotelUnitType' })} // switch to setting section
        />;

    var editHotelUnitType =
        <EditUnitType
          unitTypeInfo={self.state.unitTypeInfo}
          editUnitType={self.editUnitType.bind(self)}
          onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
          onAddUnitType={() => self.setState({ section: 'addHotelUnitType' })}
          hotel={self.state.hotel}
          unitType={self.state.unitType}
          unitTypeOptions={self.state.unitTypeOptions}
          onUnitTypeChange={unitType => self.setState({ unitType: unitType, unitTypeInfo: self.state.hotel.unitTypes[unitType].info })}
          editHotelUnitTypeFunction={self.state.editHotelUnitTypeFunction}
          editHotelUnitTypeFunctions={editHotelUnitTypeFunctions}
          onFunctionChange={func => self.setState({ editHotelUnitTypeFunction: func })}
          amenityCode={self.state.amenityCode}
          amenities={self.state.amenities}
          onAmenityCodeChange={amenityCode => self.setState({ amenityCode: amenityCode })}
        />;

    let editHotelUnitFunctions = [
      { value: 'setUnitActive', label: 'Active' },
      { value: 'setUnitSpecialLifPrice', label: 'Special Lif Price' },
      { value: 'setUnitSpecialPrice', label: 'Special Price' },
      { value: 'removeUnit', label: 'Remove this room' },
    ];

    var editHotelUnit =
      <EditUnit
        editHotelUnit={self.editHotelUnit.bind(self)}
        onBack={() => self.setState({ section: 'hotels', hotelSection: 'list' })}
        hotel={self.state.hotel}
        unit={self.state.unit}
        editHotelUnitFunction={self.state.editHotelUnitFunction}
        editHotelUnitFunctions={editHotelUnitFunctions}
        onFunctionChange={func => self.setState({ editHotelUnitFunction: func })}
      />;

    var hotels =
        <div>
          <div className="card mb-md">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="mb-0">{self.state.hotel.address === '' ? 'Hotels' : self.state.hotel.name}</h3>
                </div>
                <div className="col text-right">

                  {self.state.hotel.address !== ''
                    ? <button title="Cancel" className="btn btn-light" onClick={() => self.setState({ section: 'hotels', hotelSection: 'list', hotel: { name: '', address: '', units: [] } })}>
                      <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                    : <button className="btn btn-primary" onClick={() => self.setState({ section: 'hotels', hotelSection: 'new' })}>
                      <i className="fa fa-plus-circle" aria-hidden="true"></i> Add Hotel
                    </button>
                  }

                </div>
              </div>
            </div>
            <section className="card-body">
              {self.state.hotels.length > 0
                ? <div>
                  {self.state.hotel.address === '' &&
                    <div className="row">
                      <div className="col-sm-12 col-md-9 col-lg-6">
                        <div className="form-group">
                          <label><b>Choose a hotel</b></label>
                          <Select
                            name="Hotels"
                            clearable={false}
                            options={self.state.hotelOptions}
                            onChange={ (val) => self.loadHotel(val.value)}
                            value={self.state.hotel.address}
                          />
                        </div>
                      </div>
                    </div>
                  }
                </div>
                : <p>You don't have any hotels yet. Add the first hotel clicking the button on the top right.</p>
              }

              {self.state.hotel.address !== ''
                ? <div>

                  <ul className="nav nav-tabs mb-md">
                    <li className="nav-item">
                      <a className={'nav-link ' + (self.state.hotelSubcat === 'overview' ? 'active' : '')}
                        onClick={ () => { self.setState({ hotelSubcat: 'overview' }); }}
                      >Hotel Profile</a>
                    </li>
                    <li className="nav-item">
                      <a className={'nav-link ' + (self.state.hotelSubcat === 'rooms' ? 'active' : '')}
                        onClick={() => { self.setState({ hotelSubcat: 'rooms' }); }}
                      >Manage Rooms</a>
                    </li>
                  </ul>

                  {self.state.hotelSubcat === 'overview'
                    ? <div className="tab-content">
                      <div className="row">
                        {(self.state.hotel.description !== '') &&
                        <div className="col">
                          <dl>
                            <dt>Description</dt>
                            <dd>{self.state.hotel.description}</dd>
                          </dl>
                        </div>
                        }

                        <div className="col">
                          <dl>
                            {(self.state.hotel.lineOne !== '') && <dt>Address:</dt>}
                            {(self.state.hotel.lineOne !== '') && <dd>{self.state.hotel.lineOne}</dd>}

                            {(self.state.hotel.zip !== '') && <dt>Zip:</dt>}
                            {(self.state.hotel.zip !== '') && <dd>{self.state.hotel.zip}</dd>}
                          </dl>
                        </div>

                        <div className="col">
                          <dl>
                            {(self.state.hotel.country !== '') && <dt>Country:</dt>}
                            {(self.state.hotel.country !== '') && <dd>{self.state.hotel.country}</dd>}

                            {(self.state.hotel.latitude !== '-180.00000' || self.state.hotel.longitude !== '-90.00000') &&
                            <dt>Location:</dt>}
                            {(self.state.hotel.latitude !== '-180.00000' || self.state.hotel.longitude !== '-90.00000') &&
                             <dd>LAT ({self.state.hotel.latitude}) - LONG ({self.state.hotel.longitude})</dd>}
                          </dl>
                        </div>

                      </div>

                      <hr className="mb-md"/>
                      <button className="btn btn-primary" onClick={() => self.setState({ section: 'hotels', hotelSection: 'edit' })}><i className="fa fa-pencil-square-o" aria-hidden="true"></i> Edit basic info</button>

                      {self.state.hotel.address !== '' &&
                      <button className="btn btn-link" onClick={() => self.setState({ section: 'hotels', hotelSection: 'list', hotel: { name: '', address: '', units: [] } })}>
                        or Choose another hotel
                      </button>
                      }
                    </div>
                    : <div className="tab-content">

                      {Object.keys(self.state.hotel.units).length > 0

                        ? <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th className="text-center">Type</th>
                              <th className="text-center">ID</th>
                              <th className="text-center">Description</th>
                              <th className="text-center">Guests</th>
                              <th className="text-center">Price</th>
                              <th className="text-center">Active</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(self.state.hotel.units).map(function (unit, i) {
                              let entryTypeInfo = self.state.hotel.unitTypes[unit[1].unitType].info;
                              return (
                                <tr key={'unit' + i} className="pointer" onClick={() => console.log(unit)}>
                                  <td className="text-center">{unit[1].unitType}</td>
                                  <td className="text-center">{unit[0].substring(2, 6)}</td>
                                  <td className="shortCell">{entryTypeInfo.description}</td>
                                  <td className="text-center">{entryTypeInfo.maxGuests}</td>
                                  <td className="text-center">{entryTypeInfo.defaultPrice || 0} {entryTypeInfo.currencyCode || ''}</td>
                                  <td className="text-center">{unit[1].active ? 'Active' : 'Inactive'}</td>
                                  <td className="text-right">
                                    <button
                                      className="btn btn-light btn-sm"
                                      onClick={() => self.setState({ section: 'editHotelUnit', unit: unit[0], unitInfo: unit[1] })}>
                                  Edit room
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        : <p>The hotel has no rooms, use the button below to create one.</p>
                      }
                      <hr className="mb-md"/>
                      {
                        // <button class="btn btn-light"
                        //   onClick={() => self.setState({section: 'addHotelUnitType'})}>
                        //   Room Types
                        // </button>
                      }
                      {' '}
                      <button className="btn btn-primary"
                        onClick={() => self.setState({ section: 'addHotelUnit' })}>
                        <i className="fa fa-plus-circle" aria-hidden="true"></i> Add Room
                      </button>
                      <button className="btn btn-link"
                        onClick={() => self.setState({ section: 'addHotelUnitType' })}>
                      or Create a new room type
                      </button>
                    </div>
                  }

                </div>
                : null}
            </section>
          </div>
        </div>;

    var hotelBookings =
        <ViewBookings
          hotel={self.state.hotel}
          hotelOptions={self.state.hotelOptions}
          onHotelChange={hotel => { self.loadBookings(hotel); } }
          bookings={self.state.bookings}
          bookingRequests={self.state.bookingRequests}
          confirmBooking={self.confirmBooking.bind(self)}
        />;

    var hotelTxs =
        <ViewHotelTx
          loadTxs={self.loadTxs.bind(self)}
          hotelOptions={self.state.hotelOptions}
          hotelTxs={self.state.hotelTxs}
          web3={web3provider.web3}
        />;

    return (
      <div className={'row justify-content-center ' + (self.state.loading ? 'loading' : '')}>
        <ToastContainer style={{ zIndex: 2000 }}/>
        <div className="col-sm-11">
          <div className="row">
            <div className="col">
              <h1>Hotel Manager</h1>
              <p className="lead">Add hotels, administrate bookings, and manage your hotel transactions.</p>
              <hr/>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 col-md-3  col-lg-2 text-center">
              {actions}
            </div>
            <div className="col-sm-8 col-md-9 col-lg-10">
              {self.state.section === 'hotelTxs'
                ? <div>{hotelTxs}</div>
                : self.state.section === 'hotels' && self.state.hotelSection === 'edit'
                  ? <div>{editHotel}</div>
                  : self.state.section === 'hotels' && self.state.hotelSection === 'new'
                    ? <div>{createHotel}</div>
                    : self.state.section === 'hotels' && self.state.hotelSection === 'list'
                      ? <div>{hotels}</div>
                      : (self.state.section === 'addHotelUnitType')
                        ? <div>{addHotelUnitType}</div>
                        : (self.state.section === 'editHotelUnitType')
                          ? <div>{editHotelUnitType}</div>
                          : self.state.section === 'addHotelUnit'
                            ? <div>{addHotelUnit}</div>
                            : self.state.section === 'editHotelUnit'
                              ? <div>{editHotelUnit}</div>
                              : <div>{hotelBookings}</div>}
            </div>
          </div>
        </div>
        <Modal
          isOpen={(self.state.importKeystore === '')}
          contentLabel='Modal'
          style={{
            overlay: {
              position: 'fixed',
              top: 50,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
            },
            content: {
              maxWidth: '350px',
              maxHeight: '200px',
              margin: 'auto',
              textAlign: 'center',
              border: '1px solid #ccc',
              background: '#fff',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '4px',
              outline: 'none',
              padding: '20px',
            },
          }}
        >
          <h3>You need to open a wallet to use the Hotel Manager</h3>
          <Link class='btn btn-primary' to='/wallet'>Go to Wallet</Link>
        </Modal>
      </div>
    );
  }
}
