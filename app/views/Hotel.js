import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import { ToastContainer, toast } from 'react-toastify';

import CreateHotel from '../components/CreateHotel';
import EditHotel from '../components/EditHotel';
import AddUnit from '../components/AddUnit';
import EditUnit from '../components/EditUnit';
import AddUnitType from '../components/AddUnitType';
import EditUnitType from '../components/EditUnitType';
import ViewBookings from '../components/ViewBookings';
import ViewHotelTx from '../components/ViewHotelTx';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

import Select from 'react-select';
var _ = require('lodash');

export default class App extends React.Component {

    constructor() {
      super();
      let wallet = '';
      if(window.localStorage.wallet)
        wallet = JSON.parse(window.localStorage.wallet);
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        hotels: [],
        hotelOptions: [],
        hotel: {
          name: '',
          address: '',
          units: []
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
        hotelManager: {},
        specialLifPrice: '',
        specialPrice: '',
      }
    }

    componentWillMount(){
      if (
        // window.localStorage.wtIndexAddress
        // && window.localStorage.wtIndexAddress.length > 0
        // && web3.eth.getCode(window.localStorage.wtIndexAddress) != '0x0'
        this.state.importKeystore
      )
        {
        let hotelManager = new HotelManager({
          indexAddress: window.localStorage.wtIndexAddress || WTINDEX_ADDRESS,
          owner: this.state.importKeystore.address,
          web3: web3,
          gasMargin: 1.5
        });
        const bookingData = new BookingData(web3);
        this.setState({hotelManager: hotelManager, bookingData: bookingData}, () => { this.getHotels() });
      }
    }

    async createHotel(hotel, password){
      var self = this;
      self.setState({loading: true});
      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager.createHotel(hotel.name, hotel.description);
        await self.getHotels();
        self.setState({loading: false, hotelSection: "list"});
        toast.success('Added new hotel!');
      }
      catch(e) {
        console.log("Error creating the hotel", e);
        self.setState({loading: false });
        toast.error(e.toString());
      }
    }

    async addUnit(password){
      var self = this;
      self.setState({loading: true});
      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager.addUnit(self.state.hotel.address, self.state.unitType);
        // select hotel again, so it uses the fresh version (that includes the just created room)
        await self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false});
        toast.success('Added new room!');
      }
      catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false});
        toast.error(e.toString());
      }
    }

    async addUnitType(newUnitType, password){
      var self = this;
      self.setState({loading: true});

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager.addUnitType(self.state.hotel.address, newUnitType);
        // select hotel again, so it uses the fresh version (that includes the just created room)
        await self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false});
        toast.success('Added new room type!');
      }
      catch(e) {
        console.log("Error adding room type", e);
        self.setState({loading: false});
        toast.error(e.toString());
      }
    }

    async editUnitType(newUnitType, image, password) {
      var self = this;
      self.setState({loading: true});

      let args = [
        self.state.hotel.address,
        self.state.unitType
      ]

      //async addAmenity(hotelAddress: Address, unitType: String, amenity: Number): Promievent
      //async removeAmenity(hotelAddress: Address, unitType: String, amenity: Number): Promievent
      //async editUnitType(hotelAddress: Address, unitType: String, description: String, minGuests: Number, maxGuests: Number, price: String): Promievent
      //async addImageUnitType(hotelAddress: Address, unitType: String, url: String): Promievent
      //async removeImageUnitType(hotelAddress: Address, unitType: String, imageIndex: Number): Promievent
      //async removeUnitType(hotelAddress: Address, unitType: String): Promievent
      switch(self.state.editHotelUnitTypeFunction) {
        case 'addAmenity':
        case 'removeAmenity':
          args.push(self.state.amenityCode);
          break;
        case 'editUnitType':
          args.push((newUnitType.description || self.state.unitTypeInfo.description));
          args.push((newUnitType.minGuests || self.state.unitTypeInfo.minGuests));
          args.push((newUnitType.maxGuests || self.state.unitTypeInfo.maxGuests));
          args.push((newUnitType.price || self.state.unitTypeInfo.price));
          break;
        case 'addImageUnitType':
          args.push(image.imageUrl);
          break;
        case 'removeImageUnitType':
          args.push(image.imageIndex);
          break;
        case 'removeUnitType':
          break;
      }

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager[self.state.editHotelUnitTypeFunction](...args);
        await self.getHotels();
        // select hotel again, so it uses the fresh version (that includes the just created room)
        await self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {}});
        toast.success('Edited room type details!');
      } catch(e) {
        console.log("Error editing unit type", e);
        self.setState({loading: false});
        toast.error(e.toString());
      }
    }

    async editHotel(hotel, image, password) {
      var self = this;
      self.setState({loading: true});

      let args = [
        self.state.hotel.address
      ]
      //async changeHotelAddress(hotelAddress: Address, lineOne: String, lineTwo: String, zipCode: String, country: String)
      //async changeHotelInfo(hotelAddress: Address, name: String, description: String)
      //async changeHotelLocation(hotelAddress: Address, timezone: Number, latitude: Number, longitude: Number)
      //async setRequireConfirmation(hotelAddress: Address, value: Boolean)
      //async addImageHotel(hotelAddress: Address, url: String): Promievent
      //async removeImageHotel(hotelAddress: Address, imageIndex: Number): Promievent
      //async removeHotel(address: Address): Promievent
      switch(self.state.editHotelFunction) {
        case 'changeHotelAddress':
          args.push(hotel.lineOne);
          args.push(hotel.lineTwo);
          args.push(hotel.zip);
          args.push(hotel.country);
          break;
        case 'changeHotelInfo':
          args.push(hotel.name);
          args.push(hotel.description);
          break;
        case 'changeHotelLocation':
          args.push(hotel.timezone);
          args.push(hotel.latitude);
          args.push(hotel.longitude);
          break;
        case 'setRequireConfirmation':
          args.push(hotel.waitConfirmation);
          break;
        case 'addImageHotel':
          args.push(image.imageUrl);
        case 'removeImageHotel':
          args.push(image.imageIndex);
        case 'removeHotel':
          break;
      }

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);

        await self.state.hotelManager[self.state.editHotelFunction](...args);

        // select hotel again, so it uses the fresh version (that includes the just created room)
        if(self.state.editHotelFunction !== 'removeHotel')
          await self.selectHotel(self.state.hotel.address);
        else
          await self.getHotels();
        self.setState({section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {}});
        toast.success('Updated hotel!')
      } catch(e) {
        console.log("Error editing hotel room", e);
        self.setState({loading: false });
        toast.error(e.toString());
      }
    }

    async editHotelUnit(newUnit, password) {
      var self = this;
      self.setState({loading: true, addHotelUnitError: false});

      let args = [
        self.state.hotel.address,
        self.state.unit
      ]

      //async setCurrencyCode(hotelAddress: Address, unitAddress: Address, code: Number, converter: Function, convertStart: Date, convertEnd: Date)
      //async setDefaultLifPrice(hotelAddress: Address, unitAddress: Address, price: String | Number | BN)
      //async setDefaultPrice(hotelAddress: Address, unitAddress: Address, price: Number)
      //async setUnitActive(hotelAddress: Address, unitAddress: Address, active: Boolean)
      //async setUnitSpecialLifPrice(hotelAddress: Address, unitAddress: Address, price: String | Number | BN, fromDate: Date, amountDays: Number)
      //async setUnitSpecialPrice(hotelAddress: Address, unitAddress: Addres, price: Number, fromDate: Date, amountDays: Number)
      //async removeUnit(hotelAddress: Address, unitAddress: Address): Promievent
      switch(self.state.editHotelUnitFunction) {
        case 'setUnitActive':
          args.push(newUnit.active);
          break;
        case 'setDefaultPrice':
          args.push(newUnit.defaultPrice);
          break;
        case 'setDefaultLifPrice':
          args.push(newUnit.defaultLifPrice);
          break;
        case 'setCurrencyCode':
          args.push(newUnit.currencyCode);
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
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager[self.state.editHotelUnitFunction](...args);
        // select hotel again, so it uses the fresh version (that includes the just created room)
        await self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {}});
        toast.success('Updated room details!');
      } catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false, addHotelUnitError: true});
        toast.error(e.toString());
      }
    }

    async selectHotel(address) {
      var self = this;
      var selectedHotel = await self.state.hotelManager.getHotel(address);
      selectedHotel.address = address;
      let unitTypeOptions = [];
      Object.entries(selectedHotel.unitTypes).forEach(([key, value]) => {
        unitTypeOptions.push({ value: key, label: key})
      });

      self.setState({
        hotel: selectedHotel,
        createNewUnitType: selectedHotel.unitTypeNames.length == 0,
        unitType: unitTypeOptions[0] ? unitTypeOptions[0].value: '',
        unitTypeInfo: unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].info : '',
        amenities: unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].amenities : '',
        unitTypeOptions: unitTypeOptions
      });
    }

    async loadHotel(address){
      let self = this;
      self.setState({loading: true});
      await self.selectHotel(address);
      self.setState({loading: false});
    }

    async getHotels() {
      var self = this;
      self.setState({loading: true});
      let hotelsAddrs = await self.state.hotelManager.WTIndex.methods.getHotelsByManager('0x'+self.state.hotelManager.owner).call();
      hotelsAddrs = hotelsAddrs.filter(addr => addr !== "0x0000000000000000000000000000000000000000");

      let hotels = [];
      let totalHotels = hotelsAddrs.length-1;
      for (let hotelAddr of hotelsAddrs)
        hotels.push(await self.getHotelInfo(hotelAddr));

      // let hotels = await this.state.hotelManager.getHotels();
      let hotelOptions = [];
      if(hotels) {
        Object.entries(hotels).forEach(([key, value]) => {
          hotelOptions.push({ value: value.instance._address, label: value.name})
        });
      }
      this.setState({hotels: hotels, hotelOptions: hotelOptions, loading: false});
    }

    async getHotelInfo(hotelAddr) {
      var self = this;
      var hotelInstance = Utils.getInstance('Hotel', hotelAddr, self.state.hotelManager.context);
      return {
        instance: hotelInstance,
        name: await hotelInstance.methods.name().call(),
      };
    }

    async loadBookings(hotel){
      var self = this;
      self.setState({loading: true});
      await self.selectHotel(hotel);
      let bookings = await self.state.bookingData.getBookings(hotel);
      let bookingRequests = await self.state.bookingData.getBookingRequests(hotel);
      self.setState({
        bookings: bookings,
        bookingRequests: bookingRequests,
        loading: false,
        section: 'hotelBookings'
      });
    }

    async loadTxs() {
      var self = this;
      let network = await web3.eth.net.getNetworkType();
      self.setState({loading: true});
      let txs = await Utils.getDecodedTransactions(
        '0x' + self.state.importKeystore.address,
        (window.localStorage.wtIndexAddress || WTINDEX_ADDRESS),
        WTINDEX_BLOCK,
        web3,
        network);
      self.setState({hotelTxs: txs, loading: false});
    }

    async confirmBooking(request, password) {
      var self = this;
      self.setState({loading: true});

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        await self.state.hotelManager.confirmBooking(self.state.hotel.address, request.dataHash);
        await self.loadBookings(self.state.hotel.address);
        toast.success('Successfully confirmed booking ' + request.id);
      } catch(e) {
        console.log("Error confirming booking", e);
        self.setState({loading: false});
        toast.error(e.toString());
      }
    }

    render() {
      var self = this;

      var actions =
        <div>
          <ul class="list-unstyled" id="actions">
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotels' ? " btn-success" : "")} onClick={() => self.setState({section: 'hotels'})}>Hotels</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotelBookings' ? " btn-success" : "")} onClick={() => self.setState({section: 'hotelBookings'})}>Hotel Bookings</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotelTxs' ? " btn-success" : "")} onClick={() => self.setState({section: 'hotelTxs'})}>Blockchain Txs</button> </li>
          </ul>
        </div>

      var createHotel =
        <CreateHotel
          createHotel={self.createHotel.bind(self)}
          onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
        />

      let editHotelFunctions = [
        {value: 'changeHotelAddress', label: 'Address'},
        {value: 'changeHotelInfo', label: 'Main Info'},
        {value: 'changeHotelLocation', label: 'Location'},
        {value: 'setRequireConfirmation', label: 'Confirmation Required'},
        {value: 'addImageHotel', label: 'Add Image'},
        {value: 'removeImageHotel', label: 'Remove Image'},
        {value: 'removeHotel', label: 'Remove this hotel'}
      ]

      var editHotel =
        <EditHotel
          editHotel={self.editHotel.bind(self)}
          onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
          hotel={self.state.hotel}
          hotelOptions={self.state.hotelOptions}
          onHotelChange={self.loadHotel.bind(self)}
          editHotelFunction={self.state.editHotelFunction}
          editHotelFunctions={editHotelFunctions}
          onFunctionChange={(func) => { self.setState({ editHotelFunction: func }); }}
          editHotelInfo={(info) => { self.setState({ hotel: Object.assign(self.state.hotel, info) }); }}
        />

      var addHotelUnit =
        <AddUnit
          addUnit={self.addUnit.bind(self)}
          onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
          hotel={self.state.hotel}
          unitType={self.state.unitType}
          unitTypeOptions={self.state.unitTypeOptions}
          onUnitTypeChange={(unitType) => {
            self.setState({ unitType: unitType, unitTypeInfo: self.state.hotel.unitTypes[unitType].info });
          }}
          onNewRoomType={() => self.setState({createNewUnitType: true})}
        />


      let editHotelUnitTypeFunctions = [
        {value: 'editUnitType', label: 'Main Info'},
        {value: 'addAmenity', label: 'Add Amenity'},
        {value: 'removeAmenity', label: 'Remove Amenity'},
        {value: 'addImageUnitType', label: 'Add Image'},
        {value: 'removeImageUnitType', label: 'Remove Image'},
        {value: 'removeUnitType', label: 'Remove this room type'}
      ]

      var addHotelUnitType =
        <AddUnitType
          addUnitType={self.addUnitType.bind(self)}
          onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
          hotel={self.state.hotel}
          unitTypeOptions={self.state.unitTypeOptions}
          onEditUnitType={() => self.setState({section: 'editHotelUnitType'})} //switch to setting section
        />

      var editHotelUnitType =
        <EditUnitType
          unitTypeInfo={self.state.unitTypeInfo}
          editUnitType={self.editUnitType.bind(self)}
          onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
          onAddUnitType={() => self.setState({section: 'addHotelUnitType'})}
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
        />

      let editHotelUnitFunctions = [
        {value: 'setUnitActive', label: 'Active'},
        {value: 'setCurrencyCode', label: 'Currency Code'},
        {value: 'setDefaultLifPrice', label: 'Default Lif Price'},
        {value: 'setDefaultPrice', label: 'Default Price'},
        {value: 'setUnitSpecialLifPrice', label: 'Special Lif Price'},
        {value: 'setUnitSpecialPrice', label: 'Special Price'},
        {value: 'removeUnit', label: 'Remove this room'}
      ]

      var editHotelUnit =
      <EditUnit
        editHotelUnit={self.editHotelUnit.bind(self)}
        onBack={() => self.setState({section: 'hotels', hotelSection: 'list'})}
        hotel={self.state.hotel}
        unit={self.state.unit}
        editHotelUnitFunction={self.state.editHotelUnitFunction}
        editHotelUnitFunctions={editHotelUnitFunctions}
        onFunctionChange={func => self.setState({ editHotelUnitFunction: func })}
      />

      var hotels =
        <div class="box">
          <h3>
            Hotels
            <div class="pull-right">
              <button class="btn btn-primary" onClick={() => self.setState({section: 'hotels', hotelSection: 'new'})}>+ New hotel</button>
            </div>
          </h3>
          <div class="form-group">
            <label>Choose a hotel</label>
            {self.state.hotels ?
              <Select
                name="Hotels"
                clearable={false}
                options={self.state.hotelOptions}
                onChange={ (val) => self.loadHotel(val.value)}
                value={self.state.hotel.address}
              />
            :
              <div>No hotels, click the button on the right to add one.</div>
            }
          </div>
          {self.state.hotel.address != ''
          ? <div>
              <h3>{self.state.hotel.name}</h3>
              <p>{self.state.hotel.description}</p>
              {(self.state.hotel.lineOne != '')
                ? <h4>Address: {self.state.hotel.lineOne}</h4>
                : null
              }
              {(self.state.hotel.zip != '')
                ? <h4>Zip: {self.state.hotel.zip}</h4>
                : null
              }
              {(self.state.hotel.country != '')
                ? <h4>Country: {self.state.hotel.country}</h4>
                : null
              }
              {(self.state.hotel.latitude != '-180.00000' || self.state.hotel.longitude != '-90.00000')
                ? <h4>Location: LAT ({self.state.hotel.latitude}) - LONG ({self.state.hotel.longitude})</h4>
                : null
              }
              <div><button class="btn btn-primary btn-block" onClick={() => self.setState({section: 'hotels', hotelSection: 'edit'})}>Edit hotel details</button></div>

              <hr />

              <h3>
                Rooms
                <div class="pull-right">
                  <button class="btn btn-primary btn-sm"
                          onClick={() => self.setState({section: 'addHotelUnitType'})}>
                    Room Types
                  </button>
                  <button class="btn btn-primary btn-sm"
                          onClick={() => self.setState({section: 'addHotelUnit'})}>
                    + Hotel Room
                  </button>
                </div>
              </h3>
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="text-center">Type</th>
                    <th class="text-center">ID</th>
                    <th class="text-center">Description</th>
                    <th class="text-center">Guests</th>
                    <th class="text-center">Price</th>
                    <th class="text-center">Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(self.state.hotel.units).map(function(unit, i){
                    let entryTypeInfo = self.state.hotel.unitTypes[unit[1].unitType].info
                    return (
                      <tr key={'unit'+i} class="pointer" onClick={() => console.log(unit)}>
                        <td class="text-center">{unit[1].unitType}</td>
                        <td class="text-center">{unit[0].substring(2,6)}</td>
                        <td class="shortCell">{entryTypeInfo.description}</td>
                        <td class="text-center">{entryTypeInfo.maxGuests}</td>
                        <td class="text-center">{unit[1].defaultPrice}{unit[1].currencyCode}</td>
                        <td class="text-center">{unit[1].active ? 'Active' : 'Inactive'}</td>
                        <td class="text-center">
                          <button class="btn btn-primary btn-sm"
                                  onClick={() => self.setState({section: 'editHotelUnit', unit: unit[0], unitInfo: unit[1]})}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          : null}
        </div>

        var hotelBookings =
        <ViewBookings
          hotel={self.state.hotel}
          hotelOptions={self.state.hotelOptions}
          onHotelChange={hotel => { self.loadBookings(hotel);} }
          bookings={self.state.bookings}
          bookingRequests={self.state.bookingRequests}
          confirmBooking={self.confirmBooking.bind(self)}
        />

        var hotelTxs =
        <ViewHotelTx
          loadTxs={self.loadTxs.bind(self)}
          hotelOptions={self.state.hotelOptions}
          hotelTxs={self.state.hotelTxs}
          web3={web3}
        />

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class="row">
            <div class="col-md-2 text-center">
              {actions}
            </div>
            <div class="col-md-10">
              {self.state.section == 'hotelTxs' ?
                <div>{hotelTxs}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'edit' ?
                <div>{editHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'new' ?
                <div>{createHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'list' ?
                <div>{hotels}</div>
              : (self.state.section == 'addHotelUnitType') ?
                <div>{addHotelUnitType}</div>
              : (self.state.section == 'editHotelUnitType') ?
                  <div>{editHotelUnitType}</div>
              : self.state.section == 'addHotelUnit' ?
                <div>{addHotelUnit}</div>
              : self.state.section == 'editHotelUnit' ?
                <div>{editHotelUnit}</div>
              : <div>{hotelBookings}</div>}
            </div>
          </div>
          <Modal
            isOpen={(self.state.importKeystore == '')}
            contentLabel='Modal'
            style={{
              overlay : {
                position          : 'fixed',
                top               : 50,
                left              : 0,
                right             : 0,
                bottom            : 0,
                backgroundColor   : 'rgba(255, 255, 255, 0.75)'
              },
              content : {
                maxWidth                   : '350px',
                maxHeight                  : '200px',
                margin                     : 'auto',
                textAlign                  : 'center',
                border                     : '1px solid #ccc',
                background                 : '#fff',
                overflow                   : 'auto',
                WebkitOverflowScrolling    : 'touch',
                borderRadius               : '4px',
                outline                    : 'none',
                padding                    : '20px'
              }
            }}
          >
            <h3>You need to open a wallet to use the Hotel Manager</h3>
            <Link class='top-margin' to='/wallet'><h4>Go to Wallet</h4></Link>
          </Modal>
        </div>
      )
    }

}
