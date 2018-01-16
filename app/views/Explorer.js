
import React from 'react';
import { Link } from 'react-router-dom';
import ReactModal from 'react-modal';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'react-responsive-carousel';

import moment from 'moment';
import DateRangePicker from 'react-dates/lib/components/DateRangePicker';
import BookUnit from '../components/BookUnit';
import Address from '../components/Address';
import { ToastContainer, toast } from 'react-toastify';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

import Select from 'react-select';
var _ = require('lodash');

let WTUtils = Utils;

const hotelsPerPage = 5;

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
        hotelsPage: 1,
        totalPages: 0,
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
          indexAddress: window.localStorage.wtIndexAddress || WT_INDEXES[WT_INDEXES.length-1].address,
          owner: address,
          web3: web3,
          gasMargin: 1.5
        });
        hotelManager.setWeb3(web3);
        let bookingData = new BookingData(web3);
        let user = new User({
          account: address,       // Client's account address
          gasMargin: 2,               // Multiple to increase gasEstimate by to ensure tx success.
          tokenAddress: window.localStorage.lifTokenAddress || LIFTOKEN_ADDRESS,  // LifToken contract address
          web3: web3                     // Web3 object instantiated with a provider
        })
        await this.setState({hotelManager: hotelManager, bookingData: bookingData, user: user});
        await this.loadHotels(1);
        console.log('HM:', hotelManager);
        console.log('Web3:', web3);
        console.log('Hotels:', this.state.hotels);
    }

    async loadHotels(page) {
      var self = this;
      self.setState({loading: true});
      var hotelsAddrs = await self.state.hotelManager.WTIndex.methods.getHotels().call();
      hotelsAddrs = hotelsAddrs.filter(addr => addr !== "0x0000000000000000000000000000000000000000");
      var hotels = [];
      let totalHotels = hotelsAddrs.length;
      const startIndex = (page - 1) * hotelsPerPage;
      const endIndex = ((startIndex + hotelsPerPage) > totalHotels) ? totalHotels : (startIndex + hotelsPerPage);
      for (var i = startIndex; i < endIndex; i++)
        hotels.push(await self.getHotelInfo(hotelsAddrs[i]));
      console.log('Total hotels:', totalHotels);
      self.setState({
        hotels: hotels,
        totalHotels: totalHotels,
        hotelsPage: page,
        totalPages: (totalHotels / hotelsPerPage),
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
          <div class="card" style={{position: 'sticky', top: 120}}>
            <div class="card-header">
              {self.state.hotel.name.length > 0 ?
                <h3 class="mb-0">
                  {self.state.hotel.name}
                </h3>
                :
                <h3 class="mb-0">Choose a Hotel</h3>
              }
            </div>
            <div class="card-body">

              {/* If No Data */}
              {self.state.hotel.name.length <= 0 &&
                <p class="mb-0">Please, select a hotel from the list.</p>
              }

              {/* If Has Data */}
              <ul class={self.state.hotel.name.length <= 0 ? 'mb-0' : ''}>
                {self.state.hotel.name.length > 0 ?
                  <li>
                    <p class="mb-xs"><b>Name:</b> {self.state.hotel.name}</p>
                  </li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li>
                    <p class="mb-xs">
                      <b>Address:</b> <Address address={self.state.hotel.address} web3={web3}/>
                      <small class="text-muted"> <i class="fa fa-external-link" aria-hidden="true"></i></small>
                    </p>
                  </li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li>
                    <p class="mb-xs">
                      <b>Manager:</b> <Address address={self.state.hotel.manager} web3={web3}/>
                      <small class="text-muted"> <i class="fa fa-external-link" aria-hidden="true"></i></small>
                    </p>
                  </li>
                  : <div></div>
                }
                {self.state.hotel.country ?
                  <li>
                    <p class="mb-xs"><b>Country:</b> {self.state.hotel.country}</p>
                  </li>
                  : <div></div>
                }
                {self.state.hotel.lineOne ?
                  <li>
                    <p class="mb-xs"><b>Address:</b> {self.state.hotel.lineOne}</p>
                  </li>
                  : <div></div>
                }
                {self.state.hotel.latitude && self.state.hotel.longitude ?
                  <li><p class="mb-xs"><b>GPS:</b> {self.state.hotel.latitude} {self.state.hotel.longitude}</p></li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li><p class="mb-xs"><b>Instant Booking:</b> {self.state.hotel.waitConfirmation ? 'Yes' : 'No'}</p></li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <li><p><b>Total Units:</b> {self.state.hotel.totalUnits}</p></li>
                  : <div></div>
                }
                {(self.state.hotel.address != '0x0000000000000000000000000000000000000000'
                  && !self.state.loading) ?
                  <div>
                    <div type="button" class="btn btn-sm btn-light" onClick={() => self.setState({section: 'unitTypes'})} >
                      View Unit unitTypes
                    </div>
                    <hr/>
                  </div>
                  : <div></div>
                }
              </ul>

              {/* Hotel Description */}
              {self.state.hotel.description.length > 0 ?
                <div class="lead">
                  {self.state.hotel.description}
                </div>
                : <div></div>
              }

              {/* Hotel Images */}
              {self.state.hotel.images.length > 0 && <hr/>}
              {self.state.hotel.images.length > 0 ?
                <div class="col-sm-12 col-md-8 col-lg-6">
                  <Carousel showArrows={true} infiniteLoop={true} >
                  {self.state.hotel.images.map(function(src, i){
                    return <div key={self.state.hotel.address+'Image'+i}><img src={src} /></div>;
                  })}
                  </Carousel>
                </div>
                : <div></div>
              }
            </div>
          </div>

      var unitTypesSection =
      <div class="card" style={{position: 'sticky', top: 120}}>


        <div class="card-header">
          <div class="row align-items-center">
            <div class="col">
              <h3 class="mb-0">{self.state.hotel.name + ': Unit types '}</h3>
            </div>
            <div class="col text-right">
              <button title="Cancel" class="btn btn-light" onClick={() => self.setState({section: 'hotels'})}>
                <i class="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="card-body">

          <p>Choose a unit type to see its data.</p>

          <div class='row'>
            <div class='col-3'>
              <div class='list-group'>
              {self.state.hotel.unitTypes.map((unitType, i) => {
                return <a
                  key={unitType.name}
                  class={unitType.address == self.state.unitType.address ?
                    'list-group-item list-group-item-action active' :
                    'list-group-item list-group-item-action'
                  }
                  onClick={() => {
                    self.setState({unitType: unitType, section: 'unitTypes'})}
                  }
                >
                  {unitType.name}
                </a>
              })}
              </div>
            </div>
            {self.state.unitType.address != '0x0000000000000000000000000000000000000000' ?
              <div class='col-9'>
                <ul>
                  <li class="mb-xs"><b>Name:</b> {self.state.unitType.name}</li>
                  <li class="mb-xs"><b>Address:</b> <Address address={self.state.unitType.address} web3={web3}/></li>
                  <li class="mb-xs"><b>Minimun Guests:</b> {self.state.unitType.info.minGuests}</li>
                  <li class="mb-xs"><b>Maximun Guests:</b> {self.state.unitType.info.maxGuests}</li>
                  <li class="mb-xs"><b>Instant Booking:</b> {self.state.hotel.waitConfirmation ? 'Yes' : 'No'}</li>
                  <li class="mb-xs"><b>Total Units:</b> {self.state.unitType.totalUnits}</li>
                </ul>
                <div type="button" class="btn btn-sm btn-light" onClick={() => self.setState({section: 'units'})} >
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
              <Carousel showArrows={true} infiniteLoop={true} >
              {self.state.unitType.images.map(function(src, i){
                return <div key={self.state.unitType.address+'Image'+i}><img src={src} /></div>;
              })}
              </Carousel>
            </div>
            : <div></div>
          }

        </div>

      </div>;

      let currencyOptions = [{value: 'lif', label: 'Lif'}, {value: 'fiat', label: 'Fiat'}];

      var unitsSection =
      <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="mb-0">{self.state.hotel.name + ': Units '}</h3>
              </div>
              <div class="col text-right">
                <button title="Cancel" class="btn btn-light" onClick={() => self.setState({
                  section: 'unitTypes',
                  unitSelected: {
                    address: '0x0000000000000000000000000000000000000000'
                  }
                })}>
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>


          <div class='card-body'>
            <p>Choose a unit to see its data.</p>
            <div class='row'>
              <div class='col-3'>
                <div class='list-group'>
                {self.state.hotel.units.map((unit, i) => {
                  if (self.state.unitType.name == unit.unitType)
                    return <a
                      key={unit.address}
                      class={unit.address == self.state.unitSelected.address ?
                        'list-group-item list-group-item-action active' :
                        'list-group-item list-group-item-action'
                      }
                      onClick={() => {
                        self.setState({unitSelected: unit })}
                      }
                    >
                      #{i+1}
                    </a>
                })}
                </div>
              </div>
              {self.state.unitSelected.address != '0x0000000000000000000000000000000000000000' ?
                <div class='col-9'>
                  {self.state.user.account != '0x0000000000000000000000000000000000000000' ?
                    <div>
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
                      ></BookUnit>
                      <br/>
                      <p>
                        <b>Address: </b><Address address={self.state.unitSelected.address} web3={web3}/>
                      </p>
                    </div>
                  :
                  <Link to='/wallet'>Please create a wallet</Link>}
                </div>
              :
                <div></div>
              }
            </div>
          </div>

        </div>;

      return(
        <div class={"row justify-content-center " + (self.state.loading ? 'loading' : '')}>
          <ToastContainer style={{zIndex: 2000}}/>
          <div class="col-sm-11">

            {/* Page Header */}
            <div class="row">
              <div class="col">
                <h1>Hotels registered in WT</h1>
                <p class="lead">Review the hotels data, including unit types and rooms.</p>
                <hr/>
              </div>
            </div>

            <div class="row">
              <div class="col">

                {/* Hotels Menu */}
                <div class='row'>
                  <div class='col-sm-7 col-md-6 col-lg-5'>
                    <div class='list-group'>
                    {self.state.hotels.map((hotel, i) => {
                      const hotelIndex = ((self.state.hotelsPage - 1) * hotelsPerPage) + i + 1;
                      return <a
                        key={hotel.instance._address}
                        class={hotel.instance._address == self.state.hotel.address ?
                          'list-group-item list-group-item-action active  text-ellipsis' :
                          'list-group-item list-group-item-action  text-ellipsis'
                        }
                        onClick={() => {
                          self.loadHotelInfo(hotel.instance._address)
                        }}
                      >
                        <span class="list-group-item-number">{hotelIndex}</span> {hotel.name}
                      </a>
                    })}
                    </div>
                    {self.state.totalPages > 0 &&
                      <nav aria-label="Page navigation example">
                        <ul class="pagination justify-content-center">
                          {self.state.hotelsPage > 1 &&
                            <li class="page-item" onClick={() => self.loadHotels(self.state.hotelsPage-1)}>
                              <a class="page-link"><span class="fa fa-arrow-left"></span></a>
                            </li>
                          }
                          {[...Array(self.state.totalHotels)].map((x, i) => {
                            i ++;
                            return <li
                              class={(i == self.state.hotelsPage) ? "page-item active" : "page-item"}
                              onClick={() => self.loadHotels(i)}
                            ><a class="page-link" >{i}</a></li>;
                          })}
                          {self.state.hotelsPage < self.state.totalPages &&
                            <li class="page-item" onClick={() => self.loadHotels(self.state.hotelsPage+1)}>
                              <a class="page-link"><span class="fa fa-arrow-right"></span></a>
                            </li>
                          }
                        </ul>
                      </nav>
                    }
                  </div>

                  <div class='col-sm-5 col-md-6 col-lg-7'>
                    { self.state.section == 'unitTypes' ?
                      unitTypesSection
                    : self.state.section == 'units' ?
                      unitsSection
                    : hotelsSection
                    }
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>


      )
    }

}
