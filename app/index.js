import '../node_modules/react-dates/initialize';
// React ,router and history
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// Set history
const app = document.getElementById('app');

console.ignoredYellowBox = true;

// Set router
ReactDOM.render(
  <App />,
  app);
