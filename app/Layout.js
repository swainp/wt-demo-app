import React from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

export default class Layout extends React.Component {

	constructor() {
    super();
  }

	render() {
		return (
			<div>
				<Navbar></Navbar>
				<div class="container-fluid main-container">
					{this.props.children}
				</div>
				<Footer></Footer>
			</div>
		);
	}
}
