import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

import moment from 'moment';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3PROVIDER));

import Select from 'react-select';
var _ = require('lodash');

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        hotels: [],
        hotel: {
          name: '',
          address: '',
          units: []
        },
        newUnit: {},
        editUnit: {},
        newUnitType: false,
        showPassword: false,
        hotelSelected: '',
        txs: [],
        bookings: [],
        transaction: {},
        importKeystore: JSON.parse(window.localStorage.wallet) || '',
        loading: false,
        section: 'hotels',
        userType: 'unknown',
        hotelSection: 'list'
      }
    }

    // componentWillMount(){
    //   if (
    //     window.localStorage.indexAddress
    //     && window.localStorage.indexAddress.length > 0
    //     && web3.eth.getCode(window.localStorage.indexAddress) != '0x0'
    //     && window.localStorage.userType == 'Hotel'
    //     && window.localStorage.wallet.length > 0
    //   )
    //     {
    //     wtHotelLib.setIndex(window.localStorage.indexAddress);
    //     wtHotelLib.wallet.setKeystore(window.localStorage.wallet);
    //     this.setState({indexAddress: window.localStorage.indexAddress});
    //     this.updateData();
    //   } else
    //     window.location.replace(window.location.origin+'/#/');
    // }

    // logout(){
    //   wtHotelLib.wallet.closeWallet();
    //   window.localStorage.userType = "";
    //   window.location.replace(window.location.origin+'/#/');
    //   window.location.reload();
    // }

    // async createHotel(){
    //   var self = this;
    //   self.setState({loading: true, createHotelError: false});
    //   try {
    //     let newHotel = await wtHotelLib.createHotel(self.state.password, self.state.newHotelName, self.state.newHotelDescription);
    //     await self.updateData();
    //     self.selectHotel(newHotel.address);
    //     self.setState({wtHotel: { address: newHotel.address, name: await newHotel.name(), unitTypes:[] },
    //       loading: false,
    //       section: 'hotels',
    //       hotelSection: 'list',
    //       newHotelName: '',
    //       newHotelDescription: '',
    //       password: ''});
    //   }
    //   catch(e) {
    //     console.log("Error creating the hotel", e);
    //     self.setState({loading: false, createHotelError: true});
    //   }
    // }

    // async editHotel(){
    //   var self = this;
    //   self.setState({loading: true, editHotelError: false});

    //   try {
    //     // Edit wtHotel address
    //     await wtHotelLib.changeHotelInfo(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.hotel.name,
    //       self.state.hotel.description
    //     );

    //     // Edit wtHotel address
    //     await wtHotelLib.changeHotelAddress(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.hotel.lineOne,
    //       self.state.hotel.lineTwo,
    //       self.state.hotel.zip,
    //       self.state.hotel.country
    //     );

    //     // Edit hotel location
    //     // To represent 40.426371, -3.703578 GPS position
    //     // (90 + 40.426371)*10^5, (180 + (-3.703578))*10^5 = 13042637, 17629642
    //     // Timezone is represented from 0 to 23, being 0 = UTC and 23 = +22UTC
    //     await wtHotelLib.changeHotelLocation(
    //       self.state.password,
    //       self.state.hotel.address,
    //       parseInt(self.state.hotel.timezone),
    //       self.state.hotel.latitude,
    //       self.state.hotel.longitude
    //     );
    //     await self.updateData();
    //     self.setState({
    //       loading: false,
    //       hotelSection: 'list',
    //       password: ''
    //     });
    //   }
    //   catch(e) {
    //     console.log("Error updating the hotel", e);
    //     self.setState({loading: false, editHotelError: true});
    //   }

    // }

    // async addHotelUnit(){
    //   var self = this;
    //   self.setState({loading: true, addHotelUnitError: false});

    //   try {
    //     if (_.findIndex(self.state.hotel.units,{ type: self.state.newUnit.type}) < 0)
    //       await wtHotelLib.addUnitType(self.state.password, self.state.hotel.address, self.state.newUnit.type);

    //     await wtHotelLib.addUnit(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.newUnit.type,
    //       self.state.newUnit.name,
    //       self.state.newUnit.description,
    //       1,
    //       self.state.newUnit.maxGuests,
    //       self.state.newUnit.price+' '+self.state.newUnit.currency
    //     );
    //     await self.updateData();
    //     // select hotel again, so it uses the fresh version (that includes the just created room)
    //     self.selectHotel(self.state.hotel.address);
    //     self.setState({section: 'hotels', hotelSection: 'list', loading: false, password: ''});
    //   }
    //   catch(e) {
    //     console.log("Error adding hotel room", e);
    //     self.setState({loading: false, addHotelUnitError: true});
    //   }
    // }

    // startEditHotelUnit(val) {
    //   var self = this;
    //   var editUnit = self.state.editUnit;
    //   editUnit.index = val.index;
    //   editUnit.label = val.label;
    //   editUnit.name = val.name;
    //   editUnit.description = val.description;
    //   editUnit.maxGuests = val.maxGuests;
    //   editUnit.price = val.price.split(' ')[0];
    //   editUnit.currency = val.price.split(' ')[1] || 'USD';
    //   editUnit.type = val.type.replace(/\W+/g, "");
    //   self.setState({editUnit: editUnit, section: 'editHotelUnit'});
    // }

    // loadBookings(){
    //   var self = this;
    //   self.setState({
    //     bookings: wtHotelLib.getBookings(),
    //     loading: false,
    //     section: 'hotelBookings'
    //   });
    // }

    // async editHotelUnit(){
    //   var self = this;
    //   self.setState({loading: true, editHotelUnitError: false});

    //   try {
    //     await wtHotelLib.editUnit(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.editUnit.type,
    //       self.state.editUnit.index,
    //       self.state.editUnit.name,
    //       self.state.editUnit.description,
    //       1,
    //       self.state.editUnit.maxGuests,
    //       self.state.editUnit.price+' '+self.state.editUnit.currency
    //     );
    //     // load data & select hotel again, so it uses the fresh version (that includes the just edited room)
    //     await self.updateData();
    //     self.selectHotel(self.state.hotel.address);
    //     self.setState({section: 'hotels', hotelSection: 'list', loading: false, password: ''});
    //   }
    //   catch(e) {
    //     console.log("Error updating the hotel room", e);
    //     self.setState({loading: false, editHotelUnitError: true});
    //   }
    // }

    // selectHotel(address) {
    //   var selectedHotel = wtHotelLib.hotels[address];
    //   selectedHotel.address = address;

    //   this.setState({
    //     hotel: selectedHotel,
    //     newUnitType: selectedHotel.units.length == 0
    //   });
    // }

    // async loadHotel(address){
    //   await this.setState({loading: true});
    //   await this.updateData();
    //   this.selectHotel(address);
    //   await this.setState({loading: false});
    // }

    // loadTxs(){
    //   var self = this;
    //   this.setState({loading: true});
    //   var txs = wtHotelLib.wallet.getTxs();
    //   function decodeData(params){
    //     for (var i = 0; i < params.length; i++) {
    //       if (params[i].name == 'data' && params[i].type == 'bytes'){
    //         params[i].decoded = wtHotelLib.abiDecoder.decodeMethod(params[i].value);
    //         decodeData(params[i].decoded.params);
    //       }
    //     }
    //     return params;
    //   }
    //   for (var i = 0; i < txs.length; i++) {
    //     txs[i].decoded = wtHotelLib.abiDecoder.decodeMethod(txs[i].input);
    //     if (txs[i].decoded)
    //       txs[i].decoded.params = decodeData(txs[i].decoded.params);
    //   }
    //   self.setState({
    //     txs: txs,
    //     loading: false,
    //     section: 'blockchain'
    //   });
    // }

    // async updateData(){
    //   this.setState({loading: true});
    //   wtHotelLib.updateHotels();
    //   var hotels = [];
    //   for (var addr in wtHotelLib.hotels) {
    //     hotels.push({value: addr, label: wtHotelLib.hotels[addr].name});
    //   }
    //   this.setState({hotels: hotels, loading: false});
    // }

    render() {
      var self = this;

      var actions =
        <div>
          <ul class="list-unstyled" id="actions">
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotels' ? " btn-success" : "")} onClick={() => self.setState({section: 'hotels'})}>Hotels</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotelBookings' ? " btn-success" : "")} onClick={() => self.loadBookings()}>Hotel Bookings</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'blockchain' ? " btn-success" : "")} onClick={() => self.loadTxs()}>Blockchain Txs</button> </li>
            <li><a href="/wallet" class="btn btn-default btn-action">My Wallet</a> </li>
            <li><button class="btn btn-default btn-link" onClick={() => self.logout()}>Logout</button> </li>
          </ul>
        </div>

      var createHotel =
        <form class="box" onSubmit={(e) => {e.preventDefault(); self.createHotel()}}>
          <h3>
            New Hotel
            <div class="pull-right">
              <input type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})} value="Back to hotels" />
            </div>
          </h3>
          <div class="form-group">
            <label>Hotel Name</label>
            <input
              type="text"
              autoFocus="true"
              class="form-control"
              value={self.state.newHotelName}
              onChange={(event) => {
                self.setState({ newHotelName: event.target.value, createHotelError: false });
              }}
            />
          </div>
          <div class="form-group">
            <label>Hotel Description</label>
            <input
              type="text"
              class="form-control"
              value={self.state.newHotelDescription}
              onChange={(event) => {
                self.setState({ newHotelDescription: event.target.value, createHotelError: false });
              }}
            />
          </div>
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={self.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={self.state.password}
                onChange={(event) => {
                  self.setState({ password: event.target.value, createHotelError: false });
                }}
              />
              <span class="input-group-addon">
                {self.state.showPassword ?
                  <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                :
                  <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                }
              </span>
            </div>
          </div>
          <input type="submit" class="btn btn-primary btn-block" value="Create hotel" />
          {self.state.createHotelError
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error creating the hotel, is that the correct wallet password?</p>
            : null}
        </form>

      var editHotel =
        <form class="box" onSubmit={(e) => {e.preventDefault(); self.editHotel()}}>
          <h3>
            Edit Hotel
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotels</button>
            </div>
          </h3>
          <div class="form-group">
            <label>Choose a hotel</label>
            <Select
              name="Hotels"
              clearable={false}
              value={self.state.hotel.address}
              options={self.state.hotels}
              onChange={ (val) => self.loadHotel(val.value)}
            />
          </div>
          {(self.state.hotel.address != "") ?
          <div>
            <hr></hr>
            {self.state.editHotelError
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error editing the hotel, is that the correct wallet password?</p>
              : null}
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                autoFocus="true"
                class="form-control"
                value={self.state.hotel.name}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.name = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.description}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.description = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Address One</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.lineOne}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.lineOne = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Address Two</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.lineTwo}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.lineTwo = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.zip}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.zip = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Country</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.country}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.country = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Timezone</label>
              <input
                type="number"
                min="0"
                max="24"
                step="1"
                class="form-control"
                value={self.state.hotel.timezone}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.timezone = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Latitude</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.latitude}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.latitude = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.longitude}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.longitude = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Your Wallet Password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={self.state.password}
                  onChange={(event) => {
                    self.setState({ password: event.target.value, editHotelError: false });
                  }}
                />
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                  }
                </span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update hotel details</button>
            {self.state.editHotelError
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error editing the hotel, is that the correct wallet password?</p>
              : null}
          </div>
          : null}
        </form>

      var addHotelUnit =
        <form class="box" onSubmit={(e) => {e.preventDefault(); self.addHotelUnit()}}>
          <h3>
            Add Hotel Room
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{self.state.hotel.name}</h4>
          <hr></hr>
          {(self.state.addHotelUnitError)
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
            : null}
          {self.state.newUnitType ?
            <div class="form-group">
              <label>New Room Type</label>
              <input
                type="text"
                autoFocus="true"
                class="form-control"
                value={self.state.newUnit.type}
                onChange={(event) => {
                  var newUnit = self.state.newUnit;
                  newUnit.type = event.target.value
                  self.setState({ newUnit: newUnit });
                }}
              />
              <button class="btn btn-link" onClick={() => self.setState({newUnitType: false})}>
                Or pick an existing room type
              </button>
            </div>
          :
            <div class="form-group">
              <label>Room Type</label>
              <Select
                name="Hotels"
                clearable={false}
                value={self.state.newUnit}
                autoFocus="true"
                placeholder="Double Room"
                options={_.uniqBy(self.state.hotel.units, 'type')}
                labelKey="type"
                onChange={(val) => {
                  var newUnit = self.state.newUnit;
                  newUnit.type = val.type.replace(/\W+/g, "");
                  newUnit.value = val.type.replace(/\W+/g, "");
                  self.setState({ newUnit: newUnit });
                }}
              />
              <button class="btn btn-link" onClick={() => self.setState({newUnitType: true})}>
                Or create a new room type
              </button>
            </div>
          }
          <hr></hr>
          <div class="form-group">
            <label>Room name</label>
            <input
              type="text"
              class="form-control"
              placeholder="Privilege Double Room with Balcony"
              value={self.state.newUnit.name}
              onChange={(event) => {
                var newUnit = self.state.newUnit;
                newUnit.name = event.target.value
                self.setState({ newUnit: newUnit });
              }}
            />
          </div>
          <div class="form-group">
            <label>Room description</label>
            <input
              type="text"
              class="form-control"
              placeholder="A fancy and spacious room with the best amenities"
              value={self.state.newUnit.description}
              onChange={(event) => {
                var newUnit = self.state.newUnit;
                newUnit.description = event.target.value
                self.setState({ newUnit: newUnit });
              }}
            />
          </div>
          <div class="form-group">
            <label>Maximum Guests</label>
            <input
              type="number"
              class="form-control"
              value={self.state.newUnit.maxGuests}
              onChange={(event) => {
                var newUnit = self.state.newUnit;
                newUnit.maxGuests = event.target.value
                self.setState({ newUnit: newUnit });
              }}
            />
          </div>
          <div class="form-group">
            <label>Price</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Price per night, including taxes"
                value={self.state.newUnit.price}
                onChange={(event) => {
                  var newUnit = self.state.newUnit;
                  newUnit.price = event.target.value
                  self.setState({ newUnit: newUnit });
                }}
              />
              <div class="input-group-btn">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {self.state.newUnit.currency || 'USD'} <span class="caret"></span>
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                  <li onClick={() => {
                    var newUnit = self.state.newUnit;
                    newUnit.currency = 'USD'
                    self.setState({ newUnit: newUnit });
                  }}><a>USD</a></li>
                  <li onClick={() => {
                    var newUnit = self.state.newUnit;
                    newUnit.currency = 'Lif'
                    self.setState({ newUnit: newUnit });
                  }}><a>Lif</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={self.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={self.state.password}
                onChange={(event) => {
                  self.setState({ password: event.target.value, addHotelUnitError: false });
                }}
              />
              <span class="input-group-addon">
                {self.state.showPassword ?
                  <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                :
                  <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                }
              </span>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Add Hotel Room</button>
          {(self.state.addHotelUnitError)
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
            : null}
        </form>

      var editHotelUnit =
      <form class="box" onSubmit={(e) => {e.preventDefault(); self.editHotelUnit()}}>
        <h3>
          Edit Hotel Room
          <div class="pull-right">
            <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotels</button>
          </div>
        </h3>
        <h4>{self.state.hotel.name}</h4>
        <hr></hr>
        {(self.state.editHotelUnitError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
        <div class="form-group">
          <label>Room name</label>
          <input
            type="text"
            class="form-control"
            placeholder="Privilege Double Room with Balcony"
            autoFocus="true"
            value={self.state.editUnit.name}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.name = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Room description</label>
          <input
            type="text"
            class="form-control"
            placeholder="A fancy and spacious room with the best amenities"
            value={self.state.editUnit.description}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.description = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Max Guests</label>
          <input
            type="number"
            class="form-control"
            value={self.state.editUnit.maxGuests}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.maxGuests = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Price</label>
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              value={self.state.editUnit.price}
              onChange={(event) => {
                var editUnit = self.state.editUnit;
                editUnit.price = event.target.value
                self.setState({ editUnit: editUnit });
              }}
            />
            <div class="input-group-btn">
              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {self.state.editUnit.currency} <span class="caret"></span>
              </button>
              <ul class="dropdown-menu dropdown-menu-right">
                <li onClick={() => {
                  var editUnit = self.state.editUnit;
                  editUnit.currency = 'USD'
                  self.setState({ editUnit: editUnit });
                }}><a>USD</a></li>
                <li onClick={() => {
                  var editUnit = self.state.editUnit;
                  editUnit.currency = 'Lif'
                  self.setState({ editUnit: editUnit });
                }}><a>Lif</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Your Wallet Password</label>
          <div class="input-group">
            <input
              type={self.state.showPassword ? "text" : "password"}
              class="form-control"
              defaultValue={self.state.password}
              onChange={(event) => {
                self.setState({ password: event.target.value, editHotelUnitError: false });
              }}
            />
            <span class="input-group-addon">
              {self.state.showPassword ?
                <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
              :
                <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
              }
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Update Hotel Room</button>
        {(self.state.editHotelUnitError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
      </form>

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
            <Select
              name="Hotels"
              clearable={false}
              options={self.state.hotels}
              onChange={ (val) => self.loadHotel(val.value)}
              value={self.state.hotel.address}
            />
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
                          onClick={() => self.setState({section: 'addHotelUnit'})}>
                    + Hotel Room
                  </button>
                </div>
              </h3>
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="text-center">Type</th>
                    <th class="text-center">Name</th>
                    <th class="text-center">Description</th>
                    <th class="text-center">Guests</th>
                    <th class="text-center">Price</th>
                    <th class="text-center">Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {self.state.hotel.units.map(function(unit, i){
                    return (
                      <tr key={'unit'+i} class="pointer" onClick={() => console.log(unit)}>
                        <td class="text-center">{unit.type}</td>
                        <td class="text-center">{unit.name}</td>
                        <td class="shortCell">{unit.description}</td>
                        <td class="text-center">{unit.maxGuests}</td>
                        <td class="text-center">{unit.price}</td>
                        <td class="text-center">{unit.active}</td>
                        <td class="text-center">
                          <button class="btn btn-primary btn-sm"
                                  onClick={() => self.startEditHotelUnit(unit)}>
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
          <div class="box">
            <h2>Hotel Bookings</h2>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Room Type</th>
                  <th>Room Name</th>
                  <th>From Day</th>
                  <th>To Day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {self.state.bookings.map(function(booking, i){
                  return (
                    <tr key={'booking'+i} class="pointer" onClick={() => self.setState({transaction: booking})}>
                      <td>{booking.hotelName}</td>
                      <td>{booking.unitType}</td>
                      <td>{booking.unitName}</td>
                        <td>{wtUserLib.utils.formatDate(parseInt(booking.publicCall.params[2].value))}</td>
                        <td>{wtUserLib.utils.formatDate(parseInt(booking.publicCall.params[2].value)+parseInt(booking.publicCall.params[3].value))}</td>
                      <td>Accepted</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

      var blockchain =
        <div class="box">
          <h2>Transactions</h2>
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th style={{width: '30px'}}>Block</th>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
                <th style={{width: '30px'}}>Value</th>
                <th style={{width: '40px'}}>Gas</th>
                <th style={{width: '50px'}}>Function</th>
              </tr>
            </thead>
            <tbody>
              {self.state.txs.map(function(tx, i){
                return (
                  <tr key={'tx'+i} class="pointer" onClick={() => self.setState({transaction: tx})}>
                    <td style={{width: '30px'}}>{tx.blockNumber}</td>
                    <td class="shortCell">{tx.hash}</td>
                    <td class="shortCell">{tx.from}</td>
                    <td class="shortCell">{tx.to}</td>
                    <td style={{width: '30px'}}>{parseInt(tx.value)}</td>
                    <td style={{width: '40px'}}>{tx.gas}</td>
                    <td style={{width: '50px'}}>{tx.decoded ? tx.decoded.name : 'Common TX'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <hr />
          <div>
            <small>
              <div class="pull-left">
                Winding Tree index address: {self.state.indexAddress}
              </div>
              <div class="pull-right">
                <a onClick={() => self.deployIndex()}>Re-deploy Index</a>
              </div>
            </small>
            <div class="clearfix" />
          </div>
        </div>

      function decodeData(data){
        if (data)
          return(
            <div>
              <h4>Function: {data.name}</h4>
              {data.params.map(function(param, i){
                if (param.decoded){
                  return <h4 key={param.name+i}>{param.name}: <br></br>
                    <div style={{marginLeft: i*10}}>
                      {decodeData(param.decoded)}
                    </div>
                  </h4>;
                } else {
                  return <h4 key={param.name+i}>{param.name}: {param.value}</h4>;
                }
              })}
            </div>
          )
      }

      const modalTransaction =
        <ReactModal
          isOpen={this.state.transaction.hash}
          style={{
            content : {
              top                   : '40%',
              left                  : '50%',
              right                 : 'auto',
              bottom                : 'auto',
              marginRight           : '-50%',
              maxHeight             : '80%',
              transform             : 'translate(-50%, -50%)'
            }
          }}
        >
          <span class="fa fa-2x fa-times pull-right" onClick={() => this.setState({transaction: {}})}></span>
          <h3>Transaction <br></br> <small>{self.state.transaction.hash}</small></h3>
          <h4>From: {self.state.transaction.from}</h4>
          <h4>To: {self.state.transaction.to}</h4>
          <h4>Value: {parseInt(self.state.transaction.value)}</h4>
          <h4>Gas: {self.state.transaction.gas}</h4>
          {decodeData(self.state.transaction.decoded)}
        </ReactModal>

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <div class="row">
            {modalTransaction}
            <div class="col-md-2 text-center">
              {actions}
            </div>
            <div class="col-md-10">
              {self.state.section == 'blockchain' ?
                <div>{blockchain}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'edit' ?
                <div>{editHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'new' ?
                <div>{createHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'list' ?
                <div>{hotels}</div>
              : self.state.section == 'addHotelUnit' ?
                <div>{addHotelUnit}</div>
              : self.state.section == 'editHotelUnit' ?
                <div>{editHotelUnit}</div>
              : <div>{hotelBookings}</div>}
            </div>
          </div>
        </div>
      )
    }

}
