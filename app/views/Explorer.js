import React from 'react';
import {Link} from 'react-router';
import ReactModal from 'react-modal';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'react-responsive-carousel';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import BookUnit from '../components/BookUnit';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

import Select from 'react-select';
var _ = require('lodash');

let WTUtils = Utils;
console.log(WTUtils);

export default class App extends React.Component {

    constructor() {
      super();
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
        importKeystore: JSON.parse(window.localStorage.wallet) || '',
        loading: true,
        section: 'hotels',
        hotelSection: 'list',
        hotelManager: {},
        loadingHotel: false
      }
    }

    async componentWillMount() {
      if (
        window.localStorage.wtIndexAddress
        && window.localStorage.wtIndexAddress.length > 0
        && web3.eth.getCode(window.localStorage.wtIndexAddress) != '0x0'
      ) {
        let hotelManager = new HotelManager({
          indexAddress: window.localStorage.wtIndexAddress,
          owner: JSON.parse(window.localStorage.wallet).address,
          web3: web3,
          gasMargin: 1.5
        });
        hotelManager.setWeb3(web3);
        let bookingData = new BookingData(web3);
        let user = new User({
          account: JSON.parse(window.localStorage.wallet).address,       // Client's account address
          gasMargin: 2,               // Multiple to increase gasEstimate by to ensure tx success.
          tokenAddress: window.localStorage.lifTokenAddress,  // LifToken contract address
          web3: web3                     // Web3 object instantiated with a provider
        })
        await this.setState({hotelManager: hotelManager, bookingData: bookingData, user: user});
        await this.loadHotels();
        console.log('HM:', hotelManager);
        console.log('Web3:', web3);
        console.log('Hotels:', this.state.hotels);
      } else
        window.location.replace(window.location.origin+'/#/');
    }

    async loadHotels() {
      var self = this;
      self.setState({loadingHotel: true});
      var hotelsAddrs = await self.state.hotelManager.WTIndex.methods.getHotels().call();
      var hotels = [];
      let totalHotels = hotelsAddrs.length-1;
      for (var i = 1; i <= totalHotels; i++)
        hotels.push(await self.getHotelInfo(hotelsAddrs[i]));
      self.setState({
        hotels: hotels,
        totalHotels: totalHotels,
        loadingHotel: false
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
        loadingHotel: true,
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
        }
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
        hotelInfo.unitTypes[unitType].images = [
          'https://github.com/windingtree/media/blob/master/640x360.png?raw=true',
          'https://github.com/windingtree/media/blob/master/640x360.png?raw=true',
          'https://github.com/windingtree/media/blob/master/640x360.png?raw=true'
        ];
        if (!hotelInfo.unitTypes[unitType])
          hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits = 0;
        unitTypesArray.push(hotelInfo.unitTypes[unitType]);
      }
      hotelInfo.unitTypes = unitTypesArray;
      hotelInfo.units = unitArray;
      hotelInfo.address = hotelAddr;
      hotelInfo.images.push('https://github.com/windingtree/media/blob/master/820x312.png?raw=true');
      hotelInfo.images.push('https://github.com/windingtree/media/blob/master/820x312.png?raw=true');
      hotelInfo.images.push('https://github.com/windingtree/media/blob/master/820x312.png?raw=true');
      console.log('Hotel information:',hotelInfo);
      self.setState({
        hotel: hotelInfo,
        loadingHotel: false
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
        self.setState({loading: false })
      } catch(e) {
        console.log("Error booking aroom", e);
        self.setState({loading: false});
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
            <div class={self.state.loadingHotel ? 'col-6 loading' : 'col-6'}>
              <ul>
                {self.state.hotel.name.length > 0 ?
                  <li>Name: {self.state.hotel.name}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loadingHotel) ?
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
                  && !self.state.loadingHotel) ?
                  <li>Instant Booking: {self.state.hotel.waitConfirmation ? 'Yes' : 'No'}</li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loadingHotel) ?
                  <li>Total Units: {self.state.hotel.totalUnits}</li>
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
          <hr></hr>
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
                    self.setState({unitType: unitType })}
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
          <hr></hr>
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
          </div>
          {self.state.unitSelected.address != '0x0000000000000000000000000000000000000000' ?
          <div>
            <hr></hr>
            <div class='row'>
              <div class='col-8'>
                  <BookUnit
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
              </div>
            </div>
          </div>
          :
            <div></div>
          }
        </div>;

      return(
        <div class='row justify-content-md-center'>
          <div class='col-md-10'>
            <div class='jumbotron'>
              {hotelsSection}
              {self.state.hotel.address != '0x0000000000000000000000000000000000000000' &&
                !self.state.loadingHotel ?
                  unitTypesSection
                : <div></div>
              }
              {self.state.unitType.address != '0x0000000000000000000000000000000000000000' &&
                !self.state.loadingHotel ?
                  unitsSection
                : <div></div>
              }
            </div>
          </div>
        </div>
      )
    }

}
