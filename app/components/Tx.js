import React from 'react';
import { web3provider } from '../services/web3provider';

export default class Tx extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hash: props.hash,
      network: 'main',
    };
  }

  async componentWillMount () {
    const networkType = await web3provider.web3.eth.net.getNetworkType();
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
