import '../node_modules/react-dates/initialize';
// React ,router and history
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// CSS
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-select/dist/react-select.css';
import '../node_modules/react-dates/lib/css/_datepicker.css';
import '../node_modules/react-responsive-carousel/lib/styles/main.css';
import '../node_modules/react-responsive-carousel/lib/styles/carousel.css';
import './styles/main.css';

// Set history
const app = document.getElementById('app');

console.ignoredYellowBox = true;

// Set router
ReactDOM.render(
  <App />,
  app);
