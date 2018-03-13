import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import { ToastContainer, toast } from 'react-toastify';

import BookUnit from '../components/BookUnit';
import Address from '../components/Address';

import { web3provider, HotelManager, BookingData, User } from '../services/web3provider';
import config from '../services/config';

const hotelsPerPage = 5;

export default class Explorer extends React.Component {
  constructor () {
    super();
    let keyStore;
    if (window.localStorage.wallet) {
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
        images: [],
      },
      unitType: {
        address: '0x0000000000000000000000000000000000000000',
        images: [],
      },
      unitSelected: {
        address: '0x0000000000000000000000000000000000000000',
      },
      unitAvailability: {},
      txs: [],
      transaction: {},
      importKeystore: keyStore,
      section: 'hotels',
      hotelSection: 'list',
      hotelManager: {},
      hotelManagerSection: 'hotels',
      loading: false,
    };
    this.loadHotels = this.loadHotels.bind(this);
    this.getHotelInfo = this.getHotelInfo.bind(this);
    this.loadHotelInfo = this.loadHotelInfo.bind(this);
    this.updateBookingPrice = this.updateBookingPrice.bind(this);
    this.bookRoom = this.bookRoom.bind(this);
  }

  async componentWillMount () {
    let address = (this.state.importKeystore ? this.state.importKeystore.address : '0x0000000000000000000000000000000000000000');
    let hotelManager = new HotelManager({
      indexAddress: window.localStorage.wtIndexAddress || config.get('WT_INDEXES')[config.get('WT_INDEXES').length - 1].address,
      owner: address,
      web3provider: web3provider,
      gasMargin: config.get('GAS_MARGIN'),
    });
    let bookingData = new BookingData({
      web3provider: web3provider,
    });
    let user = new User({
      account: address, // Client's account address
      gasMargin: config.get('GAS_MARGIN'),
      tokenAddress: window.localStorage.lifTokenAddress || config.get('LIFTOKEN_ADDRESS'), // LifToken contract address
      web3provider: web3provider,
    });
    await this.setState({ hotelManager: hotelManager, bookingData: bookingData, user: user });
    await this.loadHotels(1);
    console.log('HM:', hotelManager);
    console.log('Web3:', web3provider.web3);
    console.log('Hotels:', this.state.hotels);
  }

  async loadHotels (page) {
    this.setState({ loading: true });
    let hotelsAddrs = await this.state.hotelManager.getIndexInstance().methods.getHotels().call();
    hotelsAddrs = hotelsAddrs.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
    const hotels = [];
    const totalHotels = hotelsAddrs.length;
    const startIndex = (page - 1) * hotelsPerPage;
    const endIndex = ((startIndex + hotelsPerPage) > totalHotels) ? totalHotels : (startIndex + hotelsPerPage);
    for (var i = startIndex; i < endIndex; i++) {
      hotels.push(await this.getHotelInfo(hotelsAddrs[i]));
    }
    console.log('Total hotels:', totalHotels);
    this.setState({
      hotels: hotels,
      totalHotels: totalHotels,
      hotelsPage: page,
      totalPages: (totalHotels / hotelsPerPage),
      loading: false,
    });
  }

  async getHotelInfo (hotelAddr) {
    var hotelInstance = web3provider.contracts.getHotelInstance(hotelAddr);
    return {
      instance: hotelInstance,
      name: await hotelInstance.methods.name().call(),
    };
  }

  async loadHotelInfo (hotelAddr) {
    this.setState({
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
        images: [],
      },
      unitType: {
        address: '0x0000000000000000000000000000000000000000',
        images: [],
      },
      unitSelected: {
        address: '0x0000000000000000000000000000000000000000',
      },
      section: 'hotels',
    });
    const hotelInfo = await web3provider.data.getHotelInfo(web3provider.contracts.getHotelInstance(hotelAddr));
    const unitTypesArray = [];
    const unitArray = [];
    hotelInfo.totalUnits = 0;
    for (var unit in hotelInfo.units) {
      hotelInfo.units[unit].address = unit;
      unitArray.push(hotelInfo.units[unit]);
      if (!hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits) { hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits = 1; } else { hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits++; }
      hotelInfo.totalUnits++;
    }
    for (var unitType in hotelInfo.unitTypes) {
      hotelInfo.unitTypes[unitType].name = unitType;
      if (!hotelInfo.unitTypes[unitType]) { hotelInfo.unitTypes[hotelInfo.units[unit].unitType].totalUnits = 0; }
      unitTypesArray.push(hotelInfo.unitTypes[unitType]);
    }
    hotelInfo.unitTypes = unitTypesArray;
    hotelInfo.units = unitArray;
    hotelInfo.address = hotelAddr;
    console.log('Hotel information:', hotelInfo);
    this.setState({
      hotel: hotelInfo,
      loading: false,
    });
  }

  async updateBookingPrice (startDate, endDate) {
    const { unitSelected: { address }, bookingData } = this.state;
    this.setState({ startDate, endDate, bookPrice: '...', bookLifPrice: '...' });
    if (startDate && endDate && endDate.isSameOrAfter(startDate)) {
      const bookingDays = endDate.diff(startDate, 'days');
      const available = await bookingData.unitIsAvailable(this.state.hotel.address, address, startDate.toDate(), bookingDays);
      const cost = await bookingData.getCost(this.state.hotel.address, address, startDate.toDate(), bookingDays);
      const lifCost = await bookingData.getLifCost(this.state.hotel.address, address, startDate.toDate(), bookingDays);
      this.setState({ bookPrice: cost, bookLifPrice: lifCost, unitAvailable: available });
    }
  }

  async bookRoom (password) {
    const bookingDescription = `${this.state.unitSelected.unitType} from ${this.state.startDate.format('YYYY MM DD')} to ${this.state.endDate.format('YYYY MM DD')}`;

    // async book(hotelAddress: Address, unitAddress: Address, fromDate: Date, daysAmount: Number, guestData: String): Promievent
    // async bookWithLif(hotelAddress: Address, unitAddress: Address, fromDate: Date, daysAmount: Number, guestData: String): Promievent
    let args = [
      this.state.hotel.address,
      this.state.unitSelected.address,
      this.state.startDate,
      this.state.endDate.diff(this.state.startDate, 'days'),
      'guestData',
      this.props.getCallbacks((this.state.hotel.waitConfirmation ? 'request to book ' + bookingDescription : 'to book ' + bookingDescription)),
    ];

    try {
      web3provider.web3.eth.accounts.wallet.decrypt([this.state.importKeystore], password);
      if (this.state.currency === 'lif') {
        this.state.user.bookWithLif(...args);
      } else {
        this.state.user.book(...args);
      }

      // if(this.state.hotel.waitConfirmation) {
      //   toast.success(`Successfully requested to book ${bookingDescription}`);
      // } else {
      //   toast.success(`Successfully booked ${bookingDescription}`);
      // }
    } catch (e) {
      console.log('Error booking a room', e);
      toast.error(e);
    }
  }

  // day - Moment Object
  async getUnitAvailability (unitAddress, day) {
    let monthlyAvailability = await this.state.bookingData.unitMonthlyAvailability(this.state.hotel.address, unitAddress, day);
    console.log('monthlyAvailability');
    console.log(monthlyAvailability);
    let unitAvailability = this.state.unitAvailability;
    if (!unitAvailability[unitAddress]) {
      unitAvailability[unitAddress] = {};
    }
    unitAvailability[unitAddress][day.format('YYYYMM')] = monthlyAvailability;
    this.setState({ unitAvailability: unitAvailability });
  }

  render () {
    const { hotels, hotelsPage, hotel, loading, unitType, totalPages, section, hotelManagerSection } = this.state;

    const hotelsSection = (
      <div className="card" style={{ position: 'sticky', top: 120 }}>
        <div className="card-header">
          <h3 className="mb-0">
            { hotel.name.length ? hotel.name : 'Choose a Hotel' }
          </h3>
        </div>
        <div className="card-body">

          {/* If No Data */}
          { !hotel.name.length &&
              <p className="mb-0">Please, select a hotel from the list.</p>
          }

          {/* If Has Data */}
          <ul className={!hotel.name.length ? 'mb-0' : ''}>
            <li>
              { hotel.name && <p className="mb-xs"><b>Name:</b> {hotel.name}</p>}
            </li>
            {(hotel.address !== '0x0000000000000000000000000000000000000000' &&
                !loading) &&
                [
                  <li key={hotel.address}>
                    <p className="mb-xs">
                      <b>Address:</b> <Address address={hotel.address} web3={web3provider.web3}/>
                      <small className="text-muted"> <i className="fa fa-external-link" aria-hidden="true"></i></small>
                    </p>
                  </li>,
                  <li key={hotel.manager}>
                    <p className="mb-xs">
                      <b>Manager:</b> <Address address={hotel.manager} web3={web3provider.web3}/>
                      <small className="text-muted"> <i className="fa fa-external-link" aria-hidden="true"></i></small>
                    </p>
                  </li>,
                ]
            }
            {hotel.country &&
                <li>
                  <p className="mb-xs"><b>Country:</b> {hotel.country}</p>
                </li>
            }
            { hotel.lineOne &&
                <li>
                  <p className="mb-xs"><b>Address:</b> {hotel.lineOne}</p>
                </li>
            }
            {hotel.latitude && hotel.longitude &&
                <li><p className="mb-xs"><b>GPS:</b> {hotel.latitude} {hotel.longitude}</p></li>
            }
            {hotel.address !== '0x0000000000000000000000000000000000000000' &&
                !loading &&
                [
                  <li key="instant"><p className="mb-xs"><b>Instant Booking:</b> {hotel.waitConfirmation ? 'Yes' : 'No'}</p></li>,
                  <li key="totalUnits"><p><b>Total Units:</b> {hotel.totalUnits}</p></li>,
                  <li key="viewUnitTypes">
                    <div type="button" className="btn btn-sm btn-light" onClick={() => this.setState({ section: 'unitTypes' })} >
                      View Unit Types
                    </div>
                    <hr/>
                  </li>,
                ]
            }
          </ul>

          {/* Hotel Description */}
          {hotel.description
            ? <div className="lead">
              {hotel.description}
            </div>
            : <div></div>
          }

          {/* Hotel Images */}
          {hotel.images.length > 0 &&
              [
                <hr key="line" />,
                <div key="wrapper" className="col-sm-12 col-md-8 col-lg-6">
                  <Carousel showArrows={true} infiniteLoop={true} >
                    {
                      hotel.images.map(function (src, i) {
                        return <div key={hotel.address + 'Image' + i}><img src={src} /></div>;
                      })
                    }
                  </Carousel>
                </div>,
              ]
          }
        </div>
      </div>
    );

    var unitTypesSection = (
      <div className="card" style={{ position: 'sticky', top: 120 }}>
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-9">
              <h3 className="mb-0">{hotel.name + ': Unit types '}</h3>
            </div>
            <div className="col-3 text-right">
              <button title="Cancel" className="btn btn-light" onClick={() => this.setState({ section: 'hotels' })}>
                <i className="fa fa-arrow-left" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">

          <p>Choose a unit type to see its data.</p>

          <div className='row'>
            <div className='col-12 col-md-4'>
              <div className='list-group mb-3 mb-md-0'>
                {
                  hotel.unitTypes.map(hotelUnitType =>
                    <a
                      key={hotelUnitType.name}
                      className={`list-group-item list-group-item-action ${unitType.address === hotelUnitType.address ? 'active' : ''}`}
                      onClick={() => {
                        this.setState({ unitType: hotelUnitType, section: 'unitTypes' });
                      }
                      }
                    >
                      {hotelUnitType.name}
                    </a>
                  )
                }
              </div>
            </div>
            {unitType.address !== '0x0000000000000000000000000000000000000000'
              ? <div className='col-12 col-md-8'>
                <ul>
                  <li className="mb-xs"><b>Name:</b> {unitType.name}</li>
                  <li className="mb-xs"><b>Address:</b> <Address address={unitType.address} web3={web3provider.web3}/></li>
                  <li className="mb-xs"><b>Minimum Guests:</b> {unitType.info.minGuests}</li>
                  <li className="mb-xs"><b>Maximum Guests:</b> {unitType.info.maxGuests}</li>
                  <li className="mb-xs"><b>Default price:</b> {unitType.info.defaultPrice} {unitType.currencyCode}</li>
                  <li className="mb-xs"><b>Default Líf price:</b> {unitType.defaultLifPrice}</li>
                  <li className="mb-xs"><b>Instant Booking:</b> {hotel.waitConfirmation ? 'Yes' : 'No'}</li>
                  <li className="mb-xs"><b>Total Units:</b> {unitType.totalUnits}</li>
                </ul>
                <div type="button" className="btn btn-sm btn-light" onClick={() => this.setState({ section: 'units' })} >
                    View Units
                </div>
                {unitType.info.description
                  ? <div>
                    <hr></hr>
                    {unitType.info.description}
                  </div>
                  : <div></div>
                }
              </div>
              : <div></div>
            }
          </div>
          {unitType.images.length
            ? <div>
              <Carousel showArrows={true} infiniteLoop={true} >
                {
                  unitType.images.map((src, i) =>
                    <div key={`${unitType.address}Image${i}`}>
                      <img src={src} />
                    </div>
                  )
                }
              </Carousel>
            </div>
            : <div></div>
          }
        </div>
      </div>
    );

    const currencyOptions = [{ value: 'lif', label: 'Lif' }, { value: 'fiat', label: 'Fiat' }];

    const unitsSection = (
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-9">
              <h3 className="mb-0">{hotel.name + ': Units '}</h3>
            </div>
            <div className="col-3 text-right">
              <button title="Cancel" className="btn btn-light" onClick={() => this.setState({
                section: 'unitTypes',
                unitSelected: {
                  address: '0x0000000000000000000000000000000000000000',
                },
              })}>
                <i className="fa fa-arrow-left" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <div className='card-body'>
          <p>Choose a unit to see its data.</p>
          <div className='row'>
            <div className='col-12 col-md-4'>
              <div className='list-group mb-3 mb-md-0'>
                {hotel.units.map((unit, i) => {
                  if (this.state.unitType.name === unit.unitType) {
                    return <a
                      key={unit.address}
                      className={`list-group-item list-group-item-action ${unit.address === this.state.unitSelected.address ? 'active' : ''}`}
                      onClick={() => {
                        this.setState({ unitSelected: unit });
                      }
                      }
                    >
                      #{i + 1}
                    </a>;
                  }
                })}
              </div>
            </div>
            {this.state.unitSelected.address !== '0x0000000000000000000000000000000000000000'
              ? <div className='col-12 col-md-8'>
                {this.state.user.account !== '0x0000000000000000000000000000000000000000'
                  ? <div>
                    <BookUnit
                      waitConfirmation={hotel.waitConfirmation}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      bookLifPrice={this.state.bookLifPrice}
                      bookPrice={this.state.bookPrice}
                      available={this.state.unitAvailable}
                      currency={this.state.currency}
                      currencyOptions={currencyOptions}
                      onDatesChange={this.updateBookingPrice.bind(this)}
                      onCurrencyChange={(val) => this.setState({ currency: val })}
                      onSubmit={this.bookRoom.bind(this)}
                      unitAddress={this.state.unitSelected.address}
                      unitAvailability={this.state.unitAvailability}
                      getUnitAvailability={this.getUnitAvailability.bind(this)}
                    ></BookUnit>
                    <br/>
                    <p>
                      <b>Address: </b><Address address={this.state.unitSelected.address} web3={web3provider.web3}/>
                    </p>
                  </div>
                  : <Link to='/wallet'>Please create a wallet</Link>}
              </div>
              : <div></div>
            }
          </div>
        </div>
      </div>
    );

    return (
      <div className={'row justify-content-center ' + (this.state.loading ? 'loading' : '')}>
        <ToastContainer style={{ zIndex: 2000 }}/>
        <div className="col-sm-11">

          {/* Page Header */}
          <div className="row">
            <div className="col">
              <h1>Hotels registered in WT</h1>
              <p className="lead">Review the hotels data, including unit types and rooms.</p>
              <hr/>
            </div>
          </div>

          <div className="row">
            <div className="col">

              <div className="row d-block d-md-none">
                <div className="col">
                  <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                      <a className={'nav-link ' + (hotelManagerSection === 'hotels' ? 'active' : '')}
                        onClick={() => {
                          this.setState({ hotelManagerSection: 'hotels' });
                        }}>
                          Hotels
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className={'nav-link ' + (hotelManagerSection === 'detail' ? 'active' : '')}
                        onClick={() => {
                          this.setState({ hotelManagerSection: 'detail' });
                        }}>
                          Detail
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Hotels Menu */}
              <div className='row'>
                <div className={'col-md-4 col-lg-5 d-md-block ' + (hotelManagerSection === 'hotels' ? ' d-block col-12' : ' d-none')}>
                  <div className='list-group'>
                    {hotels && hotels.map((hotel, i) => {
                      const hotelIndex = ((hotelsPage - 1) * hotelsPerPage) + i + 1;
                      return <a
                        key={hotel.instance._address}
                        className={hotel.instance._address === hotel.address
                          ? 'list-group-item list-group-item-action active  text-ellipsis'
                          : 'list-group-item list-group-item-action  text-ellipsis'
                        }
                        onClick={() => {
                          this.loadHotelInfo(hotel.instance._address);
                          this.setState({ hotelManagerSection: 'detail' });
                        }}
                      >
                        <span className="list-group-item-number d-none d-lg-inline">{hotelIndex}</span> {hotel.name}
                      </a>;
                    })}
                  </div>
                  {totalPages > 0 &&
                      <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                          {hotelsPage > 1 &&
                            <li className="page-item" onClick={() => this.loadHotels(hotelsPage - 1)}>
                              <a className="page-link"><span className="fa fa-arrow-left"></span></a>
                            </li>
                          }
                          {
                            Array.apply(null, { length: totalPages }).map((x, i) => {
                              return (<li
                                key={i}
                                className={(hotelsPage === (i + 1)) ? 'page-item active' : 'page-item'}
                                onClick={() => this.loadHotels(i + 1)}
                              >
                                <a className="page-link" >{i + 1}</a>
                              </li>);
                            })
                          }
                          {hotelsPage < totalPages &&
                            <li className="page-item" onClick={() => this.loadHotels(hotelsPage + 1)}>
                              <a className="page-link"><span className="fa fa-arrow-right"></span></a>
                            </li>
                          }
                        </ul>
                      </nav>
                  }
                </div>

                <div className={'col-md-8 col-lg-7 d-md-block ' + (hotelManagerSection === 'detail' ? ' d-block col-12' : ' d-none')}>
                  { section === 'unitTypes'
                    ? unitTypesSection
                    : (section === 'units'
                      ? unitsSection
                      : hotelsSection)
                  }
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    );
  }
}
