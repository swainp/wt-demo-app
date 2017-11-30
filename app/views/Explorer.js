import React from 'react';
import { Link } from 'react-router-dom';
import ReactModal from 'react-modal';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'react-responsive-carousel';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import BookUnit from '../components/BookUnit';
import { ToastContainer, toast } from 'react-toastify';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3PROVIDER));

import Select from 'react-select';
var _ = require('lodash');

let WTUtils = Utils;
console.log(WTUtils);

export default class App extends React.Component {

    constructor() {
      super();
      let keyStore;
      if(window.localStorage.wallet) {
        keyStore = JSON.parse(window.localStorage.wallet);
      }
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        hotels: [],
        totalHotels: 0,
        hotelOptions: [],
        hotel: {
          address: '0x0000000000000000000000000000000000000000',
          name: '',
          country: '',
          lineOne: '',
          description: '',
          manager: '',
          latitude: '',
          longitude: '',
          waitConfirmation: '',
          units: [],
          unitTypes: [],
          images: []
        },
        unitType: {
          address: '0x0000000000000000000000000000000000000000',
          images: []
        },
        unitSelected: {
          address: '0x0000000000000000000000000000000000000000'
        },
        txs: [],
        transaction: {},
        importKeystore: keyStore,
        section: 'hotels',
        hotelSection: 'list',
        hotelManager: {},
        loading: false
      }
    }

    async componentWillMount() {
        let address = (this.state.importKeystore ? this.state.importKeystore.address : '0x0000000000000000000000000000000000000000');
        let hotelManager = new HotelManager({
          indexAddress: window.localStorage.wtIndexAddress || WTINDEXADDRESS,
          owner: address,
          web3: web3,
          gasMargin: 1.5
        });
        hotelManager.setWeb3(web3);
        let bookingData = new BookingData(web3);
        let user = new User({
          account: address,       // Client's account address
          gasMargin: 2,               // Multiple to increase gasEstimate by to ensure tx success.
          tokenAddress: window.localStorage.lifTokenAddress || LIFTOKENADDRESS,  // LifToken contract address
          web3: web3                     // Web3 object instantiated with a provider
        })
        await this.setState({hotelManager: hotelManager, bookingData: bookingData, user: user});
        await this.loadHotels();
        console.log('HM:', hotelManager);
        console.log('Web3:', web3);
        console.log('Hotels:', this.state.hotels);
    }

    async loadHotels() {
      var self = this;
      self.setState({loading: true});
      var hotelsAddrs = await self.state.hotelManager.WTIndex.methods.getHotels().call();
      hotelsAddrs = hotelsAddrs.filter(addr => addr !== "0x0000000000000000000000000000000000000000");
      var hotels = [];
      let totalHotels = hotelsAddrs.length-1;
      for (var i = 1; i <= totalHotels; i++)
        hotels.push(await self.getHotelInfo(hotelsAddrs[i]));
      self.setState({
        hotels: hotels,
        totalHotels: totalHotels,
        loading: false
      });
    }

    async getHotelInfo(hotelAddr) {
      var self = this;
      var hotelInstance = WTUtils.getInstance('Hotel', hotelAddr, self.state.hotelManager.context);
      return {
        instance: hotelInstance,
        name: await hotelInstance.methods.name().call(),
      };
    }

    async loadHotelInfo(hotelAddr) {
      var self = this;
      self.setState({
        loading: true,
        hotel: {
          address: hotelAddr,
          name: '',
          country: '',
          lineOne: '',
          description: '',
          manager: '',
          latitude: '',
          longitude: '',
          waitConfirmation: '',
          units: [],
          unitTypes: [],
          images: []
        },
        unitType: {
          address: '0x0000000000000000000000000000000000000000',
          images: []
        },
        unitSelected: {
          address: '0x0000000000000000000000000000000000000000'
        },
        section: 'hotels'
      });
      const hotelInfo = await WTUtils.getHotelInfo(
        WTUtils.getInstance('Hotel', hotelAddr, self.state.hotelManager.context),
        self.state.hotelManager.context
      );
      const unitTypesArray = [];
      const unitArray = [];
      hotelInfo.totalUnits = 0;
      for (var unit in hotelInfo.units){
        hotelInfo.units[unit].address = unit;
        unitArray.push(hotelInfo.units[unit]);
        if (!hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits)
          hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits = 1;
        else
          hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits ++;
        hotelInfo.totalUnits ++;
      }
      for (var unitType in hotelInfo.unitTypes){
        hotelInfo.unitTypes[unitType].name = unitType;
        if (!hotelInfo.unitTypes[unitType])
          hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits = 0;
        unitTypesArray.push(hotelInfo.unitTypes[unitType]);
      }
      hotelInfo.unitTypes = unitTypesArray;
      hotelInfo.units = unitArray;
      hotelInfo.address = hotelAddr;
      console.log('Hotel information:',hotelInfo);
      self.setState({
        hotel: hotelInfo,
        loading: false
      });
    }

    async updateBookingPrice(startDate, endDate) {
      let self = this;
      self.setState({startDate: startDate, endDate: endDate, bookPrice: '...', bookLifPrice: '...'});
      if(startDate && endDate && endDate.isSameOrAfter(startDate)) {
        let available = await self.state.bookingData.unitIsAvailable(self.state.unitSelected.address, startDate.toDate(), endDate.diff(startDate, 'days'));
        let cost = await self.state.bookingData.getCost(self.state.unitSelected.address, startDate.toDate(), endDate.diff(startDate, 'days'));
        let lifCost = await self.state.bookingData.getLifCost(self.state.unitSelected.address, startDate.toDate(), endDate.diff(startDate, 'days'));
        self.setState({ bookPrice: cost, bookLifPrice: lifCost, unitAvailable: available});
      }
    }

    async bookRoom(password) {
      var self = this;
      self.setState({loading: true});

      //async book(hotelAddress: Address, unitAddress: Address, fromDate: Date, daysAmount: Number, guestData: String): Promievent
      //async bookWithLif(hotelAddress: Address, unitAddress: Address, fromDate: Date, daysAmount: Number, guestData: String): Promievent
      let args = [
        self.state.hotel.address,
        self.state.unitSelected.address,
        self.state.startDate,
        self.state.endDate.diff(self.state.startDate, 'days'),
        'guestData'
      ]

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], password);
        if(self.state.currency === 'lif') {
          await self.state.user.bookWithLif(...args);
        } else {
          await self.state.user.book(...args);
        }
        self.setState({loading: false });
        if(self.state.hotel.waitConfirmation) {
          toast.success('Successfully requested to book ' + self.state.unitSelected.unitType + ' from ' + self.state.startDate.format('YYYY MM DD') + ' to ' + self.state.endDate.format('YYYY MM DD'));
        } else {
          toast.success('Successfully booked ' + self.state.unitSelected.unitType + ' from ' + self.state.startDate.format('YYYY MM DD') + ' to ' + self.state.endDate.format('YYYY MM DD'));
        }
      } catch(e) {
        console.log("Error booking a room", e);
        self.setState({loading: false});
        toast.error(e);
      }
    }

    render() {
      var self = this;

      var hotelsSection =
        <div>
          <div class='row'>
            <div class='col-md-12 text-center'>
              <h3>{self.state.totalHotels} Hotels in WT</h3>
            </div>
          </div>
          <hr></hr>
          <div class='row'>
            <div class='col-6'>
              <div class='list-group'>
              {self.state.hotels.map((hotel, i) => {
                return <a
                  key={hotel.instance._address}
                  href='#'
                  class={hotel.instance._address == self.state.hotel.address ?
                    'list-group-item list-group-item-action active' :
                    'list-group-item list-group-item-action'
                  }
                  onClick={() => {
                    self.loadHotelInfo(hotel.instance._address)
                  }}
                >
                  [{(i+1)}] {hotel.name} - <small>{hotel.instance._address}</small>
                </a>
              })}
              </div>
            </div>
            <div class={self.state.loading ? 'col-6 loading' : 'col-6'}>
              <ul>
                {self.state.hotel.name.length > 0 ?
                  <li>Name: {self.state.hotel.name}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li>Manager: {self.state.hotel.manager}</li>
                  : <div></div>
                }
                {self.state.hotel.country ?
                  <li>Country: {self.state.hotel.country}</li>
                  : <div></div>
                }
                {self.state.hotel.lineOne ?
                  <li>Address: {self.state.hotel.lineOne}</li>
                  : <div></div>
                }
                {self.state.hotel.latitude && self.state.hotel.longitude ?
                  <li>GPS: {self.state.hotel.latitude} {self.state.hotel.longitude}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li>Instant Booking: {self.state.hotel.waitConfirmation ? 'Yes' : 'No'}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li>Total Units: {self.state.hotel.totalUnits}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <div type="button" class="btn btn-primary" onClick={() => self.setState({section: 'unitTypes'})} >
                    View Unit unitTypes
                  </div>
                  : <div></div>
                }
              </ul>
              {self.state.hotel.description.length > 0 ?
                <div>
                  <hr></hr>
                  {self.state.hotel.description}
                </div>
                : <div></div>
              }
            </div>
          </div>
          {self.state.hotel.images.length > 0 ?
            <div>
              <br></br>
              <Carousel showArrows={true} infiniteLoop={true} >
              {self.state.hotel.images.map(function(src, i){
                return <div key={self.state.hotel.address+'Image'+i}><img src={src} /></div>;
              })}
              </Carousel>
            </div>
            : <div></div>
          }
        </div>

      var unitTypesSection =
        <div>
          <div class="pull-right">
            <div type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels'})} >
              Back to Hotels
            </div>
          </div>
          <div class='row'>
            <div class='col-6'>
              <div class='list-group'>
              {self.state.hotel.unitTypes.map((unitType, i) => {
                return <a
                  key={unitType.name}
                  href='#'
                  class={unitType.address == self.state.unitType.address ?
                    'list-group-item list-group-item-action active' :
                    'list-group-item list-group-item-action'
                  }
                  onClick={() => {
                    self.setState({unitType: unitType, section: 'unitTypes'})}
                  }
                >
                  {unitType.name} - <small>{unitType.address}</small>
                </a>
              })}
              </div>
            </div>
            {self.state.unitType.address != '0x0000000000000000000000000000000000000000' ?
              <div class='col-6'>
                <ul>
                  <li>Name: {self.state.unitType.name}</li>
                  <li>Minimun Guests: {self.state.unitType.info.minGuests}</li>
                  <li>Maximun Guests: {self.state.unitType.info.maxGuests}</li>
                  <li>Instant Booking: {self.state.hotel.waitConfirmation ? 'Yes' : 'No'}</li>
                  <li>Total Units: {self.state.unitType.totalUnits}</li>
                </ul>
                <div type="button" class="btn btn-primary" onClick={() => self.setState({section: 'units'})} >
                  View Units
                </div>
                {self.state.unitType.info.description ?
                  <div>
                    <hr></hr>
                    {self.state.unitType.info.description}
                  </div>
                  : <div></div>
                }
              </div>
            :
              <div></div>
            }
          </div>
          {self.state.unitType.images.length > 0 ?
            <div>
              <br></br>
              <Carousel showArrows={true} infiniteLoop={true} >
              {self.state.unitType.images.map(function(src, i){
                return <div key={self.state.unitType.address+'Image'+i}><img src={src} /></div>;
              })}
              </Carousel>
            </div>
            : <div></div>
          }
        </div>;

      let currencyOptions = [{value: 'lif', label: 'Lif'}, {value: 'fiat', label: 'Fiat'}];

      var unitsSection =
        <div>
          <div class="pull-right">
            <div type="button" class="btn btn-link" onClick={() => self.setState({section: 'unitTypes'})} >
              Back to Unit Types
            </div>
          </div>
          <div class='row'>
            <div class='col-8'>
              <div class='list-group'>
              {self.state.hotel.units.map((unit, i) => {
                if (self.state.unitType.name == unit.unitType)
                  return <a
                    key={unit.address}
                    href='#'
                    class={unit.address == self.state.unitSelected.address ?
                      'list-group-item list-group-item-action active' :
                      'list-group-item list-group-item-action'
                    }
                    onClick={() => {
                      self.setState({unitSelected: unit })}
                    }
                  >
                    [{i}] {unit.unitType} - <small>{unit.address}</small>
                  </a>
              })}
              </div>
            </div>
            {self.state.unitSelected.address != '0x0000000000000000000000000000000000000000' ?
              <div class='col-4'>
                {self.state.user.account != '0x0000000000000000000000000000000000000000' ?
                  <BookUnit
                    waitConfirmation={self.state.hotel.waitConfirmation}
                    startDate={self.state.startDate}
                    endDate={self.state.endDate}
                    bookLifPrice={self.state.bookLifPrice}
                    bookPrice={self.state.bookPrice}
                    available={self.state.unitAvailable}
                    currency={self.state.currency}
                    currencyOptions={currencyOptions}
                    onDatesChange={self.updateBookingPrice.bind(self)}
                    onCurrencyChange={(val) => self.setState({currency: val})}
                    onSubmit={self.bookRoom.bind(self)}
                  />
                :
                <Link to='/wallet'>Please create a wallet</Link>}
              </div>
            :
              <div></div>
            }
          </div>
        </div>;

      return(
        <div class='row justify-content-md-center'>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class='col-md-10'>
            <div class={self.state.loading ? 'jumbotron loading' : 'jumbotron'}>
              { self.state.section == 'unitTypes' ?
                unitTypesSection
              : self.state.section == 'units' ?
                unitsSection
              : hotelsSection
              }
            </div>
          </div>
        </div>
      )
    }

}
