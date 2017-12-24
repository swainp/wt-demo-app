import '../node_modules/react-dates/initialize';
//React ,router and history
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history'

//Views
import Layout from "./Layout";
import Home from "./views/Home";
import Wallet from "./views/Wallet";
import Explorer from "./views/Explorer";
import Hotel from "./views/Hotel";
import Config from "./views/Config";
import Search from "./views/Search";

//CSS
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-select/dist/react-select.css';
import '../node_modules/react-dates/lib/css/_datepicker.css';
import '../node_modules/react-responsive-carousel/lib/styles/main.css';
import '../node_modules/react-responsive-carousel/lib/styles/carousel.css';
import './styles/main.css';

//Set history
const app = document.getElementById('app');

console.ignoredYellowBox = true;

//Set router
ReactDOM.render(
  <HashRouter>
    <Layout>
      <Switch>
        <Route exact path="/" component={Home}></Route>
        <Route path="/wallet" component={Wallet}></Route>
        <Route path="/explorer" component={Explorer}></Route>
        <Route path="/hotel" component={Hotel}></Route>
        <Route path="/config" component={Config}></Route>
        <Route path="/search" component={Search}></Route>
      </Switch>
    </Layout>
  </HashRouter>,
app);
