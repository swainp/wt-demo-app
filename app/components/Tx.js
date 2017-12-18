import React from 'react';

export default class Tx extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        hash: props.hash,
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
          href={"https://"+this.state.network+".etherscan.io/tx/"+this.state.hash}
          target="_blank"
        >{this.state.hash}</a>
      );
    }

}
