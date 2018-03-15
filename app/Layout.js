import React from 'react';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

export default class Layout extends React.Component {
  render () {
    return (
      <div>
        <Navbar pendingTxHashes={this.props.pendingTxHashes}></Navbar>
        <div className="container-fluid main-container">
          {this.props.children}
        </div>
        <Footer></Footer>
      </div>
    );
  }
}
