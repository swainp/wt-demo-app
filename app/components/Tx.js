import React from 'react';
import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider || WEB3_PROVIDER));

export default class Tx extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hash: props.hash,
      network: 'main',
    };
  }

  async componentWillMount () {
    const networkType = await web3.eth.net.getNetworkType();
    this.setState({ network: networkType });
  }

  render () {
    return (
      <a
        href={'https://' + this.state.network + '.etherscan.io/tx/' + this.state.hash}
        target="_blank"
      >{this.state.hash}</a>
    );
  }
}
