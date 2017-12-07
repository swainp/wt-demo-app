import React from 'react';

export default class Address extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        address: props.address,
        web3: props.web3,
        network: 'main'
      }
    }

     async componentWillMount(){
      const networkType = await this.state.web3.eth.net.getNetworkType();
      this.setState({network: networkType});
    }

    render() {
      return(
        <a
          href={"https://"+this.state.network+".etherscan.io/address/"+this.state.address}
          target="_blank"
        >{this.state.address}</a>
      );
    }

}
